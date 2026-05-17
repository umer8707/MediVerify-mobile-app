import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../api/config';

type Role = 'PHARMACY' | 'DISTRIBUTOR';

function extractError(data: any): string {
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data.error === 'string') return data.error;
  if (typeof data.detail === 'string') return data.detail;
  // DRF serializer errors: { field: ["msg", ...], ... }
  const messages: string[] = [];
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val)) {
      val.forEach((v) => messages.push(typeof v === 'string' ? v : JSON.stringify(v)));
    } else if (typeof val === 'string') {
      messages.push(val);
    }
  }
  return messages.length > 0 ? messages.join('\n') : 'Something went wrong. Please try again.';
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [role, setRole] = useState<Role>('PHARMACY');
  const [step, setStep] = useState<'account' | 'profile' | 'done'>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile fields
  const [entityName, setEntityName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const [accessToken, setAccessToken] = useState('');

  const handleAccountNext = async () => {
    setError('');
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(extractError(data));
        return;
      }
      setAccessToken(data.tokens?.access || '');
      setStep('profile');
    } catch {
      setError('Network error. Make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    setError('');
    if (!entityName.trim() || !licenseNumber.trim() || !city.trim() || !country.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const endpoint =
      role === 'PHARMACY' ? '/pharmacy/register' : '/distributor/register';
    const body =
      role === 'PHARMACY'
        ? { pharmacy_name: entityName.trim(), license_number: licenseNumber.trim(), city: city.trim(), country: country.trim() }
        : { company_name: entityName.trim(), license_number: licenseNumber.trim(), city: city.trim(), country: country.trim() };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(extractError(data));
        return;
      }
      setStep('done');
    } catch {
      setError('Network error. Make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <View style={styles.doneContainer}>
        <Ionicons name="checkmark-circle" size={72} color="#34C759" />
        <Text style={styles.doneTitle}>Registration Submitted</Text>
        <Text style={styles.doneText}>
          Your {role === 'PHARMACY' ? 'pharmacy' : 'distributor'} account is pending admin
          approval. You will be able to log in once approved.
        </Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Partner Registration</Text>
        <Text style={styles.subtitle}>
          {step === 'account' ? 'Create your account' : 'Enter your organisation details'}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#D32F2F" style={{ marginRight: 8, flexShrink: 0 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {step === 'account' && (
          <>
            <Text style={styles.label}>Register as</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'PHARMACY' && styles.roleBtnActive]}
                onPress={() => { setRole('PHARMACY'); setError(''); }}
              >
                <Ionicons name="medkit" size={18} color={role === 'PHARMACY' ? '#fff' : '#007AFF'} />
                <Text style={[styles.roleBtnText, role === 'PHARMACY' && styles.roleBtnTextActive]}>
                  Pharmacy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, role === 'DISTRIBUTOR' && styles.roleBtnActive]}
                onPress={() => { setRole('DISTRIBUTOR'); setError(''); }}
              >
                <Ionicons name="cube" size={18} color={role === 'DISTRIBUTOR' ? '#fff' : '#007AFF'} />
                <Text style={[styles.roleBtnText, role === 'DISTRIBUTOR' && styles.roleBtnTextActive]}>
                  Distributor
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={fullName}
              onChangeText={(v) => { setFullName(v); setError(''); }}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(v) => { setConfirmPassword(v); setError(''); }}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAccountNext}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 'profile' && (
          <>
            <Text style={styles.label}>
              {role === 'PHARMACY' ? 'Pharmacy Name' : 'Company Name'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={role === 'PHARMACY' ? 'e.g. City Pharmacy' : 'e.g. MedDist Ltd'}
              value={entityName}
              onChangeText={(v) => { setEntityName(v); setError(''); }}
            />

            <Text style={styles.label}>License Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Your official license number"
              value={licenseNumber}
              onChangeText={(v) => { setLicenseNumber(v); setError(''); }}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lahore"
              value={city}
              onChangeText={(v) => { setCity(v); setError(''); }}
            />

            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pakistan"
              value={country}
              onChangeText={(v) => { setCountry(v); setError(''); }}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleProfileSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Registration</Text>}
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.note}>
          Your registration will be reviewed by a system administrator before you can access the platform.
        </Text>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBold}>Login here</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingBottom: 48 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { color: '#007AFF', fontSize: 16, marginLeft: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: { flex: 1, fontSize: 13, color: '#D32F2F', lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '500', color: '#3C3C43', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  roleBtnActive: { backgroundColor: '#007AFF' },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  roleBtnTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#8E8E93' },
  loginLinkBold: { color: '#007AFF', fontWeight: '600' },
  doneContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  doneTitle: { fontSize: 22, fontWeight: '700', color: '#000', marginTop: 20, marginBottom: 12 },
  doneText: {
    fontSize: 15,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
