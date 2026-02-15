import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BookingCard from '../components/BookingCard';
import { BookingListSkeleton } from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Toast from '../components/Toast';
import { fetchBookings } from '../services/api';

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'SETTLED', 'CANCELLED', 'FAILED', 'PAYMENT_PENDING'];

export default function Home() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as const });

  const loadBookings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await fetchBookings();
      // Handle the actual API response structure
      const bookingsList = data?._embedded?.bookingDetailsResponses || 
                          (Array.isArray(data) ? data : data?.bookings || data?.data || []);
      setBookings(bookingsList);
      filterBookings(bookingsList, searchQuery, activeFilter);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load bookings';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings(false);
  }, []);

  useEffect(() => {
    loadBookings();
  }, []);

  const filterBookings = (data: any[], search: string, status: string) => {
    let filtered = [...data];

    // Filter by status
    if (status !== 'ALL') {
      filtered = filtered.filter(
        (b) => b.status?.toUpperCase() === status.toUpperCase()
      );
    }

    // Filter by search query (booking ID, booking code, or phone)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.bookingId?.toLowerCase().includes(searchLower) ||
          b.bookingCode?.toLowerCase().includes(searchLower) ||
          b.phone?.toLowerCase().includes(searchLower) ||
          b.userId?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterBookings(bookings, text, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterBookings(bookings, searchQuery, filter);
  };

  const handleBookingPress = (booking: any) => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: booking.bookingId, booking: JSON.stringify(booking) },
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ visible: true, message, type });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Qwiky Admin</Text>
              <Text style={styles.headerSubtitle}>Booking Management</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <BookingListSkeleton />
      </SafeAreaView>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Qwiky Admin</Text>
              <Text style={styles.headerSubtitle}>Booking Management</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        <ErrorState message={error} onRetry={() => loadBookings()} />
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Qwiky Admin</Text>
            <Text style={styles.headerSubtitle}>Booking Management</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Booking ID or Code"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Booking List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E88E5']}
            tintColor="#1E88E5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          <EmptyState
            title={searchQuery || activeFilter !== 'ALL' ? 'No Matches Found' : 'No Bookings'}
            message={
              searchQuery || activeFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'There are no bookings to display'
            }
          />
        ) : (
          filteredBookings.map((booking, index) => (
            <BookingCard
              key={booking.bookingId || index}
              booking={booking}
              onPress={() => handleBookingPress(booking)}
            />
          ))
        )}
        <View style={styles.listFooter} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#1E88E5',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    flexGrow: 1,
  },
  listFooter: {
    height: 24,
  },
});
