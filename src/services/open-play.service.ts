
// ==============================
// TYPES
// ==============================

import apiClient from "@/config/api";

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type ParticipantStatus = "Ready" | "Resting" | "Reserve" | "In-Game" | "Waitlist";

export interface OpenPlayParticipant {
  id: string;
  name: string;
  level: Level;
  status: ParticipantStatus;
  avatar?: string;
  initials?: string;
  paymentStatus: "Paid" | "Pending" | "Rejected";
  isApproved: boolean;
  waitlistReason?: string;
  checkedInAt?: string;
  joinedAt?: string;
  notes?: string;
}

export interface OpenPlaySession {
  id: string;
  sessionName: string;
  description?: string;
  when: string;
  location: string;
  eventType?: "single" | "recurring";
  level: Level[];
  participants: OpenPlayParticipant[];
  rules?: string;
  format?: string;
  maxParticipants?: number;
  spotsLeft?: number;
  pricePerPlayer?: number;
  currency?: string;
  status?: string;
  courtId?: string;
  courtName?: string;
  sportId?: string;
  sportName?: string;
  hubId?: string;
  hubName?: string;
  createdAt?: string;
  updatedAt?: string;
  occurrences?: OpenPlayOccurrence[];
}

export interface OpenPlayOccurrence {
  id: string;
  sessionId: string;
  courtId?: string;
  occurrenceDate: string;
  startTime: string;
  endTime: string;
  currentParticipants: number;
  sessionType: string;
  status: string;
  court?: {
    id: string;
    courtName: string;
    capacity: number;
    status: string;
  };
  participants?: OpenPlayParticipant[];
}

export interface CreateOpenPlaySessionData {
  sessionTitle: string;
  eventType: "single" | "recurring";
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  maxPlayers: number;
  pricePerPlayer?: number;
  skillLevels: string[];
  courtId: string;
  hubId: string;
  sportsId: string;
  recurringSettings?: {
    frequency: "daily" | "weekly" | "monthly";
    endDate: string;
  };
}

export interface UpdateOpenPlaySessionData {
  sessionTitle?: string;
  description?: string;
  maxPlayers?: number;
  pricePerPlayer?: number;
  skillLevels?: string[];
  date?: string;
  startTime?: string;
  endTime?: string;
  courtId?: string;
}

export interface OpenPlayLookup {
  levels: Array<{ id: number; description: string }>;
  formats: Array<{ id: number; description: string }>;
  statuses: Array<{ id: number; description: string }>;
  occurrenceStatuses: Array<{ id: number; description: string }>;
  participantStatuses: Array<{ id: number; description: string }>;
}

export interface OpenPlayStats {
  totalPrograms: number;
  totalOccurrences: number;
  totalParticipants: number;
  activePrograms: number;
  upcomingOccurrences: number;
}

// ==============================
// API FUNCTIONS
// ==============================

/**
 * Get all open-play sessions
 */
export const getAllOpenPlaySessions = async (filters?: {
  hubId?: string;
  sportId?: string;
  statusId?: number;
  levelId?: number;
}): Promise<OpenPlaySession[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.hubId) params.append('hubId', filters.hubId);
    if (filters?.sportId) params.append('sportId', filters.sportId);
    if (filters?.statusId) params.append('statusId', filters.statusId.toString());
    if (filters?.levelId) params.append('levelId', filters.levelId.toString());

    const response = await apiClient.get(`/openplay/sessions?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching open-play sessions:', error);
    throw error;
  }
};

/**
 * Get a specific open-play session by ID
 */
export const getOpenPlaySessionById = async (sessionId: string): Promise<OpenPlaySession> => {
  try {
    const response = await apiClient.get(`/openplay/sessions/${sessionId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching open-play session:', error);
    throw error;
  }
};

/**
 * Create a new open-play session
 */
export const createOpenPlaySession = async (sessionData: CreateOpenPlaySessionData): Promise<any> => {
  try {
    const response = await apiClient.post('/openplay/create-session', sessionData);
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating open-play session:', error);
    
    // Check if the error has the expected structure
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data;
      
      // If it's already in the expected format, throw it as is
      if (errorData.success === false && errorData.message && errorData.error) {
        throw errorData;
      }
      
      // If it's a different structure, format it
      throw {
        success: false,
        message: errorData.message || 'Failed to create session',
        error: errorData.error || error.message || 'An unexpected error occurred',
        conflicts: errorData.conflicts || [],
        suggestions: errorData.suggestions || {
          message: 'Please try again with different parameters',
          availableAlternatives: [
            'Try booking at a different time',
            'Use a different court if available',
            'Check availability for a different date'
          ],
          conflictDetails: ''
        }
      };
    }
    
    // Fallback for unexpected error formats
    throw {
      success: false,
      message: 'Failed to create session',
      error: error.message || 'An unexpected error occurred',
      conflicts: [],
      suggestions: {
        message: 'Please try again with different parameters',
        availableAlternatives: [
          'Try booking at a different time',
          'Use a different court if available',
          'Check availability for a different date'
        ],
        conflictDetails: ''
      }
    };
  }
};

/**
 * Update an open-play session
 */
export const updateOpenPlaySession = async (sessionId: string, updateData: UpdateOpenPlaySessionData): Promise<any> => {
  try {
    const response = await apiClient.put(`/openplay/sessions/${sessionId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating open-play session:', error);
    throw error;
  }
};

/**
 * Update an open-play occurrence
 */
export const updateOpenPlayOccurrence = async (occurrenceId: string, updateData: any): Promise<any> => {
  try {
    const response = await apiClient.put(`/openplay/occurrences/${occurrenceId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating open-play occurrence:', error);
    throw error;
  }
};

/**
 * Delete an open-play session
 */
export const deleteOpenPlaySession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.delete(`/openplay/sessions/${sessionId}`);
  } catch (error) {
    console.error('Error deleting open-play session:', error);
    throw error;
  }
};

/**
 * Delete an open-play occurrence
 */
export const deleteOpenPlayOccurrence = async (occurrenceId: string): Promise<void> => {
  try {
    await apiClient.delete(`/openplay/occurrences/${occurrenceId}`);
  } catch (error) {
    console.error('Error deleting open-play occurrence:', error);
    throw error;
  }
};

/**
 * Get participants for a specific occurrence
 */
export const getOpenPlayParticipants = async (occurrenceId: string): Promise<OpenPlayParticipant[]> => {
  try {
    const response = await apiClient.get(`/openplay/occurrences/${occurrenceId}/participants`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

/**
 * Update participant status
 */
export const updateParticipantStatus = async (
  occurrenceId: string, 
  userName: string, 
  statusId: number
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/openplay/occurrences/${occurrenceId}/participants/${userName}/status`,
      { statusId }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating participant status:', error);
    throw error;
  }
};

/**
 * Get open-play statistics
 */
export const getOpenPlayStats = async (hubId?: string): Promise<OpenPlayStats> => {
  try {
    const params = hubId ? `?hubId=${hubId}` : '';
    const response = await apiClient.get(`/openplay/stats${params}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching open-play stats:', error);
    throw error;
  }
};

/**
 * Get open-play lookup data
 */
export const getOpenPlayLookup = async (): Promise<OpenPlayLookup> => {
  try {
    const response = await apiClient.get('/openplay/lookup');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching open-play lookup data:', error);
    throw error;
  }
};

/**
 * Check court availability for open play sessions
 */
export const checkCourtAvailability = async (params: {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  excludeSessionId?: string;
}): Promise<{ isAvailable: boolean; conflicts: any[] }> => {
  try {
    const queryParams = new URLSearchParams({
      courtId: params.courtId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
    });
    
    if (params.excludeSessionId) {
      queryParams.append('excludeSessionId', params.excludeSessionId);
    }

    const response = await apiClient.get(`/openplay/check-availability?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking court availability:', error);
    throw error;
  }
};

// ==============================
// UTILITY FUNCTIONS
// ==============================

/**
 * Map participant status from API to frontend format
 */
export const mapParticipantStatus = (status: string): ParticipantStatus => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
    case 'READY':
      return 'Ready';
    case 'CHECKED_IN':
    case 'IN_GAME':
      return 'In-Game';
    case 'RESTING':
      return 'Resting';
    case 'RESERVE':
      return 'Reserve';
    case 'WAITLIST':
    case 'PENDING':
      return 'Waitlist';
    default:
      return 'Ready';
  }
};

/**
 * Map participant status from frontend to API format
 */
export const mapParticipantStatusToAPI = (status: ParticipantStatus): number => {
  switch (status) {
    case 'Ready':
      return 1; // CONFIRMED
    case 'In-Game':
      return 3; // CHECKED_IN
    case 'Resting':
      return 4; // RESTING
    case 'Reserve':
      return 5; // RESERVE
    case 'Waitlist':
      return 2; // PENDING
    default:
      return 1; // CONFIRMED
  }
};

/**
 * Format session time for display
 */
export const formatSessionTime = (date: string, startTime: string, endTime: string): string => {
  const sessionDate = new Date(date);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[sessionDate.getDay()];
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  const startFormatted = start.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endFormatted = end.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${dayName} • ${startFormatted}–${endFormatted}`;
};

/**
 * Generate initials from name
 */
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

/**
 * Get avatar URL for participant
 */
export const getParticipantAvatar = (participant: OpenPlayParticipant): string => {
  if (participant.avatar) {
    return participant.avatar;
  }
  
  // Generate a consistent avatar based on name
  // const initials = participant.initials || generateInitials(participant.name);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random&color=fff&size=100&bold=true&format=png`;
};

/**
 * Convert backend session data to frontend format
 */
export const convertSessionFromAPI = (apiSession: any): OpenPlaySession => {
  const firstOccurrence = apiSession.occurrences?.[0];
  
  return {
    id: apiSession.id.toString(),
    sessionName: apiSession.sessionName,
    description: apiSession.description,
    when: firstOccurrence ? formatSessionTime(
      firstOccurrence.occurrenceDate,
      firstOccurrence.startTime,
      firstOccurrence.endTime
    ) : 'TBD',
    location: firstOccurrence?.court?.courtName || 'TBD',
    eventType: apiSession.occurrences?.length > 1 ? 'recurring' : 'single',
    level: ['Beginner', 'Intermediate', 'Advanced'], // Default levels, should be mapped from API
    participants: firstOccurrence?.participants?.map(convertParticipantFromAPI) || [],
    maxParticipants: apiSession.maxParticipants,
    spotsLeft: apiSession.maxParticipants - (firstOccurrence?.currentParticipants || 0),
    pricePerPlayer: apiSession.pricePerPlayer,
    currency: 'PHP',
    status: firstOccurrence?.status || 'scheduled',
    courtId: firstOccurrence?.courtId?.toString(),
    courtName: firstOccurrence?.court?.courtName,
    sportId: apiSession.sportsId?.toString(),
    sportName: apiSession.sport?.name,
    hubId: apiSession.hubId?.toString(),
    hubName: apiSession.hub?.sportsHubName,
    createdAt: apiSession.createdAt,
    updatedAt: apiSession.updatedAt,
    occurrences: apiSession.occurrences?.map(convertOccurrenceFromAPI) || []
  };
};

/**
 * Convert backend occurrence data to frontend format
 */
export const convertOccurrenceFromAPI = (apiOccurrence: any): OpenPlayOccurrence => {
  return {
    id: apiOccurrence.id.toString(),
    sessionId: apiOccurrence.sessionId.toString(),
    courtId: apiOccurrence.courtId?.toString(),
    occurrenceDate: apiOccurrence.occurrenceDate,
    startTime: apiOccurrence.startTime,
    endTime: apiOccurrence.endTime,
    currentParticipants: apiOccurrence.currentParticipants,
    sessionType: apiOccurrence.sessionType,
    status: apiOccurrence.status,
    court: apiOccurrence.court ? {
      id: apiOccurrence.court.id.toString(),
      courtName: apiOccurrence.court.courtName,
      capacity: apiOccurrence.court.capacity,
      status: apiOccurrence.court.status
    } : undefined,
    participants: apiOccurrence.participants?.map(convertParticipantFromAPI) || []
  };
};

/**
 * Convert backend participant data to frontend format
 */
export const convertParticipantFromAPI = (apiParticipant: any): OpenPlayParticipant => {
  return {
    id: apiParticipant.id.toString(),
    name: apiParticipant.user?.personalInfo ? 
      `${apiParticipant.user.personalInfo.firstName} ${apiParticipant.user.personalInfo.lastName}` :
      apiParticipant.user?.userName || 'Unknown',
    level: 'Intermediate', // Default level, should be mapped from API
    status: mapParticipantStatus(apiParticipant.status),
    avatar: undefined,
    initials: apiParticipant.user?.personalInfo ? 
      generateInitials(`${apiParticipant.user.personalInfo.firstName} ${apiParticipant.user.personalInfo.lastName}`) :
      undefined,
    paymentStatus: 'Paid', // Default, should be mapped from API
    isApproved: apiParticipant.status === 'confirmed',
    checkedInAt: apiParticipant.checkedInAt,
    joinedAt: apiParticipant.registeredAt,
    notes: apiParticipant.notes
  };
};

/**
 * Convert frontend session data to backend format
 */
export const convertSessionToAPI = (frontendSession: CreateOpenPlaySessionData): any => {
  return {
    sessionTitle: frontendSession.sessionTitle,
    eventType: frontendSession.eventType,
    date: frontendSession.date,
    startTime: frontendSession.startTime,
    endTime: frontendSession.endTime,
    description: frontendSession.description,
    maxPlayers: frontendSession.maxPlayers,
    pricePerPlayer: frontendSession.pricePerPlayer,
    skillLevels: frontendSession.skillLevels,
    courtId: parseInt(frontendSession.courtId),
    hubId: parseInt(frontendSession.hubId),
    sportsId: parseInt(frontendSession.sportsId),
    recurringSettings: frontendSession.recurringSettings
  };
};
