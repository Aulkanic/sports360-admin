
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
  title: string;
  description?: string;
  when: string;
  location: string;
  eventType?: "one-time" | "recurring" | "tournament";
  level: Level[];
  participants: OpenPlayParticipant[];
  rules?: string;
  format?: string;
  capacity?: number;
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
}

export interface CreateOpenPlaySessionData {
  title: string;
  description?: string;
  hubId: string;
  sportId?: string;
  courtId?: string;
  levelId?: number;
  formatId?: number;
  pricePerPlayer?: number;
  currency?: string;
  capacity?: number;
  rules?: string;
  format?: string;
  schedules?: {
    weekday: number;
    startTime: string;
    endTime: string;
  }[];
  occurrences?: {
    date: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    pricePerPlayer?: number;
  }[];
}

export interface UpdateOpenPlaySessionData {
  title?: string;
  description?: string;
  levelId?: number;
  formatId?: number;
  pricePerPlayer?: number;
  currency?: string;
  capacity?: number;
  rules?: string;
  format?: string;
  statusId?: number;
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

    const response = await apiClient.get(`/admin-auth/open-play/sessions?${params.toString()}`);
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
    const response = await apiClient.get(`/admin-auth/open-play/sessions/${sessionId}`);
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
    const response = await apiClient.post('/admin-auth/open-play/sessions', sessionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating open-play session:', error);
    throw error;
  }
};

/**
 * Update an open-play program
 */
export const updateOpenPlayProgram = async (programId: string, updateData: UpdateOpenPlaySessionData): Promise<any> => {
  try {
    const response = await apiClient.put(`/admin-auth/open-play/programs/${programId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating open-play program:', error);
    throw error;
  }
};

/**
 * Update an open-play occurrence
 */
export const updateOpenPlayOccurrence = async (occurrenceId: string, updateData: any): Promise<any> => {
  try {
    const response = await apiClient.put(`/admin-auth/open-play/occurrences/${occurrenceId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating open-play occurrence:', error);
    throw error;
  }
};

/**
 * Delete an open-play program
 */
export const deleteOpenPlayProgram = async (programId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin-auth/open-play/programs/${programId}`);
  } catch (error) {
    console.error('Error deleting open-play program:', error);
    throw error;
  }
};

/**
 * Delete an open-play occurrence
 */
export const deleteOpenPlayOccurrence = async (occurrenceId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin-auth/open-play/occurrences/${occurrenceId}`);
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
    const response = await apiClient.get(`/admin-auth/open-play/occurrences/${occurrenceId}/participants`);
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
      `/admin-auth/open-play/occurrences/${occurrenceId}/participants/${userName}/status`,
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
    const response = await apiClient.get(`/admin-auth/open-play/stats${params}`);
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
    const response = await apiClient.get('/admin-auth/open-play/lookup');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching open-play lookup data:', error);
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
