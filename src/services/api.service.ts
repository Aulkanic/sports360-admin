import apiClient from '@/config/api';
import { API_CONFIG } from '@/config/api';

// Generic API service for common operations
export class ApiService {
  // Generic GET request
  static async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  // Generic POST request
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  // Generic PUT request
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  // Generic PATCH request
  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await apiClient.patch(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  }

  // Generic DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error: any) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }

  // Upload file with progress
  static async uploadFile<T>(
    endpoint: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Upload ${endpoint} error:`, error);
      throw error;
    }
  }
}

export default ApiService;
