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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScanResultRouteProp = RouteProp<RootStackParamList, 'ScanResult'>;

export default function ScanResultScreen() {
  const route = useRoute<ScanResultRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { medicine } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <Text style={styles.infoValue}>
              {formatDate(medicine.manufacturingDate)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Expiry Date</Text>
            <Text style={styles.infoValue}>
              {formatDate(medicine.expiryDate)}
            </Text>
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

      <TouchableOpacity
        style={styles.traceButton}
        onPress={() => navigation.navigate('Traceability', { medicine })}
      >
        <Ionicons name="map-outline" size={20} color="#007AFF" />
        <Text style={styles.traceButtonText}>View Traceability</Text>
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </TouchableOpacity>
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
});

