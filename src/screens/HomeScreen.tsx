import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { RootStackParamList } from '../navigation/AppNavigator';
import ScanHistoryCard from '../components/ScanHistoryCard';
import { verifyQRCode, VerifyQRResponse } from '../api/verifyService';
import { Medicine } from '../types';

const SCAN_HISTORY_KEY = 'scan_history';

function resultToMedicine(result: VerifyQRResponse, qrValue: string): Medicine {
  const statusMap = {
    GENUINE: 'genuine' as const,
    ALREADY_SCANNED: 'duplicate' as const,
    INVALID: 'counterfeit' as const,
  };
  return {
    id: Date.now().toString(),
    name: (result.product_name as string | undefined) ?? 'Unknown',
    batchId: (result.batch_number as string | undefined) ?? '—',
    manufacturer: (result.batch_number as string | undefined) ?? '—',
    manufacturingDate: (result.manufacturing_date as string | undefined) ?? new Date().toISOString(),
    expiryDate: (result.expiry_date as string | undefined) ?? new Date().toISOString(),
    status: statusMap[result.verification_result] ?? 'counterfeit',
    scanDate: new Date().toISOString(),
    qrCode: qrValue,
  };
}

async function loadScanHistory(): Promise<Medicine[]> {
  const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function prependToHistory(entry: Medicine): Promise<void> {
  const history = await loadScanHistory();
  history.unshift(entry);
  await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recentScans, setRecentScans] = useState<Medicine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanCity, setScanCity] = useState('Unknown');
  const [scanCountry, setScanCountry] = useState('Unknown');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [userRole, setUserRole] = useState<string | null>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    loadScanHistory().then((h) => setRecentScans(h.slice(0, 3)));
    AsyncStorage.getItem('user_role').then(setUserRole);
  }, []);

  // Reset scanned flag when camera closes
  useEffect(() => {
    if (!cameraOpen) {
      scannedRef.current = false;
    }
  }, [cameraOpen]);

  const handleScanQR = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan QR codes.',
        );
        return;
      }
    }

    setCameraOpen(true);

    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      return Location.getCurrentPositionAsync({}).then(pos =>
        Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      ).then(geocode => {
        const g = geocode[0];
        setScanCity(g?.city ?? g?.subregion ?? 'Unknown');
        setScanCountry(g?.country ?? 'Unknown');
      });
    }).catch(() => {});
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Prevent multiple scans firing at once
    if (scannedRef.current || scanning) return;
    scannedRef.current = true;

    setCameraOpen(false);
    setScanning(true);

    const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

    try {
      const result = await verifyQRCode(data, scanCity, scanCountry, deviceType);
      const entry = resultToMedicine(result, data);
      await prependToHistory(entry);
      setRecentScans((prev) => [entry, ...prev].slice(0, 3));
      navigation.navigate('ScanResult', { verifyResult: result, qrCodeValue: data });
    } catch (e) {
      Alert.alert(
        'Verification Failed',
        e instanceof Error ? e.message : 'Please try again.',
      );
    } finally {
      setScanning(false);
    }
  };

  const handleChatbot = () => {
    navigation.navigate('MainTabs', { screen: 'Chatbot' } as any);
  };

  const handleViewDetails = (medicine: Medicine) => {
    navigation.navigate('ScanResult', { medicine });
  };

  return (
    <>
      {/* Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide" onRequestClose={() => setCameraOpen(false)}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          {/* Overlay with scan frame */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>Point camera at QR code</Text>
          </View>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setCameraOpen(false)}>
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.subtitle}>Verify your medicines safely</Text>
        </View>

        {userRole === 'DISTRIBUTOR' ? (
          <View style={[styles.infoCard, { marginBottom: 24, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cube-outline" size={22} color="#007AFF" />
              <Text style={[styles.infoCardText, { fontWeight: '600', color: '#007AFF' }]}>
                Batch Dispatch Mode
              </Text>
            </View>
            <Text style={[styles.infoCardText, { color: '#636366' }]}>
              Distributors dispatch batches — not scan QR codes. Go to My Stock to dispatch to pharmacies.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanQR}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <>
                <Ionicons name="qr-code-outline" size={48} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
                <Text style={styles.scanButtonSubtext}>Tap to verify medicine</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.length > 0 ? (
            recentScans.map((medicine) => (
              <ScanHistoryCard
                key={medicine.id}
                medicine={medicine}
                onPress={() => handleViewDetails(medicine)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="scan-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No scans yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Scan a QR code to get started
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.chatButton} onPress={handleChatbot}>
          <Ionicons name="chatbubbles-outline" size={24} color="#007AFF" />
          <Text style={styles.chatButtonText}>Chat with Assistant</Text>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
          <Text style={styles.infoCardText}>
            All scan activity is securely recorded.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  scanButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 4,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chatButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});
