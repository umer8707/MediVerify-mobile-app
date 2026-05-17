import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import StatusBadge from '../components/StatusBadge';
import { Medicine } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScanResultRouteProp = RouteProp<RootStackParamList, 'ScanResult'>;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ScanResultScreen() {
  const route = useRoute<ScanResultRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { medicine, verifyResult, qrCodeValue } = route.params;

  // --- API verification result (from QR scan) ---
  if (verifyResult) {
    const result = verifyResult.verification_result;
    const productName = verifyResult.product_name as string | undefined;
    const batchNumber = verifyResult.batch_number as string | undefined;
    const manufacturingDate = verifyResult.manufacturing_date as string | undefined;
    const expiryDate = verifyResult.expiry_date as string | undefined;

    if (result === 'GENUINE') {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={[styles.resultBanner, styles.genuineBanner]}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            <Text style={[styles.resultTitle, styles.genuineText]}>Genuine Product</Text>
            <Text style={styles.resultSubtitle}>This product has been verified successfully.</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="medical-outline" size={24} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Medicine Name</Text>
                <Text style={styles.infoValue}>{productName ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="barcode-outline" size={24} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Batch Number</Text>
                <Text style={styles.infoValue}>{batchNumber ?? '—'}</Text>
              </View>
            </View>
            {manufacturingDate != null && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Manufacturing Date</Text>
                    <Text style={styles.infoValue}>{formatDate(manufacturingDate)}</Text>
                  </View>
                </View>
              </>
            )}
            {expiryDate != null && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={24} color="#007AFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Expiry Date</Text>
                    <Text style={styles.infoValue}>{formatDate(expiryDate)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {(qrCodeValue ?? verifyResult?.qr_code_value) ? (
            <TouchableOpacity
              style={styles.traceButton}
              onPress={() => navigation.navigate('Traceability', {
                qrCodeValue: (qrCodeValue ?? verifyResult?.qr_code_value) as string,
                productName: productName,
              })}
            >
              <Ionicons name="git-branch-outline" size={22} color="#007AFF" />
              <Text style={styles.traceButtonText}>View Product Journey</Text>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      );
    }

    if (result === 'ALREADY_SCANNED') {
      const pharmacyDetails = verifyResult?.pharmacy_details as
        | { pharmacy_name?: string; city?: string; dispensed_at?: string }
        | undefined;
      const dispensedTime = pharmacyDetails?.dispensed_at
        ? new Date(pharmacyDetails.dispensed_at).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })
        : null;

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={[styles.resultBanner, styles.genuineBanner]}>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" />
            <Text style={[styles.resultTitle, styles.genuineText]}>Product Already Sold</Text>
            <Text style={styles.resultSubtitle}>
              This QR code has been dispensed. The product is authentic.
            </Text>
          </View>

          {pharmacyDetails && (
            <View style={styles.firstScanCard}>
              <View style={styles.firstScanHeader}>
                <Ionicons name="storefront-outline" size={20} color="#007AFF" />
                <Text style={[styles.firstScanTitle, { color: '#007AFF' }]}>Dispensed By Pharmacy</Text>
              </View>
              {pharmacyDetails.pharmacy_name ? (
                <View style={styles.firstScanRow}>
                  <Ionicons name="business-outline" size={16} color="#8E8E93" />
                  <Text style={styles.firstScanValue}>{pharmacyDetails.pharmacy_name}</Text>
                </View>
              ) : null}
              {pharmacyDetails.city ? (
                <View style={styles.firstScanRow}>
                  <Ionicons name="location-outline" size={16} color="#8E8E93" />
                  <Text style={styles.firstScanValue}>{pharmacyDetails.city}</Text>
                </View>
              ) : null}
              {dispensedTime ? (
                <View style={styles.firstScanRow}>
                  <Ionicons name="time-outline" size={16} color="#8E8E93" />
                  <Text style={styles.firstScanValue}>{dispensedTime}</Text>
                </View>
              ) : null}
            </View>
          )}

          {(qrCodeValue ?? verifyResult?.qr_code_value) ? (
            <TouchableOpacity
              style={styles.traceButton}
              onPress={() => navigation.navigate('Traceability', {
                qrCodeValue: (qrCodeValue ?? verifyResult?.qr_code_value) as string,
                productName: productName,
              })}
            >
              <Ionicons name="git-branch-outline" size={22} color="#007AFF" />
              <Text style={styles.traceButtonText}>View Product Journey</Text>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      );
    }

    // INVALID
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={[styles.resultBanner, styles.errorBanner]}>
          <Ionicons name="close-circle" size={64} color="#FF3B30" />
          <Text style={[styles.resultTitle, styles.errorText]}>Invalid QR Code</Text>
          <Text style={styles.resultSubtitle}>
            The QR code was not found in our system. Please check and try again.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // --- Legacy: medicine from history ---
  if (!medicine) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusContainer}>
        <StatusBadge status={medicine.status} />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="medical-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Medicine Name</Text>
            <Text style={styles.infoValue}>{medicine.name}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Batch ID</Text>
            <Text style={styles.infoValue}>{medicine.batchId}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Manufacturer</Text>
            <Text style={styles.infoValue}>{medicine.manufacturer}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Manufacturing Date</Text>
            <Text style={styles.infoValue}>{formatDate(medicine.manufacturingDate)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Expiry Date</Text>
            <Text style={styles.infoValue}>{formatDate(medicine.expiryDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.messageCard}>
        <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.messageText}>
          This verification is performed against blockchain-registered records.
        </Text>
      </View>

      <View style={styles.dashboardNote}>
        <Ionicons name="globe-outline" size={16} color="#8E8E93" />
        <Text style={styles.dashboardNoteText}>
          Scan results are visible to manufacturers via the web dashboard.
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
  resultBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  genuineBanner: {
    backgroundColor: '#E8F5E9',
  },
  warningBanner: {
    backgroundColor: '#FFEBEE',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  genuineText: {
    color: '#34C759',
  },
  warningText: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  statusContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 40,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
  dashboardNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dashboardNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  traceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  traceButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 12,
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  blockchainBadgeGreen: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  blockchainBadgeRed: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  blockchainBadgeGrey: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  blockchainBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  blockchainTxHash: {
    fontSize: 11,
    color: '#4CAF50',
    fontFamily: 'monospace' as const,
    marginTop: 2,
  },
  firstScanCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCCBC',
  },
  firstScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  firstScanTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
  },
  firstScanNote: {
    fontSize: 13,
    color: '#5D4037',
    marginBottom: 10,
  },
  firstScanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  firstScanValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E2723',
  },
});
