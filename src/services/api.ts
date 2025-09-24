import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }
}

export const apiService = new ApiService();