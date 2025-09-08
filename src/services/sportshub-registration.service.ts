import apiClient from '@/config/api';

// Types based on backend API structure
export interface SportsHubRegistrationData {
  // Step 1 - Basic Information
  sportsHubName: string;
  email: string;
  contactNumber: string;
  password: string;
  
  // Step 2 - Location & Contact
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  primaryContactPerson: string;
  contactPhone: string;
  
  // Step 3 - Business & Legal
  businessLicenseNumber?: string;
  taxIdNumber?: string;
  operatingHours?: string;
  facilityCapacity?: number;
  insuranceInformation?: string;
  
  // Additional fields
  description?: string;
  ownerId?: string;
  sportsId?: string;
}

export interface SportsHubRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    sportsHubName: string;
    email: string;
    registrationStatus: string;
    createdAt: string;
  };
  errors?: string[];
}

export interface EmailAvailabilityResponse {
  success: boolean;
  available: boolean;
  message: string;
}

export interface NameAvailabilityResponse {
  success: boolean;
  available: boolean;
  message: string;
}

// API Functions
// ==============================

/**
 * Register a new sports hub
 */
export const registerSportsHub = async (data: SportsHubRegistrationData): Promise<SportsHubRegistrationResponse> => {
  try {
    const response = await apiClient.post('/sports-hub/register', data);
    return response.data;
  } catch (error: any) {
    console.error('Error registering sports hub:', error);
    throw error;
  }
};

/**
 * Check if email is available
 */
export const checkEmailAvailability = async (email: string): Promise<EmailAvailabilityResponse> => {
  try {
    const response = await apiClient.get(`/sports-hub/check/email?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking email availability:', error);
    throw error;
  }
};

/**
 * Check if sports hub name is available
 */
export const checkNameAvailability = async (name: string): Promise<NameAvailabilityResponse> => {
  try {
    const response = await apiClient.get(`/sports-hub/check/name?name=${encodeURIComponent(name)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking name availability:', error);
    throw error;
  }
};

/**
 * Get sports hub by ID
 */
export const getSportsHubById = async (id: string): Promise<SportsHubRegistrationResponse> => {
  try {
    const response = await apiClient.get(`/sports-hub/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sports hub:', error);
    throw error;
  }
};

/**
 * Get all sports hub registrations (admin only)
 */
export const getAllSportsHubRegistrations = async (page: number = 1, limit: number = 10, status?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await apiClient.get(`/sports-hub?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching sports hub registrations:', error);
    throw error;
  }
};

/**
 * Update registration status (admin only)
 */
export const updateRegistrationStatus = async (id: string, status: string): Promise<SportsHubRegistrationResponse> => {
  try {
    const response = await apiClient.patch(`/sports-hub/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSportsHubName = (name: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!name || name.trim().length < 2) {
    errors.push('Sports hub name must be at least 2 characters long');
  }
  
  if (name.length > 100) {
    errors.push('Sports hub name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
