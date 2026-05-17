import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authFetch } from '../api/apiHelper';

interface StockItem {
  batch_id: string;
  batch_number: string;
  product_name: string;
  expiry_date: string;
  batch_status: string;
  quantity_received: number;
  quantity_sent: number;
  quantity_on_hand: number;
}

interface PharmacyOption {
  id: string;
  name: string;
}

export default function MyStockScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatchBatch, setDispatchBatch] = useState<StockItem | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyOption[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [dispatchQty, setDispatchQty] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      const res = await authFetch('/inventory');
      if (res.ok) {
        const data = await res.json();
        setStock(Array.isArray(data) ? data : []);
      } else {
        setStock([]);
      }
    } catch {
      setStock([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const init = async () => {
        setLoading(true);
        const userRole = await AsyncStorage.getItem('user_role');
        if (active) setRole(userRole);
        if (userRole === 'DISTRIBUTOR' || userRole === 'PHARMACY') {
          await fetchStock();
        }
        if (active) setLoading(false);
      };
      init();
      return () => { active = false; };
    }, [fetchStock])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStock();
    setRefreshing(false);
  };

  const openDispatchModal = async (item: StockItem) => {
    setDispatchBatch(item);
    setSelectedPharmacy('');
    setDispatchQty('');
    setDispatchNotes('');
    try {
      const res = await authFetch('/pharmacies');
      if (res.ok) {
        const data = await res.json();
        const approved = (Array.isArray(data) ? data : [])
          .filter((p: any) => p.approval_status === 'APPROVED')
          .map((p: any) => ({ id: p.user?.id, name: p.pharmacy_name }));
        setPharmacies(approved);
      }
    } catch {
      setPharmacies([]);
    }
    setDispatchModal(true);
  };

  const handleDispatch = async () => {
    if (!dispatchBatch || !selectedPharmacy) {
      Alert.alert('Error', 'Please select a pharmacy.');
      return;
    }
    const qty = parseInt(dispatchQty, 10);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Enter a valid quantity.');
      return;
    }
    if (qty > dispatchBatch.quantity_on_hand) {
      Alert.alert('Error', `Cannot dispatch more than on-hand quantity (${dispatchBatch.quantity_on_hand}).`);
      return;
    }
    setDispatching(true);
    try {
      const res = await authFetch(`/batches/${dispatchBatch.batch_id}/dispatch`, {
        method: 'POST',
        body: JSON.stringify({ dispatched_to: selectedPharmacy, quantity: qty, notes: dispatchNotes }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', `${qty} units dispatched successfully.`);
        setDispatchModal(false);
        await fetchStock();
      } else {
        Alert.alert('Error', data.error || 'Dispatch failed.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (role !== 'DISTRIBUTOR' && role !== 'PHARMACY') {
    return (
      <View style={styles.centered}>
        <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
        <Text style={styles.emptyTitle}>Stock Not Available</Text>
        <Text style={styles.emptyText}>My Stock is only available for distributors and pharmacies.</Text>
      </View>
    );
  }

  const isDistributor = role === 'DISTRIBUTOR';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stock</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {stock.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No Stock Yet</Text>
          <Text style={styles.emptyText}>
            {isDistributor
              ? 'No stock has been dispatched to you yet.'
              : 'No medicines have been received yet.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {stock.map(item => {
            const isRecalled = item.batch_status === 'RECALLED';
            const isExpiringSoon = (() => {
              const exp = new Date(item.expiry_date);
              const now = new Date();
              const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return daysLeft <= 30 && daysLeft > 0;
            })();
            const isExpired = new Date(item.expiry_date) < new Date();
            return (
              <View key={item.batch_id} style={[styles.card, isRecalled && styles.cardRecalled]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.product_name}</Text>
                  {isRecalled && (
                    <View style={styles.badgeRed}>
                      <Text style={styles.badgeText}>RECALLED</Text>
                    </View>
                  )}
                  {!isRecalled && isExpired && (
                    <View style={styles.badgeGray}>
                      <Text style={styles.badgeText}>EXPIRED</Text>
                    </View>
                  )}
                  {!isRecalled && !isExpired && isExpiringSoon && (
                    <View style={styles.badgeOrange}>
                      <Text style={styles.badgeText}>EXPIRING SOON</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.batchNum}>Batch: {item.batch_number}</Text>
                <Text style={styles.detail}>Expiry: {item.expiry_date}</Text>

                <View style={styles.qtyRow}>
                  <View style={styles.qtyItem}>
                    <Text style={styles.qtyValue}>{item.quantity_received}</Text>
                    <Text style={styles.qtyLabel}>Received</Text>
                  </View>
                  {isDistributor && (
                    <View style={styles.qtyItem}>
                      <Text style={styles.qtyValue}>{item.quantity_sent}</Text>
                      <Text style={styles.qtyLabel}>Sent</Text>
                    </View>
                  )}
                  <View style={[styles.qtyItem, styles.qtyOnHand]}>
                    <Text style={[styles.qtyValue, styles.qtyOnHandText]}>{item.quantity_on_hand}</Text>
                    <Text style={styles.qtyLabel}>On Hand</Text>
                  </View>
                </View>

                {isDistributor && !isRecalled && !isExpired && item.quantity_on_hand > 0 && (
                  <TouchableOpacity style={styles.dispatchBtn} onPress={() => openDispatchModal(item)}>
                    <Ionicons name="arrow-forward-circle-outline" size={16} color="#fff" />
                    <Text style={styles.dispatchBtnText}>Dispatch to Pharmacy</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Dispatch Modal */}
      <Modal visible={dispatchModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dispatch to Pharmacy</Text>
            {dispatchBatch && (
              <Text style={styles.modalSubtitle}>{dispatchBatch.product_name} — {dispatchBatch.batch_number} ({dispatchBatch.quantity_on_hand} on hand)</Text>
            )}

            <Text style={styles.label}>Select Pharmacy</Text>
            <ScrollView style={styles.pharmacyList} nestedScrollEnabled>
              {pharmacies.length === 0 ? (
                <Text style={styles.emptyText}>No approved pharmacies available.</Text>
              ) : (
                pharmacies.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPharmacy(p.id)}
                    style={[styles.pharmacyOption, selectedPharmacy === p.id && styles.pharmacyOptionSelected]}
                  >
                    <Text style={[styles.pharmacyOptionText, selectedPharmacy === p.id && styles.pharmacyOptionTextSelected]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
              value={dispatchQty}
              onChangeText={setDispatchQty}
              placeholder="Enter quantity"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={dispatchNotes}
              onChangeText={setDispatchNotes}
              placeholder="Optional notes"
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDispatchModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDispatch} disabled={dispatching}>
                {dispatching ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Dispatch</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  refreshBtn: { padding: 4 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRecalled: { opacity: 0.7, borderWidth: 1, borderColor: '#FF3B30' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1 },
  batchNum: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  detail: { fontSize: 13, color: '#8E8E93', marginBottom: 12 },
  badgeRed: { backgroundColor: '#FF3B30', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeOrange: { backgroundColor: '#FF9500', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeGray: { backgroundColor: '#8E8E93', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  qtyItem: { flex: 1, alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 10 },
  qtyOnHand: { backgroundColor: '#E8F5E9' },
  qtyValue: { fontSize: 20, fontWeight: '700', color: '#000' },
  qtyOnHandText: { color: '#34C759' },
  qtyLabel: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
  dispatchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 10 },
  dispatchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#8E8E93', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#3C3C43', marginBottom: 6, marginTop: 12 },
  pharmacyList: { maxHeight: 150, marginBottom: 4 },
  pharmacyOption: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA', marginBottom: 6 },
  pharmacyOptionSelected: { borderColor: '#007AFF', backgroundColor: '#EBF5FF' },
  pharmacyOptionText: { fontSize: 14, color: '#000' },
  pharmacyOptionTextSelected: { color: '#007AFF', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', backgroundColor: '#F9F9F9' },
  inputMultiline: { height: 64, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#3C3C43' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#007AFF', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
