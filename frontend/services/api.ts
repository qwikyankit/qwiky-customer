import axios, { AxiosInstance, AxiosError } from 'axios';

// Hardcoded Bearer token as specified
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJxd2lreS1jbGllbnQiLCJzdWIiOiI2YTBjMGRmNy1jY2QzLTRlMTUtODk3Zi04Mzc4YWVjYmRmNzMiLCJpYXQiOjE3NDY4MTc2OTgsIm5hbWUiOiJZYXNoIEdveWFsIiwiZW1haWwiOiJ5YXNoZ295YWxmaXRAdHVuZWlua2l0LmNvbSJ9.EbBTTX3vV2Tvm_0b00L1WPpgKmOaChh02HVrZWjHLSE';

const BASE_URL = 'https://api.qwiky.in/qwiky-service/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BEARER_TOKEN}`,
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Error setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Hood ID for fetching bookings
const HOOD_ID = '4dd4d3a6-c0b3-4042-8e01-5b9299273ee1';

// API Functions

// Fetch all bookings
export const fetchBookings = async () => {
  const response = await apiClient.get(`/admin/booking/hood/${HOOD_ID}`);
  return response.data;
};

// Fetch user details
export const fetchUserDetails = async (userId: string) => {
  const response = await apiClient.get(`/user/${userId}`);
  return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId: string) => {
  const response = await apiClient.post(`/admin/booking/${bookingId}/cancel`);
  return response.data;
};

// Settle booking
export const settleBooking = async (bookingId: string) => {
  const response = await apiClient.post(`/admin/booking/${bookingId}/settled`);
  return response.data;
};

export default apiClient;
