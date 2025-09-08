

// ==============================
// COURT MANAGEMENT API SERVICE
// ==============================

import apiClient from "@/config/api";

export interface Court {
  id: string;
  hubId: number;
  courtName: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'BOOKED' | 'UNAVAILABLE';
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hub?: {
    id: number;
    sportsHubName: string;
    streetAddress: string;
    city: string;
    stateProvince: string;
    zipPostalCode: string;
  };
  courtRentalOptions?: CourtRentalOption[];
  availability?: CourtAvailability[];
  _count?: {
    bookings: number;
    openPlaySessions: number;
    conflicts: number;
  };
}

export interface CourtAvailability {
  id: string;
  weekday: number; // 1-7 (Monday-Sunday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface CourtRentalOption {
  id: string;
  offeringName: string;
  description?: string;
  hourlyRate: number;
  minimumHours: number;
  currency: string;
  maxPlayersPerCourt: number;
  isActive: boolean;
  sport: {
    id: number;
    name: string;
  };
  uploads: {
    fileName: string;
    filePath: string;
  }[];
  courtAvailability: CourtAvailability[];
}

export interface CreateCourtData {
  hubId: string;
  courtName: string;
  status?: string;
  capacity?: number;
  hourlyRate?: number;
  minimumHours?: number;
  description?: string;
  availability?: {
    weekday: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  images?: (string | File)[];
}

export interface UpdateCourtData {
  courtName?: string;
  status?: string;
  capacity?: number;
  hourlyRate?: number;
  minimumHours?: number;
  description?: string;
  availability?: {
    weekday: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  images?: (string | File)[];
}

export interface CourtFilters {
  hubId?: string;
  status?: string;
  isActive?: boolean;
}

export interface BookingConflict {
  id: string;
  courtId: string;
  conflictDate: string;
  conflictStart: string;
  conflictEnd: string;
  resolutionStatus: 'pending' | 'resolved' | 'overridden';
  booking1Id: string;
  booking2Id: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  court?: {
    id: string;
    courtName: string;
    courtNumber?: string;
  };
  booking1?: {
    id: string;
    startTs: string;
    endTs: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  booking2?: {
    id: string;
    startTs: string;
    endTs: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface CourtAnalytics {
  summary: {
    totalCourts: number;
    totalRevenue: number;
    totalBookings: number;
    averageUtilization: number;
  };
  courts: Court[];
  analytics: any[];
}

export interface AvailabilityCheck {
  startTime: string;
  endTime: string;
  date: string;
}

// ==============================
// COURT MANAGEMENT FUNCTIONS
// ==============================

/**
 * Get all courts with optional filters
 */
export const getAllCourts = async (filters?: CourtFilters): Promise<Court[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get(`/courts/get-all-courts?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching courts:', error);
    throw error;
  }
};

/**
 * Get a specific court by ID
 */
export const getCourtById = async (courtId: string): Promise<Court> => {
  try {
    const response = await apiClient.get(`/admin-auth/courts/${courtId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court:', error);
    throw error;
  }
};

/**
 * Create a new court
 */
export const createCourt = async (courtData: CreateCourtData): Promise<Court> => {
  try {
    // Check if there are File objects in images
    const hasFileObjects = courtData.images?.some(img => img instanceof File);
    
    if (hasFileObjects) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all non-file fields
      Object.entries(courtData).forEach(([key, value]) => {
        if (key === 'images') {
          // Handle images separately
          return;
        } else if (key === 'availability' && Array.isArray(value)) {
          // Handle availability as JSON
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Handle other arrays
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add images
      if (courtData.images) {
        courtData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            formData.append(`imageUrls[${index}]`, image);
          }
        });
      }
      
      const response = await apiClient.post('/courts/create-court', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } else {
      // Use regular JSON for non-file data
      const response = await apiClient.post('/courts/create-court', courtData);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error creating court:', error);
    throw error;
  }
};

/**
 * Update a court
 */
export const updateCourt = async (courtId: string, updateData: UpdateCourtData): Promise<Court> => {
  try {
    // Check if there are File objects in images
    const hasFileObjects = updateData.images?.some(img => img instanceof File);
    
    if (hasFileObjects) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all non-file fields
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'images') {
          // Handle images separately
          return;
        } else if (key === 'availability' && Array.isArray(value)) {
          // Handle availability as JSON
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Handle other arrays
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add images
      if (updateData.images) {
        updateData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            formData.append(`imageUrls[${index}]`, image);
          }
        });
      }
      
      const response = await apiClient.put(`/courts/update-court/${courtId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } else {
      // Use regular JSON for non-file data
      const response = await apiClient.put(`/courts/update-court/${courtId}`, updateData);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error updating court:', error);
    throw error;
  }
};

/**
 * Delete a court
 */
export const deleteCourt = async (courtId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin-auth/courts/${courtId}`);
  } catch (error) {
    console.error('Error deleting court:', error);
    throw error;
  }
};

// ==============================
// COURT AVAILABILITY FUNCTIONS
// ==============================

/**
 * Get court availability schedule
 */
export const getCourtAvailability = async (courtId: string): Promise<CourtAvailability[]> => {
  try {
    const response = await apiClient.get(`/admin-auth/courts/${courtId}/availability`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court availability:', error);
    throw error;
  }
};

/**
 * Update court availability schedule
 */
export const updateCourtAvailability = async (
  courtId: string, 
  availabilityData: Omit<CourtAvailability, 'id' | 'courtId'>[]
): Promise<CourtAvailability[]> => {
  try {
    const response = await apiClient.put(`/admin-auth/courts/${courtId}/availability`, availabilityData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating court availability:', error);
    throw error;
  }
};

/**
 * Check court availability for a specific time slot
 */
export const checkCourtAvailability = async (
  courtId: string, 
  availabilityCheck: AvailabilityCheck
): Promise<{ isAvailable: boolean }> => {
  try {
    const response = await apiClient.post(`/admin-auth/courts/${courtId}/check-availability`, availabilityCheck);
    return response.data.data;
  } catch (error) {
    console.error('Error checking court availability:', error);
    throw error;
  }
};

// ==============================
// COURT BOOKINGS FUNCTIONS
// ==============================

/**
 * Get court bookings
 */
export const getCourtBookings = async (
  courtId: string, 
  filters?: { startDate?: string; endDate?: string; status?: string }
): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`/admin-auth/courts/${courtId}/bookings?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court bookings:', error);
    throw error;
  }
};

/**
 * Get courts by hub
 */
export const getCourtsByHub = async (
  hubId: string, 
  options?: { includeAvailability?: boolean; includeBookings?: boolean }
): Promise<Court[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.includeAvailability) params.append('includeAvailability', 'true');
    if (options?.includeBookings) params.append('includeBookings', 'true');

    const response = await apiClient.get(`/admin-auth/courts/hubs/${hubId}/courts?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hub courts:', error);
    throw error;
  }
};

// ==============================
// BOOKING CONFLICT FUNCTIONS
// ==============================

/**
 * Get all booking conflicts
 */
export const getAllConflicts = async (filters?: {
  status?: string;
  courtId?: string;
  date?: string;
  resolvedBy?: string;
}): Promise<BookingConflict[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courtId) params.append('courtId', filters.courtId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.resolvedBy) params.append('resolvedBy', filters.resolvedBy);

    const response = await apiClient.get(`/admin-auth/conflicts?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    throw error;
  }
};

/**
 * Get conflict by ID
 */
export const getConflictById = async (conflictId: string): Promise<BookingConflict> => {
  try {
    const response = await apiClient.get(`/admin-auth/conflicts/${conflictId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conflict:', error);
    throw error;
  }
};

/**
 * Resolve a booking conflict
 */
export const resolveConflict = async (
  conflictId: string, 
  resolution: {
    resolution: 'resolved' | 'overridden';
    notes?: string;
    cancelledBookingId?: string;
  }
): Promise<BookingConflict> => {
  try {
    const response = await apiClient.put(`/admin-auth/conflicts/${conflictId}/resolve`, resolution);
    return response.data.data;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    throw error;
  }
};

/**
 * Detect potential conflicts
 */
export const detectConflicts = async (conflictData: {
  courtId: string;
  startTime: string;
  endTime: string;
  date: string;
  excludeBookingId?: string;
}): Promise<{
  overlappingBookings: any[];
  overlappingSessions: any[];
  hasConflicts: boolean;
}> => {
  try {
    const response = await apiClient.post('/admin-auth/conflicts/detect', conflictData);
    return response.data.data;
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    throw error;
  }
};

/**
 * Auto-resolve conflicts
 */
export const autoResolveConflicts = async (conflictIds: string[], resolutionRules?: any): Promise<any[]> => {
  try {
    const response = await apiClient.post('/admin-auth/conflicts/auto-resolve', {
      conflictIds,
      resolutionRules
    });
    return response.data.data;
  } catch (error) {
    console.error('Error auto-resolving conflicts:', error);
    throw error;
  }
};

/**
 * Get conflict statistics
 */
export const getConflictStatistics = async (filters?: {
  startDate?: string;
  endDate?: string;
  courtId?: string;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.courtId) params.append('courtId', filters.courtId);

    const response = await apiClient.get(`/admin-auth/conflicts/statistics?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conflict statistics:', error);
    throw error;
  }
};

// ==============================
// COURT ANALYTICS FUNCTIONS
// ==============================

/**
 * Get hub court analytics
 */
export const getHubCourtAnalytics = async (
  hubId: string, 
  filters?: { startDate?: string; endDate?: string; groupBy?: string }
): Promise<CourtAnalytics> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get(`/admin-auth/analytics/hubs/${hubId}/courts?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hub court analytics:', error);
    throw error;
  }
};

/**
 * Get court utilization trends
 */
export const getCourtUtilizationTrends = async (
  courtId: string, 
  filters?: { startDate?: string; endDate?: string; period?: string }
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.period) params.append('period', filters.period);

    const response = await apiClient.get(`/admin-auth/analytics/courts/${courtId}/utilization?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court utilization trends:', error);
    throw error;
  }
};

/**
 * Get court revenue analytics
 */
export const getCourtRevenueAnalytics = async (filters?: {
  hubId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get(`/admin-auth/analytics/courts/revenue?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court revenue analytics:', error);
    throw error;
  }
};

/**
 * Get peak hours analysis
 */
export const getPeakHoursAnalysis = async (filters?: {
  hubId?: string;
  courtId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.courtId) params.append('courtId', filters.courtId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/admin-auth/analytics/courts/peak-hours?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching peak hours analysis:', error);
    throw error;
  }
};

/**
 * Get court performance comparison
 */
export const getCourtPerformanceComparison = async (filters?: {
  hubId?: string;
  startDate?: string;
  endDate?: string;
  metrics?: string[];
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.metrics) params.append('metrics', filters.metrics.join(','));

    const response = await apiClient.get(`/admin-auth/analytics/courts/performance?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching court performance comparison:', error);
    throw error;
  }
};

/**
 * Get booking patterns analysis
 */
export const getBookingPatternsAnalysis = async (filters?: {
  hubId?: string;
  courtId?: string;
  startDate?: string;
  endDate?: string;
  patternType?: string;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.courtId) params.append('courtId', filters.courtId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.patternType) params.append('patternType', filters.patternType);

    const response = await apiClient.get(`/admin-auth/analytics/courts/booking-patterns?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching booking patterns analysis:', error);
    throw error;
  }
};

/**
 * Generate court analytics report
 */
export const generateCourtAnalyticsReport = async (filters?: {
  hubId?: string;
  startDate?: string;
  endDate?: string;
  reportType?: string;
  format?: string;
}): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.reportType) params.append('reportType', filters.reportType);
    if (filters?.format) params.append('format', filters.format);

      const response = await apiClient.get(`/admin-auth/analytics/courts/report?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error generating court analytics report:', error);
    throw error;
  }
};

// ==============================
// COURT IMAGE MANAGEMENT FUNCTIONS
// ==============================

/**
 * Upload images for a court
 */
export const uploadCourtImages = async (courtId: string, images: File[]): Promise<{ court: Court; uploadedImages: string[] }> => {
  try {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await apiClient.post(`/admin-auth/courts/${courtId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error uploading court images:', error);
    throw error;
  }
};

/**
 * Delete a specific image from a court
 */
export const deleteCourtImage = async (courtId: string, imageUrl: string): Promise<Court> => {
  try {
    const response = await apiClient.delete(`/admin-auth/courts/${courtId}/images/${encodeURIComponent(imageUrl)}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting court image:', error);
    throw error;
  }
};
