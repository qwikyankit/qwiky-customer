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
      default:
        return styles.defaultText;
    }
  };

  return (
    <View style={[styles.badge, getStatusStyle()]}>
      <Text style={[styles.text, getStatusTextStyle()]}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
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
  default: {
    backgroundColor: '#F5F5F5',
  },
  defaultText: {
    color: '#757575',
  },
});

export default StatusBadge;
