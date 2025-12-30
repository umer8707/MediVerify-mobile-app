import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={['#007AFF', '#0051D5']}
      style={styles.container}
    >
      <Ionicons name="shield-checkmark" size={80} color="#FFFFFF" />
      <Text style={styles.logoText}>MediVerify</Text>
      <Text style={styles.tagline}>Verify Medicines. Protect Lives.</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 10,
    opacity: 0.9,
  },
  loader: {
    marginTop: 40,
  },
});

