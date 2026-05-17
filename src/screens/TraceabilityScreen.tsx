import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_BASE_URL } from '../api/config';

type TraceabilityRouteProp = RouteProp<RootStackParamList, 'Traceability'>;

interface TraceStage {
  stage: string;
  role: string;
  completed: boolean;
  status: 'completed' | 'skipped' | 'pending';
  timestamp: string | null;
  location: string | null;
  actor: string | null;
}

interface TraceData {
  product_name?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  suspicious?: boolean;
  suspicious_reason?: string;
  stages: TraceStage[];
}

const ROLE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  MANUFACTURER: { icon: 'business',        color: '#007AFF', bg: '#E3F2FD' },
  DISTRIBUTOR:  { icon: 'cube',            color: '#FF9500', bg: '#FFF3E0' },
  PHARMACY:     { icon: 'medkit',          color: '#34C759', bg: '#E8F5E9' },
  CONSUMER:     { icon: 'person-circle',   color: '#AF52DE', bg: '#F3E5F5' },
};

function formatTimestamp(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function TraceabilityScreen() {
  const route = useRoute<TraceabilityRouteProp>();
  const { qrCodeValue, productName } = route.params;

  const [data, setData] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/verify/qr/trace?qr=${encodeURIComponent(qrCodeValue)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json as TraceData);
        }
      })
      .catch(() => setError('Failed to load traceability data.'))
      .finally(() => setLoading(false));
  }, [qrCodeValue]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Product Journey</Text>
        <Text style={styles.productName}>{data?.product_name ?? productName ?? '—'}</Text>
        {data?.batch_number ? (
          <Text style={styles.batchText}>Batch: {data.batch_number}</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading supply chain data…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {data?.suspicious && (
            <View style={styles.suspiciousBanner}>
              <Ionicons name="warning" size={22} color="#B71C1C" style={{ marginRight: 10, flexShrink: 0 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suspiciousTitle}>Suspicious Supply Chain</Text>
                <Text style={styles.suspiciousReason}>{data.suspicious_reason}</Text>
              </View>
            </View>
          )}

          <View style={styles.timeline}>
            {(data?.stages ?? []).map((stage, index, arr) => {
              const cfg = ROLE_CONFIG[stage.role] ?? ROLE_CONFIG.CONSUMER;
              const isLast = index === arr.length - 1;
              const status = stage.status ?? (stage.completed ? 'completed' : 'pending');

              const iconColor =
                status === 'completed' ? cfg.color :
                status === 'skipped'   ? '#FF6B00' : '#C7C7CC';
              const iconBg =
                status === 'completed' ? cfg.bg :
                status === 'skipped'   ? '#FFF0E0' : '#F2F2F7';
              const connectorColor =
                status === 'completed' ? '#D0D0D0' : '#EFEFEF';

              return (
                <View key={stage.role} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: iconBg },
                      status !== 'pending' && styles.iconCircleActive]}>
                      <Ionicons
                        name={status === 'skipped' ? 'alert-circle' : cfg.icon}
                        size={22}
                        color={iconColor}
                      />
                    </View>
                    {!isLast && <View style={[styles.connector, { backgroundColor: connectorColor }]} />}
                  </View>

                  <View style={[styles.timelineRight, isLast && { paddingBottom: 0 }]}>
                    <View style={styles.stageRow}>
                      <Text style={[
                        styles.stageName,
                        status === 'pending' && styles.stageNamePending,
                        status === 'skipped' && styles.stageNameSkipped,
                      ]}>
                        {stage.stage}
                      </Text>
                      {status === 'completed' && (
                        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.badgeText, { color: cfg.color }]}>Done</Text>
                        </View>
                      )}
                      {status === 'skipped' && (
                        <View style={styles.badgeSkipped}>
                          <Text style={styles.badgeSkippedText}>Skipped</Text>
                        </View>
                      )}
                      {status === 'pending' && (
                        <View style={styles.badgePending}>
                          <Text style={styles.badgePendingText}>Pending</Text>
                        </View>
                      )}
                    </View>

                    {stage.actor ? <Text style={styles.actor}>{stage.actor}</Text> : null}

                    {status === 'completed' && stage.location ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={13} color="#8E8E93" />
                        <Text style={styles.detailText}>{stage.location}</Text>
                      </View>
                    ) : null}

                    {status === 'completed' && stage.timestamp ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={13} color="#8E8E93" />
                        <Text style={styles.detailText}>{formatTimestamp(stage.timestamp)}</Text>
                      </View>
                    ) : null}

                    {status === 'skipped' && (
                      <Text style={styles.skippedNote}>
                        This stage was not completed — product moved forward without it
                      </Text>
                    )}
                    {status === 'pending' && (
                      <Text style={styles.pendingNote}>Not yet scanned at this stage</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {!loading && !error && (
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.infoText}>
            Each stage is recorded when the QR code is scanned by that party.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  headerText: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 6 },
  productName: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginBottom: 2 },
  batchText: { fontSize: 13, color: '#8E8E93' },
  center: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  errorText: { flex: 1, fontSize: 14, color: '#D32F2F' },
  timeline: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  timelineItem: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 44 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 24,
    paddingTop: 8,
  },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stageName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#000' },
  stageNamePending: { color: '#C7C7CC' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgePending: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  badgePendingText: { fontSize: 11, fontWeight: '600', color: '#C7C7CC' },
  actor: { fontSize: 13, color: '#3C3C43', marginBottom: 4, fontWeight: '500' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  detailText: { fontSize: 12, color: '#8E8E93' },
  pendingNote: { fontSize: 12, color: '#C7C7CC', marginTop: 4, fontStyle: 'italic' },
  stageNameSkipped: { color: '#FF6B00' },
  badgeSkipped: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FFF0E0',
  },
  badgeSkippedText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
  skippedNote: { fontSize: 12, color: '#FF6B00', marginTop: 4, fontStyle: 'italic' },
  suspiciousBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  suspiciousTitle: { fontSize: 14, fontWeight: '700', color: '#B71C1C', marginBottom: 4 },
  suspiciousReason: { fontSize: 13, color: '#C62828', lineHeight: 18 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: '#2E7D32', lineHeight: 20 },
});
