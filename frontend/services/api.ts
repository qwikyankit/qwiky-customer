import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_STORAGE_KEY = 'qwiky_admin_token';

// Default token
const DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJtb2JpbGUiOiI5NjYwNzY2MjI3Iiwicm9sZXMiOlsiU1VQRVJfQURNSU4iLCJDVVNUT01FUiJdLCJ1c2VySWQiOiJjZGZiZDJmZC04OTkxLTRiNzMtOGZmYS1jNzE1MzZiOGI4MDkiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwic3ViIjoiY2RmYmQyZmQtODk5MS00YjczLThmZmEtYzcxNTM2YjhiODA5IiwiaWF0IjoxNzcxMDU4MzE0LCJleHAiOjIwODIwOTgzMTR9.AukXaAriiGHGlwgEwRhleN2kzC0emcEoys7H3JG7PA4';

// Use the backend proxy URL
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://qadmin-bookings.preview.emergentagent.com';
const API_BASE_URL = `${BACKEND_URL}/api`;

let currentToken = DEFAULT_TOKEN;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth header
apiClient.interceptors.request.use(
  async (config) => {
    // Try to get token from storage first
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        currentToken = storedToken;
      }
    } catch (e) {
      // Use current token if storage fails
    }
    config.headers.Authorization = `Bearer ${currentToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Token management functions
export const getToken = async (): Promise<string> => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return storedToken || DEFAULT_TOKEN;
  } catch {
    return DEFAULT_TOKEN;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    currentToken = token;
  } catch (e) {
    console.error('Failed to save token:', e);
    throw e;
  }
};

export const resetToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    currentToken = DEFAULT_TOKEN;
  } catch (e) {
    console.error('Failed to reset token:', e);
  }
};

// API Functions using backend proxy

// Fetch all bookings
export const fetchBookings = async () => {
  const response = await apiClient.get('/qwiky/bookings');
  return response.data;
};

// Fetch user details
export const fetchUserDetails = async (userId: string) => {
  const response = await apiClient.get(`/qwiky/user/${userId}`);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId: string) => {
  const response = await apiClient.post(`/qwiky/booking/${bookingId}/cancel`);
  return response.data;
};

// Settle booking
export const settleBooking = async (bookingId: string) => {
  const response = await apiClient.post(`/qwiky/booking/${bookingId}/settled`);
  return response.data;
};

export default apiClient;
