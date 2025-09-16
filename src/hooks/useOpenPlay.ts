/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  getAllOpenPlaySessions,
  getOpenPlaySessionById,
  createOpenPlaySession,
  updateOpenPlaySession,
  deleteOpenPlaySession,
  getOpenPlayStats,
  getOpenPlayLookup,
  getOpenPlayParticipants,
  updateParticipantStatus,
  updateParticipantPlayerStatusByAdmin,
  addPlayerToSession,
  checkCourtAvailability,
  type UpdateOpenPlaySessionData,
  type OpenPlaySession,
  type OpenPlayParticipant,
  type AddPlayerRequest,
  convertParticipantFromAPI,
  mapStatusToPlayerStatusId,
  mapParticipantStatusToPlayerStatusId,
} from '@/services/open-play.service';

// Query Keys
export const openPlayKeys = {
  all: ['openPlay'] as const,
  sessions: () => [...openPlayKeys.all, 'sessions'] as const,
  session: (id: string) => [...openPlayKeys.sessions(), id] as const,
  sessionsList: (filters?: any) => [...openPlayKeys.sessions(), 'list', filters] as const,
  stats: () => [...openPlayKeys.all, 'stats'] as const,
  lookup: () => [...openPlayKeys.all, 'lookup'] as const,
  participants: (occurrenceId: string) => [...openPlayKeys.all, 'participants', occurrenceId] as const,
  availability: (params: any) => [...openPlayKeys.all, 'availability', params] as const,
} as const;

// Types
export type LevelTag = "Beginner" | "Intermediate" | "Advanced";

export type OpenPlaySessionUI = {
  id: string;
  title: string;
  description?: string;
  when: string;
  location: string;
  eventType?: "one-time" | "recurring" | "tournament";
  level: LevelTag[];
  participants: (OpenPlayParticipant & {
    avatar?: string;
    initials?: string;
    level?: LevelTag;
  })[];
  occurrenceId?: string;
  occurrences?: any[];
  maxParticipants?: number;
  pricePerPlayer?: number;
  sessionType?: string;
  isActive?: boolean;
  createdAt?: string;
  hub?: any;
  sport?: any;
  totalOccurrences?: number;
  isDummy?: boolean;
  isFreeJoin?: boolean;
};

export interface OpenPlayFilters {
  hubId?: string;
  sportId?: string;
  statusId?: number;
  levelId?: number;
  search?: string;
  eventType?: "one-time" | "recurring" | "tournament";
  isActive?: boolean;
}

export interface UseOpenPlayOptions {
  filters?: OpenPlayFilters;
  enabled?: boolean;
  refetchInterval?: number;
}

// Main Hook
export const useOpenPlay = (options: UseOpenPlayOptions = {}) => {
  const queryClient = useQueryClient();
  const { filters = {}, enabled = true, refetchInterval } = options;

  // Convert API sessions to UI format
  const convertSessionsToUI = useCallback((apiSessions: OpenPlaySession[]): OpenPlaySessionUI[] => {
    return apiSessions.map((apiSession) => {
      const firstOccurrence = apiSession.occurrences?.[0];
      
      // Format the time display
      let whenDisplay = 'TBD';
      if (firstOccurrence) {
        const date = new Date(firstOccurrence.occurrenceDate);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        
        const start = new Date(`2000-01-01T${firstOccurrence.startTime}:00`);
        const end = new Date(`2000-01-01T${firstOccurrence.endTime}:00`);
        
        const startFormatted = start.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: false 
        });
        const endFormatted = end.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: false 
        });
        
        whenDisplay = `${dayName} • ${startFormatted}–${endFormatted}`;
      }

      // Map skill level
      const getSkillLevel = (skillLevel: string): LevelTag => {
        switch (skillLevel?.toLowerCase()) {
          case 'beginner': return 'Beginner';
          case 'intermediate': return 'Intermediate';
          case 'advanced': return 'Advanced';
          default: return 'Intermediate';
        }
      };

      return {
        id: apiSession.id.toString(),
        title: apiSession.sessionName,
        description: apiSession.description,
        when: whenDisplay,
        location: firstOccurrence?.court?.courtName || 'TBD',
        eventType: (apiSession.occurrences?.length || 0) > 1 ? 'recurring' : 'one-time',
        level: ['Beginner', 'Intermediate', 'Advanced'],
        participants: firstOccurrence?.participants?.map((p: any) => {
          const getParticipantStatus = (statusId: number, paymentStatus: string) => {
            if (paymentStatus === 'paid' && statusId === 5) return 'Ready';
            if (paymentStatus === 'pending') return 'Waitlist';
            if (paymentStatus === 'rejected') return 'Reserve';
            return 'Ready';
          };

          return {
            id: p.id.toString(),
            name: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}` :
              p.user?.userName || 'Unknown',
            status: getParticipantStatus(p.statusId, p.paymentStatus),
            avatar: undefined,
            initials: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName?.[0]}${p.user.personalInfo.lastName?.[0]}` :
              p.user?.userName?.[0] || '?',
            level: getSkillLevel(p.skillLevel),
            paymentStatus: p.paymentStatus,
            paymentAmount: p.paymentAmount,
            notes: p.notes,
            isApproved: p.statusId === 1,
            checkedInAt: p.checkedInAt,
            joinedAt: p.registeredAt,
            gamesPlayed: p.gamesPlayed || 0,
            matchCount: p.matchCount || 0,
            skillScore: p.skillScore || 2,
            readyTime: p.readyTime,
            user: p.user
          };
        }) || [],
        maxParticipants: apiSession.maxParticipants || 10,
        pricePerPlayer: apiSession.pricePerPlayer || 150,
        sessionType: (apiSession as any).sessionType || 'regular',
        isActive: (apiSession as any).isActive,
        createdAt: apiSession.createdAt,
        hub: (apiSession as any).hub,
        sport: (apiSession as any).sport,
        totalOccurrences: apiSession.occurrences?.length || 0,
        occurrences: apiSession.occurrences || [],
        isFreeJoin: apiSession.pricePerPlayer === 0
      };
    });
  }, []);

  // Queries
  const sessionsQuery = useQuery({
    queryKey: openPlayKeys.sessionsList(filters),
    queryFn: () => getAllOpenPlaySessions(filters),
    enabled,
    refetchInterval,
    select: convertSessionsToUI,
  });

  const statsQuery = useQuery({
    queryKey: openPlayKeys.stats(),
    queryFn: () => getOpenPlayStats(filters.hubId),
    enabled,
    refetchInterval,
  });

  const lookupQuery = useQuery({
    queryKey: openPlayKeys.lookup(),
    queryFn: getOpenPlayLookup,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: createOpenPlaySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.stats() });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpenPlaySessionData }) =>
      updateOpenPlaySession(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.session(id) });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteOpenPlaySession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.stats() });
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: addPlayerToSession,
    onSuccess: (_, variables) => {
      // Invalidate participants for the specific occurrence
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(variables.occurrenceId) 
      });
      // Invalidate sessions to update participant counts
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  const updateParticipantStatusMutation = useMutation({
    mutationFn: ({ 
      occurrenceId, 
      userName, 
      statusId 
    }: { 
      occurrenceId: string; 
      userName: string; 
      statusId: number 
    }) => updateParticipantStatus(occurrenceId, userName, statusId),
    onSuccess: (_, { occurrenceId }) => {
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(occurrenceId) 
      });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  const updatePlayerStatusMutation = useMutation({
    mutationFn: ({ 
      participantId, 
      occurrenceId, 
      playerStatusId 
    }: { 
      participantId: string; 
      occurrenceId: string; 
      playerStatusId: number | null 
    }) => updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId),
    onSuccess: (_, { occurrenceId }) => {
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(occurrenceId) 
      });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  // Computed values
  const sessions = sessionsQuery.data || [];
  const stats = statsQuery.data;
  const lookup = lookupQuery.data;

  const isLoading = sessionsQuery.isLoading || statsQuery.isLoading;
  const isError = sessionsQuery.isError || statsQuery.isError;
  const error = sessionsQuery.error || statsQuery.error;

  // Filtered sessions based on search and other filters
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchLower) ||
        session.description?.toLowerCase().includes(searchLower) ||
        session.location.toLowerCase().includes(searchLower)
      );
    }

    if (filters.eventType) {
      filtered = filtered.filter(session => session.eventType === filters.eventType);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(session => session.isActive === filters.isActive);
    }

    return filtered;
  }, [sessions, filters]);

  // Helper functions
  const getSessionById = useCallback((id: string) => {
    return sessions.find(session => session.id === id);
  }, [sessions]);

  const getSessionsByHub = useCallback((hubId: string) => {
    return sessions.filter(session => session.hub?.id === hubId);
  }, [sessions]);

  const getSessionsBySport = useCallback((sportId: string) => {
    return sessions.filter(session => session.sport?.id === sportId);
  }, [sessions]);

  const getActiveSessions = useCallback(() => {
    return sessions.filter(session => session.isActive);
  }, [sessions]);

  const getUpcomingSessions = useCallback(() => {
    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = new Date(session.createdAt || '');
      return sessionDate > now;
    });
  }, [sessions]);

  // Refetch functions
  const refetchSessions = useCallback(() => {
    return sessionsQuery.refetch();
  }, [sessionsQuery]);

  const refetchStats = useCallback(() => {
    return statsQuery.refetch();
  }, [statsQuery]);

  const refetchAll = useCallback(() => {
    return Promise.all([
      refetchSessions(),
      refetchStats(),
    ]);
  }, [refetchSessions, refetchStats]);

  return {
    // Data
    sessions: filteredSessions,
    stats,
    lookup,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Query states
    sessionsQuery,
    statsQuery,
    lookupQuery,
    
    // Mutations
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    addPlayer: addPlayerMutation.mutate,
    updateParticipantStatus: updateParticipantStatusMutation.mutate,
    updatePlayerStatus: updatePlayerStatusMutation.mutate,
    
    // Mutation states
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    isAddingPlayer: addPlayerMutation.isPending,
    isUpdatingParticipant: updateParticipantStatusMutation.isPending,
    isUpdatingPlayer: updatePlayerStatusMutation.isPending,
    
    // Helper functions
    getSessionById,
    getSessionsByHub,
    getSessionsBySport,
    getActiveSessions,
    getUpcomingSessions,
    
    // Refetch functions
    refetchSessions,
    refetchStats,
    refetchAll,
    
    // Utility functions
    convertSessionsToUI,
  };
};

// Individual session hook
export const useOpenPlaySession = (sessionId: string, enabled = true) => {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: openPlayKeys.session(sessionId),
    queryFn: () => getOpenPlaySessionById(sessionId),
    enabled: enabled && !!sessionId,
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data: UpdateOpenPlaySessionData) =>
      updateOpenPlaySession(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openPlayKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => deleteOpenPlaySession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
      queryClient.removeQueries({ queryKey: openPlayKeys.session(sessionId) });
    },
  });

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,
    error: sessionQuery.error,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    refetch: sessionQuery.refetch,
  };
};

// Participants hook
export const useOpenPlayParticipants = (occurrenceId: string, enabled = true) => {
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: openPlayKeys.participants(occurrenceId),
    queryFn: () => getOpenPlayParticipants(occurrenceId),
    enabled: enabled && !!occurrenceId,
    select: (data) => data.map(convertParticipantFromAPI),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userName, statusId }: { userName: string; statusId: number }) =>
      updateParticipantStatus(occurrenceId, userName, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(occurrenceId) 
      });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  const updatePlayerStatusMutation = useMutation({
    mutationFn: ({ 
      participantId, 
      playerStatusId 
    }: { 
      participantId: string; 
      playerStatusId: number | null 
    }) => updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(occurrenceId) 
      });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: (playerData: Omit<AddPlayerRequest, 'occurrenceId'>) =>
      addPlayerToSession({ ...playerData, occurrenceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: openPlayKeys.participants(occurrenceId) 
      });
      queryClient.invalidateQueries({ queryKey: openPlayKeys.sessions() });
    },
  });

  return {
    participants: participantsQuery.data || [],
    isLoading: participantsQuery.isLoading,
    isError: participantsQuery.isError,
    error: participantsQuery.error,
    updateStatus: updateStatusMutation.mutate,
    updatePlayerStatus: updatePlayerStatusMutation.mutate,
    addPlayer: addPlayerMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingPlayer: updatePlayerStatusMutation.isPending,
    isAddingPlayer: addPlayerMutation.isPending,
    refetch: participantsQuery.refetch,
  };
};

// Court availability hook
export const useCourtAvailability = () => {
  const checkAvailabilityMutation = useMutation({
    mutationFn: checkCourtAvailability,
  });

  return {
    checkAvailability: checkAvailabilityMutation.mutate,
    isChecking: checkAvailabilityMutation.isPending,
    availabilityData: checkAvailabilityMutation.data,
    error: checkAvailabilityMutation.error,
  };
};

// Utility functions
export const useOpenPlayUtils = () => {
  const mapStatusToId = useCallback((status: string) => {
    return mapStatusToPlayerStatusId(status);
  }, []);

  const mapPlayerStatusToId = useCallback((status: string) => {
    return mapParticipantStatusToPlayerStatusId(status);
  }, []);

  return {
    mapStatusToId,
    mapPlayerStatusToId,
  };
};

export default useOpenPlay;
