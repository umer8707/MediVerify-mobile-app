import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { mockTraceability } from '../data/mockData';

type TraceabilityRouteProp = RouteProp<RootStackParamList, 'Traceability'>;

export default function TraceabilityScreen() {
  const route = useRoute<TraceabilityRouteProp>();
  const { medicine } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Product Journey</Text>
        <Text style={styles.subtitle}>
          This product's journey is securely tracked.
        </Text>
      </View>

      <View style={styles.timeline}>
        {mockTraceability.map((step, index) => (
          <View key={step.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>{step.icon}</Text>
              </View>
              {index < mockTraceability.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.stageName}>{step.stage}</Text>
              <Text style={styles.location}>{step.location}</Text>
              <Text style={styles.date}>{step.date}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={20} color="#34C759" />
        <Text style={styles.infoText}>
          All stages are verified and recorded on the blockchain.
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 8,
    minHeight: 40,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 8,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    lineHeight: 20,
  },
});

