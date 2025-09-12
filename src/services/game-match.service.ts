import apiClient from '@/config/api';

export interface CreateGameMatchRequest {
  occurrenceId: string;
  courtId: string;
  matchName?: string;
  requiredPlayers?: number;
  team1Name?: string;
  team2Name?: string;
  organizerNotes?: string;
}

export interface GameMatch {
  id: string;
  occurrenceId: string;
  courtId: string;
  matchName?: string;
  matchStatus: string;
  gameStatus: string;
  requiredPlayers: number;
  currentPlayers: number;
  team1Name?: string;
  team2Name?: string;
  organizerNotes?: string;
  createdAt: string;
  updatedAt: string;
  participants?: GameMatchParticipant[];
}

export interface GameMatchParticipant {
  id: string;
  matchId: string;
  userId: string;
  team: 'A' | 'B';
  status: string;
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UpdateGameMatchRequest {
  matchName?: string;
  matchStatus?: string;
  gameStatus?: string;
  requiredPlayers?: number;
  team1Name?: string;
  team2Name?: string;
  organizerNotes?: string;
}

export interface AddPlayerToMatchRequest {
  userId: string;
  team: 'A' | 'B';
}

export interface UpdatePlayerStatusRequest {
  status: string;
}

// ==============================
// GAME MATCH API FUNCTIONS
// ==============================

/**
 * Create a new game match
 */
export const createGameMatch = async (matchData: CreateGameMatchRequest): Promise<GameMatch> => {
  try {
    const response = await apiClient.post('/game-match/create', matchData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating game match:', error);
    throw error;
  }
};

/**
 * Get all game matches
 */
export const getAllGameMatches = async (): Promise<GameMatch[]> => {
  try {
    const response = await apiClient.get('/game-match/matches');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching game matches:', error);
    throw error;
  }
};

/**
 * Get game match by ID
 */
export const getGameMatchById = async (matchId: string): Promise<GameMatch> => {
  try {
    const response = await apiClient.get(`/game-match/matches/${matchId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching game match:', error);
    throw error;
  }
};

/**
 * Get game matches by occurrence ID
 */
export const getGameMatchesByOccurrenceId = async (occurrenceId: string): Promise<GameMatch[]> => {
  try {
    const response = await apiClient.get(`/game-match/occurrence/${occurrenceId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching game matches by occurrence:', error);
    throw error;
  }
};

/**
 * Update game match
 */
export const updateGameMatch = async (matchId: string, updateData: UpdateGameMatchRequest): Promise<GameMatch> => {
  try {
    const response = await apiClient.put(`/game-match/matches/${matchId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating game match:', error);
    throw error;
  }
};

/**
 * Add player to game match
 */
export const addPlayerToMatch = async (matchId: string, playerData: AddPlayerToMatchRequest): Promise<GameMatchParticipant> => {
  try {
    const response = await apiClient.post(`/game-match/matches/${matchId}/add-player`, playerData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding player to match:', error);
    throw error;
  }
};

/**
 * Update player status in game match
 */
export const updatePlayerStatus = async (participantId: string, statusData: UpdatePlayerStatusRequest): Promise<GameMatchParticipant> => {
  try {
    const response = await apiClient.put(`/game-match/participants/${participantId}/status`, statusData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating player status:', error);
    throw error;
  }
};

/**
 * Remove player from game match
 */
export const removePlayerFromMatch = async (participantId: string): Promise<void> => {
  try {
    await apiClient.delete(`/game-match/participants/${participantId}`);
  } catch (error) {
    console.error('Error removing player from match:', error);
    throw error;
  }
};
