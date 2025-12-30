import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { generateMockMedicine } from '../data/mockData';
import ScanHistoryCard from '../components/ScanHistoryCard';
import { mockMedicines } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recentScans] = useState(mockMedicines.slice(0, 3));

  const handleScanQR = () => {
    // Simulate QR scan
    const mockQR = `QR-${Date.now()}`;
    const medicine = generateMockMedicine(mockQR);
    
    navigation.navigate('ScanResult', { medicine });
  };

  const handleChatbot = () => {
    navigation.navigate('MainTabs', {
      screen: 'Chatbot',
    } as any);
  };

  const handleViewDetails = (medicine: typeof mockMedicines[0]) => {
    navigation.navigate('ScanResult', { medicine });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, User</Text>
        <Text style={styles.subtitle}>Verify your medicines safely</Text>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
        <Ionicons name="qr-code-outline" size={48} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
        <Text style={styles.scanButtonSubtext}>Tap to verify medicine</Text>
      </TouchableOpacity>

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
});

