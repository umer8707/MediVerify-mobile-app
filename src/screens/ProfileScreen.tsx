import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface UserInfo {
  role: string;
  fullName: string;
  email: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<UserInfo | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet(['access_token', 'user_role', 'user_full_name', 'user_email']).then(
        (pairs) => {
          const token = pairs[0][1];
          const role = pairs[1][1];
          const fullName = pairs[2][1] ?? '';
          const email = pairs[3][1] ?? '';
          if (token && role && (role === 'PHARMACY' || role === 'DISTRIBUTOR')) {
            setUser({ role, fullName, email });
          } else {
            setUser(null);
          }
        }
      );
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'user_role',
            'user_full_name',
            'user_email',
            'chat_messages',
            'chat_history',
          ]);
          setUser(null);
        },
      },
    ]);
  };

  if (user) {
    const isPharmacy = user.role === 'PHARMACY';
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name={isPharmacy ? 'medkit' : 'cube'} size={36} color="#007AFF" />
          </View>
          <Text style={styles.name}>{user.fullName || (isPharmacy ? 'Pharmacy' : 'Distributor')}</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{isPharmacy ? 'Pharmacy' : 'Distributor'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionItem}>
            <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
            <View style={styles.sectionItemContent}>
              <Text style={styles.sectionItemTitle}>Privacy & Safety</Text>
              <Text style={styles.sectionItemSubtitle}>Your data is encrypted and secure</Text>
            </View>
          </View>
          <View style={styles.sectionItem}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <View style={styles.sectionItemContent}>
              <Text style={styles.sectionItemTitle}>App Version</Text>
              <Text style={styles.sectionItemSubtitle}>1.0.0</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MediVerify - Blockchain Medicine Verification</Text>
          <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    );
  }

  // Not logged in — show 3 role cards
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#007AFF" />
        </View>
        <Text style={styles.name}>Who are you?</Text>
        <Text style={styles.subtitle}>Select your role to get started</Text>
      </View>

      {/* Pharmacy */}
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => navigation.navigate('Login', { expectedRole: 'PHARMACY' })}
      >
        <View style={[styles.roleIcon, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="medkit" size={28} color="#007AFF" />
        </View>
        <View style={styles.roleCardContent}>
          <Text style={styles.roleCardTitle}>Pharmacy</Text>
          <Text style={styles.roleCardSub}>Login to access scan logs and your profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      </TouchableOpacity>

      {/* Distributor */}
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => navigation.navigate('Login', { expectedRole: 'DISTRIBUTOR' })}
      >
        <View style={[styles.roleIcon, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="cube" size={28} color="#34A853" />
        </View>
        <View style={styles.roleCardContent}>
          <Text style={styles.roleCardTitle}>Distributor</Text>
          <Text style={styles.roleCardSub}>Login to access scan logs and your profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      </TouchableOpacity>

      {/* Customer */}
      <View style={[styles.roleCard, styles.roleCardActive]}>
        <View style={[styles.roleIcon, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="person-circle" size={28} color="#FF9500" />
        </View>
        <View style={styles.roleCardContent}>
          <Text style={styles.roleCardTitle}>Customer</Text>
          <Text style={styles.roleCardSub}>No login needed — scan medicines and use the chatbot freely</Text>
        </View>
        <View style={styles.activeChip}>
          <Text style={styles.activeChipText}>Active</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Pharmacies and distributors must be registered and approved by an administrator before logging in.
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionItem}>
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <View style={styles.sectionItemContent}>
            <Text style={styles.sectionItemTitle}>Privacy & Safety</Text>
            <Text style={styles.sectionItemSubtitle}>Your data is encrypted and secure</Text>
          </View>
        </View>
        <View style={styles.sectionItem}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={styles.sectionItemContent}>
            <Text style={styles.sectionItemTitle}>App Version</Text>
            <Text style={styles.sectionItemSubtitle}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.sectionItem}>
          <Ionicons name="help-circle" size={24} color="#007AFF" />
          <View style={styles.sectionItemContent}>
            <Text style={styles.sectionItemTitle}>Help & Support</Text>
            <Text style={styles.sectionItemSubtitle}>Get assistance with the app</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MediVerify - Blockchain Medicine Verification</Text>
        <Text style={styles.footerSubtext}>© 2024 All rights reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '600', color: '#000', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8E8E93' },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  roleCardActive: {
    borderColor: '#FF9500',
    backgroundColor: '#FFFBF2',
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleCardContent: { flex: 1 },
  roleCardTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 3 },
  roleCardSub: { fontSize: 12, color: '#8E8E93', lineHeight: 17 },
  activeChip: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeChipText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  note: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionItemContent: { flex: 1, marginLeft: 16 },
  sectionItemTitle: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 4 },
  sectionItemSubtitle: { fontSize: 14, color: '#8E8E93' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF0EE',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD0CC',
  },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  footerSubtext: { fontSize: 10, color: '#C7C7CC' },
});
