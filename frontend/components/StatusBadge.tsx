import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return styles.confirmed;
      case 'SETTLED':
        return styles.settled;
      case 'CANCELLED':
        return styles.cancelled;
      case 'FAILED':
        return styles.failed;
      case 'PAYMENT_PENDING':
        return styles.pending;
      default:
        return styles.default;
    }
  };

  const getStatusTextStyle = () => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return styles.confirmedText;
      case 'SETTLED':
        return styles.settledText;
      case 'CANCELLED':
        return styles.cancelledText;
      case 'FAILED':
        return styles.failedText;
      case 'PAYMENT_PENDING':
        return styles.pendingText;
      default:
        return styles.defaultText;
    }
  };

  const formatStatus = (s: string) => {
    return s?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
  };

  return (
    <View style={[styles.badge, getStatusStyle()]}>
      <Text style={[styles.text, getStatusTextStyle()]}>
        {formatStatus(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confirmed: {
    backgroundColor: '#EBF5FF',
  },
  confirmedText: {
    color: '#1E88E5',
  },
  settled: {
    backgroundColor: '#E8F5E9',
  },
  settledText: {
    color: '#43A047',
  },
  cancelled: {
    backgroundColor: '#FFEBEE',
  },
  cancelledText: {
    color: '#E53935',
  },
  failed: {
    backgroundColor: '#FFF3E0',
  },
  failedText: {
    color: '#EF6C00',
  },
  pending: {
    backgroundColor: '#FFF8E1',
  },
  pendingText: {
    color: '#F9A825',
  },
  default: {
    backgroundColor: '#F5F5F5',
  },
  defaultText: {
    color: '#757575',
  },
});

export default StatusBadge;
