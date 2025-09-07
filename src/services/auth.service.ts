import { API_CONFIG } from '@/config/api';
import apiClient from '@/config/api';

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  profile: {
    id: string;
    userName: string;
    email: string | null;
    userType: string;
    userTypeId: number | null;
  };
}

export interface AuthError {
  message: string;
}

class AuthService {
  constructor() {
    // API configuration is handled by getApiUrl helper
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, credentials);
      const data: LoginResponse = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userProfile', JSON.stringify(data.profile));

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ADMIN_REFRESH_TOKEN, { refreshToken });
      const data = response.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN_ME);
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          await this.refreshToken();
          return this.getCurrentUser();
        } catch (refreshError) {
          throw refreshError;
        }
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getStoredProfile() {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();
