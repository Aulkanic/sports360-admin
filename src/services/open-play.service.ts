/* eslint-disable @typescript-eslint/no-explicit-any */

// ==============================
// TYPES
// ==============================

import apiClient from "@/config/api";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface OpenPlayParticipant {
  id: string;
  name: string;
  level: Level;
  status: any;
  avatar?: string;
  initials?: string;
  paymentStatus: "Paid" | "Pending" | "Rejected";
  isApproved: boolean;
  waitlistReason?: string;
  checkedInAt?: string;
  joinedAt?: string;
  notes?: string;
  // Additional fields for compatibility
  gamesPlayed?: number;
  matchCount?: number;
  skillScore?: number;
  readyTime?: number;
  // API structure
  user?: {
    id: string;
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo: string;
    };
  };
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
  statusId: number;
  status?: string; // Keep for backward compatibility
  court?: {
    id: string;
    courtName: string;
    capacity: number;
    status: {
      id: number;
      description: string;
      createdAt: string;
    };
  };
  participants?: OpenPlayParticipant[];
  organizerNotes?: string | null;
  equipmentProvided?: any[];
  registrationDeadline?: string | null;
  cancellationDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethodId?: number | null;
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
  isFreeJoin?: boolean;
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

export interface AddPlayerRequest {
  occurrenceId: string;
  playerType: 'registered' | 'guest';
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  skillId: number; // Skill level ID (1=Beginner, 2=Intermediate, 3=Advanced)
  additionalNotes?: string;
  paymentMethodId: number;
  paymentAmount: number;
  paymentStatus: 'pending' | 'confirmed' | 'rejected';
  profilePicture?: File; // Profile picture file for guest players
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
 * Admin function to update participant player status for a specific participant in a specific occurrence
 */
export const updateParticipantPlayerStatusByAdmin = async (
  participantId: string,
  occurrenceId: string,
  playerStatusId: number | null
): Promise<any> => {
  try {
    const response = await apiClient.put('/participant-status/admin/update-player-status', {
      participantId: parseInt(participantId),
      occurrenceId: parseInt(occurrenceId),
      playerStatusId: playerStatusId
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating participant player status by admin:', error);
    throw error;
  }
};

/**
 * Map status strings to playerStatusId numbers based on the API documentation
 */
export const mapStatusToPlayerStatusId = (status: string): number => {
  switch (status.toUpperCase()) {
    case 'READY': return 1;
    case 'REST': return 2;
    case 'WAITLIST': return 3;
    case 'ENDGAME': return 4;
    case 'PENDING': return 5;
    case 'RESERVE': return 6;
    case 'CONFIRMED': return 7;
    case 'COMPLETED': return 8;
    case 'ONPROCESS': return 9;
    case 'CANCELED': return 10;
    case 'INCOMING': return 11;
    case 'ONGOING': return 12;
    case 'ENDED': return 13;
    default: return 1; // Default to READY
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

/**
 * Add a player to an open play session occurrence
 */
export const addPlayerToSession = async (playerData: AddPlayerRequest): Promise<any> => {
  try {
    let response;
    
    // Check if there's a profile picture to upload
    if (playerData.profilePicture) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all non-file fields
      Object.entries(playerData).forEach(([key, value]) => {
        if (key === 'profilePicture') {
          // Handle profile picture separately
          return;
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add profile picture with key name "photo"
      formData.append('photo', playerData.profilePicture);
      
      // Set content type for FormData
      response = await apiClient.post('/openplay/add-player', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Regular JSON request for players without profile pictures
      response = await apiClient.post('/openplay/add-player', {...playerData, paymentAmount:'100'});
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error adding player to session:', error);
    
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
        message: errorData.message || 'Failed to add player to session',
        error: errorData.error || error.message || 'An unexpected error occurred',
        conflicts: errorData.conflicts || [],
        suggestions: errorData.suggestions || {
          message: 'Please try again with different parameters',
          availableAlternatives: [
            'Check if the session is still available',
            'Verify the player information is correct',
            'Try adding the player to a different session'
          ],
          conflictDetails: ''
        }
      };
    }
    
    // Fallback for unexpected error formats
    throw {
      success: false,
      message: 'Failed to add player to session',
      error: error.message || 'An unexpected error occurred',
      conflicts: [],
      suggestions: {
        message: 'Please try again with different parameters',
        availableAlternatives: [
          'Check if the session is still available',
          'Verify the player information is correct',
          'Try adding the player to a different session'
        ],
        conflictDetails: ''
      }
    };
  }
};

// ==============================
// UTILITY FUNCTIONS
// ==============================

/**
 * Map participant status from API to frontend format
 */
export const mapParticipantStatus = (status: string): any => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
    case 'READY':
      return 'READY';
    case 'CHECKED_IN':
    case 'IN_GAME':
      return 'IN-GAME';
    case 'RESTING':
      return 'RESTING';
    case 'RESERVE':
      return 'RESERVE';
    case 'WAITLIST':
    case 'PENDING':
      return 'WAITLIST';
    default:
      return 'READY';
  }
};

/**
 * Map participant status from frontend to API format
 */
export const mapParticipantStatusToAPI = (status: any): number => {
  switch (status) {
    case 'READY':
      return 1; // CONFIRMED
    case 'IN-GAME':
      return 3; // CHECKED_IN
    case 'RESTING':
      return 4; // RESTING
    case 'RESERVE':
      return 5; // RESERVE
    case 'WAITLIST':
      return 2; // PENDING
    default:
      return 1; // CONFIRMED
  }
};

/**
 * Map participant status to player status ID for admin API
 */
export const mapPlayerStatusFromDescription = (playerStatusDescription: string): any => {
  switch (playerStatusDescription?.toUpperCase()) {
    case 'READY':
      return 'READY';
    case 'REST':
    case 'RESTING':
      return 'RESTING';
    case 'WAITLIST':
      return 'WAITLIST';
    case 'RESERVE':
      return 'RESERVE';
    case 'REJECTED':
      return 'REJECTED';
    case 'ONGOING':
      return 'IN-GAME';
    default:
      return 'READY';
  }
};

export const mapParticipantStatusToPlayerStatusId = (status: any): number | null => {
  switch (status) {
    case 'READY':
      return 1; // Ready player status
    case 'IN-GAME':
      return 2; // Playing player status
    case 'RESTING':
      return 3; // Resting player status
    case 'RESERVE':
      return 4; // Reserve player status
    case 'WAITLIST':
      return 3; // Use WAITLIST status ID (3) for waitlist
    case 'REJECTED':
      return 5; // Rejected player status
    default:
      return 1; // Ready player status
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


export const convertOccurrenceFromAPI = (apiOccurrence: any): OpenPlayOccurrence => {
  return {
    id: apiOccurrence.id.toString(),
    sessionId: apiOccurrence.sessionId.toString(),
    courtId: apiOccurrence.courtId?.toString(),
    occurrenceDate: apiOccurrence.occurrenceDate,
    statusId: apiOccurrence.statusId?.toString(),
    createdAt: apiOccurrence.createdAt,
    updatedAt: apiOccurrence.updatedAt,
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
  const mapSkillLevel = (skillLevel: string): Level => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Intermediate';
    }
  };

  // Map payment status from API
  const mapPaymentStatus = (paymentStatus: string): 'Paid' | 'Pending' | 'Rejected' => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Paid';
    }
  };

  // Map participant status from statusId (general status)
  const mapStatusFromId = (statusId: number): any => {
    switch (statusId) {
      case 1: // CONFIRMED
        return 'READY';
      case 2: // PENDING
        return 'WAITLIST';
      case 3: // CHECKED_IN
        return 'IN-GAME';
      case 4: // RESTING
        return 'RESTING';
      case 5: // PENDING (from sample response)
        return 'WAITLIST';
      case 8: // COMPLETED (from sample response)
        return 'READY';
      default:
        return 'READY';
    }
  };

  // Map participant status from status description (new API format)
  const mapStatusFromDescription = (statusDescription: string): any => {
    switch (statusDescription?.toUpperCase()) {
      case 'CONFIRMED':
        return 'READY';
      case 'PENDING':
        return 'WAITLIST';
      case 'CHECKED_IN':
        return 'IN-GAME';
      case 'RESTING':
        return 'RESTING';
      case 'RESERVE':
        return 'RESERVE';
      case 'COMPLETED':
        return 'READY';
      case 'ONGOING':
        return 'IN-GAME';
      default:
        return 'READY';
    }
  };

  // Map player status from playerStatusId (specific player status)
  const mapPlayerStatusFromId = (playerStatusId: number | null): any => {
    if (!playerStatusId) {
      return 'READY'; // Default when no player status is set
    }
    
    switch (playerStatusId) {
      case 1: // READY
        return 'READY';
      case 2: // REST
        return 'RESTING';
      case 3: // WAITLIST
        return 'WAITLIST';
      case 6: // RESERVE
        return 'RESERVE';
      case 12: // ONGOING
        return 'IN-GAME';
      default:
        return 'READY';
    }
  };

  const participantName = apiParticipant.user?.personalInfo ? 
    `${apiParticipant.user.personalInfo.firstName} ${apiParticipant.user.personalInfo.lastName}`.trim() :
    apiParticipant.user?.userName || 'Unknown Player';
  return {
    id: apiParticipant.id.toString(),
    name: participantName,
    level: mapSkillLevel(apiParticipant.skillLevel),
    status: mapStatusFromDescription(apiParticipant.status?.description) || 
            mapPlayerStatusFromId(apiParticipant.playerStatusId) || 
            mapStatusFromId(apiParticipant.statusId),
    avatar: undefined,
    initials: apiParticipant.user?.personalInfo ? 
      generateInitials(`${apiParticipant.user.personalInfo.firstName} ${apiParticipant.user.personalInfo.lastName}`) :
      generateInitials(apiParticipant.user?.userName || 'Unknown'),
    paymentStatus: mapPaymentStatus(apiParticipant.paymentStatus),
    isApproved: apiParticipant.statusId === 1, // CONFIRMED
    checkedInAt: apiParticipant.checkedInAt,
    joinedAt: apiParticipant.registeredAt,
    notes: apiParticipant.notes,
    // Add additional fields for compatibility
    gamesPlayed: apiParticipant.gamesPlayed || 0,
    matchCount: apiParticipant.matchCount || 0,
    skillScore: apiParticipant.skillScore || 2,
    readyTime: apiParticipant.readyTime,
    // API structure
    user: apiParticipant.user
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
