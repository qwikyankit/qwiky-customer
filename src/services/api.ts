import apiClient from './apiClient.js';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  async get<T>(url: string): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }

  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.error || 'Request failed');
  }
}

export const apiService = new ApiService();