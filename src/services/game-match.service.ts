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
  team1Score?: number;
  team2Score?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  organizerNotes?: string;
  createdAt: string;
  updatedAt: string;
  participants?: GameMatchParticipant[];
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
  occurrence?: {
    id: string;
    sessionId: string;
    courtId: string;
    occurrenceDate: string;
    startTime: string;
    endTime: string;
    currentParticipants: number;
    sessionType: string;
    organizerNotes?: string;
    equipmentProvided: string[];
    registrationDeadline: string;
    cancellationDeadline: string;
    createdAt: string;
    updatedAt: string;
    statusId: number;
    paymentMethodId?: string;
    session: {
      id: string;
      hubId: string;
      sportsId: string;
      sessionName: string;
      description: string;
      maxParticipants: number;
      sessionType: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      pricePerPlayer: number;
      hub: {
        id: string;
        sportsHubName: string;
        streetAddress: string;
        city: string;
        stateProvince: string;
        zipPostalCode: string;
      };
      sport: {
        id: string;
        name: string;
      };
    };
  };
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
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo: string;
    };
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
  teamNumber?: 1 | 2;
  position?: string;
}

export interface AddPlayersToMatchRequest {
  userIds: string[];
}

export interface UpdatePlayerStatusRequest {
  playerStatus: string;
  teamNumber?: number;
  position?: string;
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
 * Add player to game match (single player)
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
 * Add multiple players to game match (matches API documentation format)
 */
export const addPlayersToMatch = async (matchId: string, playerData: AddPlayersToMatchRequest): Promise<any> => {
  try {
    const response = await apiClient.post(`/game-match/matches/${matchId}/add-player`, playerData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding players to match:', error);
    throw error;
  }
};

/**
 * Assign player to team in a match
 */
export const assignPlayerToTeam = async (matchId: string, participantId: string, teamNumber: number): Promise<any> => {
  try {
    const response = await apiClient.put('/game-match/participants/team', {
      matchId:Number(matchId),
      participantId:Number(participantId),
      teamNumber
    });
    return response.data.data;
  } catch (error) {
    console.error('Error assigning player to team:', error);
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

/**
 * Set winner for game match
 */
export const setGameMatchWinner = async (matchId: string, winner: "team1" | "team2"): Promise<any> => {
  try {
    const response = await apiClient.put(`/game-match/matches/${matchId}/winner`, { winner });
    return response.data.data;
  } catch (error) {
    console.error('Error setting game match winner:', error);
    throw error;
  }
};

/**
 * End game match
 */
export const endGameMatch = async (matchId: string): Promise<GameMatch> => {
  try {
    const response = await apiClient.put(`/game-match/matches/${matchId}/end`);
    return response.data.data;
  } catch (error) {
    console.error('Error ending game match:', error);
    throw error;
  }
};