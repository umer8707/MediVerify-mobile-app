import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: VerificationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'genuine':
        return {
          icon: 'checkmark-circle',
          color: '#34C759',
          bgColor: '#E8F5E9',
          text: 'Genuine Product',
        };
      case 'duplicate':
        return {
          icon: 'warning',
          color: '#FF9500',
          bgColor: '#FFF3E0',
          text: 'Duplicate QR Detected',
        };
      case 'counterfeit':
        return {
          icon: 'close-circle',
          color: '#FF3B30',
          bgColor: '#FFEBEE',
          text: 'Counterfeit Alert',
        };
      default:
        return {
          icon: 'help-circle',
          color: '#8E8E93',
          bgColor: '#F2F2F7',
          text: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

