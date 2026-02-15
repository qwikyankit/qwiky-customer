import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';
import { fetchUserDetails, cancelBooking, settleBooking } from '../../services/api';

export default function BookingDetail() {
  const router = useRouter();
  const { id, booking: bookingParam } = useLocalSearchParams();
  
  const [booking, setBooking] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    type: 'settle' | 'cancel' | null;
  }>({ visible: false, type: null });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as const });

  useEffect(() => {
    if (bookingParam) {
      try {
        const parsed = JSON.parse(bookingParam as string);
        setBooking(parsed);
        if (parsed.userId) {
          loadUserDetails(parsed.userId);
        } else {
          setLoadingUser(false);
        }
      } catch (e) {
        console.error('Failed to parse booking:', e);
        setLoadingUser(false);
      }
    }
  }, [bookingParam]);

  const loadUserDetails = async (userId: string) => {
    try {
      setLoadingUser(true);
      const userData = await fetchUserDetails(userId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSettle = async () => {
    if (!booking?.bookingId) return;
    
    try {
      setActionLoading(true);
      await settleBooking(booking.bookingId);
      setBooking({ ...booking, status: 'SETTLED' });
      showToast('Booking settled successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to settle booking';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
      setConfirmModal({ visible: false, type: null });
    }
  };

  const handleCancel = async () => {
    if (!booking?.bookingId) return;
    
    try {
      setActionLoading(true);
      await cancelBooking(booking.bookingId);
      setBooking({ ...booking, status: 'CANCELLED' });
      showToast('Booking cancelled successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to cancel booking';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
      setConfirmModal({ visible: false, type: null });
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getAmount = () => {
    return booking?.priceSummary?.grandTotal || 
           booking?.amount || 
           booking?.totalAmount || 
           booking?.services?.[0]?.totalAmount ||
           0;
  };

  const getServiceName = () => {
    if (booking?.services && booking.services.length > 0) {
      return booking.services[0].productName || booking.services[0].serviceName;
    }
    return booking?.serviceType || booking?.serviceName;
  };

  const getAddress = () => {
    const addr = booking?.bookingAddress;
    if (!addr) return null;
    return `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}\n${addr.locality || ''}\n${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}`;
  };

  const isSettled = booking?.status?.toUpperCase() === 'SETTLED';
  const isCancelled = booking?.status?.toUpperCase() === 'CANCELLED';
  const isFailed = booking?.status?.toUpperCase() === 'FAILED';
  const canTakeAction = !isSettled && !isCancelled && !isFailed;

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ConfirmationModal
        visible={confirmModal.visible && confirmModal.type === 'settle'}
        title="Settle Booking?"
        message="Are you sure you want to mark this booking as settled? This action cannot be undone."
        confirmText="Settle"
        confirmColor="#43A047"
        icon="checkmark-circle"
        onConfirm={handleSettle}
        onCancel={() => setConfirmModal({ visible: false, type: null })}
        loading={actionLoading}
      />

      <ConfirmationModal
        visible={confirmModal.visible && confirmModal.type === 'cancel'}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        confirmColor="#E53935"
        icon="close-circle"
        onConfirm={handleCancel}
        onCancel={() => setConfirmModal({ visible: false, type: null })}
        loading={actionLoading}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerId}>{booking.bookingCode || `#${booking.bookingId?.substring(0, 8)}`}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={22} color="#1E88E5" />
            <Text style={styles.sectionTitle}>Booking Information</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="Booking Code" value={booking.bookingCode || 'N/A'} />
            <InfoRow label="Booking ID" value={booking.bookingId || 'N/A'} />
            <InfoRow label="Status" value={booking.status || 'N/A'} />
            <InfoRow
              label="Created"
              value={formatDate(booking.createdAt)}
            />
            <InfoRow
              label="Total Amount"
              value={formatAmount(getAmount())}
              highlight
            />
            {getServiceName() && (
              <InfoRow
                label="Service"
                value={getServiceName()}
              />
            )}
            {booking.services?.[0]?.slotStart && (
              <InfoRow
                label="Slot Time"
                value={formatDate(booking.services[0].slotStart)}
              />
            )}
          </View>
        </View>

        {/* Address Section */}
        {booking.bookingAddress && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={22} color="#1E88E5" />
              <Text style={styles.sectionTitle}>Booking Address</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.addressText}>{getAddress()}</Text>
            </View>
          </View>
        )}

        {/* Guest Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color="#1E88E5" />
            <Text style={styles.sectionTitle}>Guest Information</Text>
          </View>

          <View style={styles.infoCard}>
            {loadingUser ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#1E88E5" />
                <Text style={styles.loadingText}>Loading guest details...</Text>
              </View>
            ) : (
              <>
                <InfoRow
                  label="Name"
                  value={user?.name || user?.fullName || booking.userName || 'N/A'}
                  icon="person"
                />
                <InfoRow
                  label="Phone"
                  value={user?.phone || user?.phoneNumber || user?.mobile || booking.phone || 'N/A'}
                  icon="call"
                />
                <InfoRow
                  label="Email"
                  value={user?.email || booking.email || 'N/A'}
                  icon="mail"
                />
                <InfoRow
                  label="User ID"
                  value={booking.userId || 'N/A'}
                  icon="finger-print"
                />
              </>
            )}
          </View>
        </View>

        {/* Payment Info */}
        {booking.paymentTransactionResponses && booking.paymentTransactionResponses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={22} color="#1E88E5" />
              <Text style={styles.sectionTitle}>Payment Information</Text>
            </View>

            <View style={styles.infoCard}>
              <InfoRow
                label="Payment Status"
                value={booking.paymentTransactionResponses[0].status || 'N/A'}
              />
              <InfoRow
                label="Payment Mode"
                value={booking.paymentTransactionResponses[0].transactionMode || 'N/A'}
              />
              <InfoRow
                label="Amount Paid"
                value={formatAmount(booking.paymentTransactionResponses[0].amount)}
                highlight
              />
              {booking.paymentTransactionResponses[0].remarks && (
                <InfoRow
                  label="Remarks"
                  value={booking.paymentTransactionResponses[0].remarks}
                />
              )}
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons - Sticky at bottom */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.settleButton,
            !canTakeAction && styles.disabledButton,
          ]}
          onPress={() => setConfirmModal({ visible: true, type: 'settle' })}
          disabled={!canTakeAction}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={!canTakeAction ? '#AAA' : '#FFF'}
          />
          <Text
            style={[
              styles.actionButtonText,
              !canTakeAction && styles.disabledButtonText,
            ]}
          >
            {isSettled ? 'Settled' : 'Settle'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.cancelButton,
            !canTakeAction && styles.disabledButton,
          ]}
          onPress={() => setConfirmModal({ visible: true, type: 'cancel' })}
          disabled={!canTakeAction}
        >
          <Ionicons
            name="close-circle"
            size={22}
            color={!canTakeAction ? '#AAA' : '#FFF'}
          />
          <Text
            style={[
              styles.actionButtonText,
              !canTakeAction && styles.disabledButtonText,
            ]}
          >
            {isCancelled ? 'Cancelled' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, highlight }) => (
  <View style={infoStyles.row}>
    <View style={infoStyles.labelContainer}>
      {icon && <Ionicons name={icon} size={16} color="#888" style={infoStyles.icon} />}
      <Text style={infoStyles.label}>{label}</Text>
    </View>
    <Text
      style={[infoStyles.value, highlight && infoStyles.highlightValue]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#43A047',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  headerId: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  spacer: {
    height: 120,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  settleButton: {
    backgroundColor: '#43A047',
  },
  cancelButton: {
    backgroundColor: '#E53935',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  disabledButtonText: {
    color: '#AAA',
  },
});
