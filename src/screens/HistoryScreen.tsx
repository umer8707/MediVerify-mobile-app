import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Medicine } from '../types';
import ScanHistoryCard from '../components/ScanHistoryCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SCAN_HISTORY_KEY = 'scan_history';

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<Medicine[]>([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(SCAN_HISTORY_KEY).then((raw) => {
        setHistory(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  const handleViewDetails = (medicine: Medicine) => {
    navigation.navigate('ScanResult', { medicine });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>
          View all your verified medicines
        </Text>
      </View>

      {history.length > 0 ? (
        history.map((medicine) => (
          <ScanHistoryCard
            key={medicine.id}
            medicine={medicine}
            onPress={() => handleViewDetails(medicine)}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateText}>No scan history</Text>
          <Text style={styles.emptyStateSubtext}>
            Start scanning medicines to see your history here
          </Text>
        </View>
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
  },
});
