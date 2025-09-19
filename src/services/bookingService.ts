import { apiService } from './api';
import { supabaseService } from './supabaseService';
import { Location, Service, TimeSlot, Booking } from '../types';
import { format, addDays } from 'date-fns';

interface CreateBookingRequest {
  serviceType: string;
  servicePrice: number;
  bookingType: 'instant' | 'scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
  timePeriod?: string;
  locality: string;
  address?: string;
  couponCode?: string;
  discountAmount?: number;
}

interface BookingData {
  id: string;
  userId: string;
  serviceType: string;
  servicePrice: number;
  bookingType: string;
  scheduledDate?: string;
  scheduledTime?: string;
  timePeriod?: string;
  locality: string;
  address?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  bookingId: string;
  otp: string;
  createdAt: string;
  updatedAt: string;
}

class BookingService {
  async getLocations(): Promise<Location[]> {
    // Using dummy data for development - replace with API call in production
    return Promise.resolve([
      {
        id: '1',
        name: 'Mumbai Central',
        address: 'Mumbai Central, Mumbai, Maharashtra',
        coordinates: { lat: 19.0176, lng: 72.8562 }
      },
      {
        id: '2',
        name: 'Andheri West',
        address: 'Andheri West, Mumbai, Maharashtra',
        coordinates: { lat: 19.1136, lng: 72.8697 }
      },
      {
        id: '3',
        name: 'Bandra',
        address: 'Bandra, Mumbai, Maharashtra',
        coordinates: { lat: 19.0544, lng: 72.8406 }
      }
    ]);
  }

  async getServices(locationId: string): Promise<Service[]> {
    // Using dummy data for development - replace with API call in production
    return Promise.resolve([
      {
        id: '1',
        name: 'Home Cleaning',
        description: 'Complete home cleaning service',
        price: 500,
        duration: 120,
        categoryId: 'cleaning',
        imageUrl: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '2',
        name: 'Cooking Help',
        description: 'Professional cooking assistance',
        price: 300,
        duration: 180,
        categoryId: 'cooking',
        imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '3',
        name: 'Baby Sitting',
        description: 'Trusted babysitting service',
        price: 400,
        duration: 240,
        categoryId: 'babysitting',
        imageUrl: 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: '4',
        name: 'Elder Care',
        description: 'Compassionate elder care service',
        price: 600,
        duration: 240,
        categoryId: 'eldercare',
        imageUrl: 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ]);
  }

  async getTimeSlots(serviceId: string, date: string): Promise<TimeSlot[]> {
    // Using dummy data for development - replace with API call in production
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
      
      slots.push({
        id: `slot-${hour}`,
        startTime,
        endTime,
        isAvailable: Math.random() > 0.3, // Random availability
        date
      });
    }
    
    return Promise.resolve(slots);
  }

  async createBooking(data: CreateBookingRequest): Promise<BookingData> {
    try {
      // Generate booking ID and OTP
      const bookingId = this.generateBookingId();
      const otp = this.generateOTP();
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const bookingData = {
        userId: currentUser.id,
        serviceType: data.serviceType,
        servicePrice: data.servicePrice,
        bookingType: data.bookingType,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        timePeriod: data.timePeriod,
        locality: data.locality,
        address: data.address,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalAmount: data.servicePrice - (data.discountAmount || 0),
        discountAmount: data.discountAmount || 0,
        couponCode: data.couponCode,
        bookingId,
        otp
      };

      // For development, store in localStorage
      const bookingsKey = `bookings_${currentUser.id}`;
      const existingBookings = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      
      const newBooking: BookingData = {
        id: crypto.randomUUID(),
        ...bookingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      existingBookings.push(newBooking);
      localStorage.setItem(bookingsKey, JSON.stringify(existingBookings));
      
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async getBookings(): Promise<BookingData[]> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const bookingsKey = `bookings_${currentUser.id}`;
      const bookings = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      
      // Sort by creation date, newest first
      return bookings.sort((a: BookingData, b: BookingData) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getBooking(id: string): Promise<BookingData | null> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const bookingsKey = `bookings_${currentUser.id}`;
      const bookings = JSON.parse(localStorage.getItem(bookingsKey) || '[]');
      
      return bookings.find((booking: BookingData) => booking.id === id) || null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  private generateBookingId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Legacy methods for backward compatibility
  async createLegacyBooking(data: any): Promise<Booking> {
    // Convert new booking format to legacy format for existing components
    const bookingData = await this.createBooking({
      serviceType: data.serviceId || '60min',
      servicePrice: 154,
      bookingType: 'instant',
      locality: 'Default Location'
    });

    return {
      id: bookingData.id,
      userId: bookingData.userId,
      serviceId: bookingData.serviceType,
      locationId: 'default',
      timeSlotId: 'default',
      status: bookingData.status as any,
      totalAmount: bookingData.totalAmount,
      paymentStatus: bookingData.paymentStatus as any,
      createdAt: bookingData.createdAt,
      scheduledDate: bookingData.scheduledDate || format(new Date(), 'yyyy-MM-dd'),
      service: {
        id: bookingData.serviceType,
        name: `${bookingData.serviceType} Service`,
        description: 'Service booking',
        price: bookingData.servicePrice,
        duration: parseInt(bookingData.serviceType.replace('min', '')),
        categoryId: 'service'
      },
      location: {
        id: 'default',
        name: bookingData.locality,
        address: bookingData.address || bookingData.locality,
        coordinates: { lat: 0, lng: 0 }
      },
      timeSlot: {
        id: 'default',
        startTime: bookingData.scheduledTime || '10:00',
        endTime: bookingData.scheduledTime || '12:00',
        isAvailable: true,
        date: bookingData.scheduledDate || format(new Date(), 'yyyy-MM-dd')
      }
    };
  }

  async getLegacyBookings(): Promise<Booking[]> {
    const bookings = await this.getBookings();
    return bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      serviceId: booking.serviceType,
      locationId: 'default',
      timeSlotId: 'default',
      status: booking.status as any,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus as any,
      createdAt: booking.createdAt,
      scheduledDate: booking.scheduledDate || format(new Date(), 'yyyy-MM-dd'),
      service: {
        id: booking.serviceType,
        name: `${booking.serviceType} Service`,
        description: 'Service booking',
        price: booking.servicePrice,
        duration: parseInt(booking.serviceType.replace('min', '')),
        categoryId: 'service'
      },
      location: {
        id: 'default',
        name: booking.locality,
        address: booking.address || booking.locality,
        coordinates: { lat: 0, lng: 0 }
      },
      timeSlot: {
        id: 'default',
        startTime: booking.scheduledTime || '10:00',
        endTime: booking.scheduledTime || '12:00',
        isAvailable: true,
        date: booking.scheduledDate || format(new Date(), 'yyyy-MM-dd')
      }
    }));
  }

  async getLegacyBooking(id: string): Promise<Booking> {
    // Using dummy data for development - replace with API call in production
    const dummyBooking: Booking = {
      id,
      userId: 'dummy-user-id',
      serviceId: '1',
      locationId: '1',
      timeSlotId: 'slot-10',
      status: 'confirmed',
      totalAmount: 500,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      service: {
        id: '1',
        name: 'Home Cleaning',
        description: 'Complete home cleaning service',
        price: 500,
        duration: 120,
        categoryId: 'cleaning'
      },
      location: {
        id: '1',
        name: 'Mumbai Central',
        address: 'Mumbai Central, Mumbai, Maharashtra',
        coordinates: { lat: 19.0176, lng: 72.8562 }
      },
      timeSlot: {
        id: 'slot-10',
        startTime: '10:00',
        endTime: '12:00',
        isAvailable: true,
        date: format(new Date(), 'yyyy-MM-dd')
      }
    };
    
    return Promise.resolve(dummyBooking);
  }

  async cancelBooking(id: string): Promise<void> {
    await apiService.put(`/bookings/${id}/cancel`);
  }
}

export const bookingService = new BookingService();