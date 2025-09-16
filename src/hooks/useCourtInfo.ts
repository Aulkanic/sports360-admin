/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import type { Court, Match, Participant } from '@/components/features/open-play/types';
import type { GameMatch } from '@/services/game-match.service';

export interface CourtInfo {
  id: string;
  name: string;
  capacity: number;
  status: "Open" | "IN-GAME" | "Closed";
  location?: string;
  hourlyRate?: number;
  images?: string[];
  hasActiveMatch: boolean;
  hasInGameMatch: boolean;
  hasCompletedMatch: boolean;
  currentMatch?: Match;
  teamA: Participant[];
  teamB: Participant[];
  teamNames: { A: string; B: string };
  canStartGame: boolean;
  canEndGame: boolean;
  canCloseCourt: boolean;
}

export interface UseCourtInfoProps {
  courts: Court[];
  gameMatches: GameMatch[];
  courtTeams: Record<string, { A: Participant[]; B: Participant[] }>;
  teamNames: Record<string, { A: string; B: string }>;
}

export interface UseCourtInfoReturn {
  courtInfoList: CourtInfo[];
  getCourtInfo: (courtId: string) => CourtInfo | undefined;
  updateCourtTeams: (courtId: string, teams: { A: Participant[]; B: Participant[] }) => void;
  updateTeamNames: (courtId: string, names: { A: string; B: string }) => void;
  refreshCourtInfo: () => void;
}

export const useCourtInfo = ({
  courts,
  gameMatches,
  courtTeams,
  teamNames
}: UseCourtInfoProps): UseCourtInfoReturn => {
  const [localCourtTeams, setLocalCourtTeams] = useState(courtTeams);
  const [localTeamNames, setLocalTeamNames] = useState(teamNames);

  // Update local state when props change
  const refreshCourtInfo = useCallback(() => {
    setLocalCourtTeams(courtTeams);
    setLocalTeamNames(teamNames);
  }, [courtTeams, teamNames]);

  // Determine court status based on match status
  const getCourtStatus = useCallback((courtId: string): "Open" | "IN-GAME" | "Closed" => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    
    if (courtMatches.length === 0) {
      return "Open";
    }

    // Check if any match is in progress (matchStatusId === 5)
    const hasInProgressMatch = courtMatches.some(match => match.matchStatusId === 5);
    if (hasInProgressMatch) {
      return "IN-GAME";
    }

    // Check for other active statuses (assuming 1-9 are active, 10+ are completed/ended)
    const hasActiveMatch = courtMatches.some(match => {
      const statusId = match.matchStatusId;
      return statusId && statusId < 10 && statusId !== 5;
    });

    if (hasActiveMatch) {
      return "Closed"; // Court is occupied but not in active gameplay
    }

    return "Open";
  }, [gameMatches]);

  // Check if court has active match (not completed)
  const hasActiveMatch = useCallback((courtId: string): boolean => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    return courtMatches.some(match => {
      const statusId = match.matchStatusId;
      return statusId && statusId < 10;
    });
  }, [gameMatches]);

  // Check if court has in-game match
  const hasInGameMatch = useCallback((courtId: string): boolean => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    return courtMatches.some(match => match.matchStatusId === 5);
  }, [gameMatches]);

  // Check if court has completed match
  const hasCompletedMatch = useCallback((courtId: string): boolean => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    return courtMatches.some(match => {
      const statusId = match.matchStatusId;
      return statusId && statusId >= 10;
    });
  }, [gameMatches]);

  // Get current match for a court
  const getCurrentMatch = useCallback((courtId: string): Match | undefined => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    
    if (courtMatches.length === 0) return undefined;

    // Find the match with the most participants (or the first one if all are empty)
    const matchWithParticipants = courtMatches.find(match => 
      match.participants && match.participants.length > 0
    ) || courtMatches[0];

    // Convert GameMatch to Match format
    const teamA: Participant[] = [];
    const teamB: Participant[] = [];
    
    if (matchWithParticipants.participants) {
      matchWithParticipants.participants.forEach(participant => {
        const participantData: Participant = {
          id: participant.userId,
          name: participant.user ?
            (participant.user.personalInfo ?
              `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}` :
              participant.user.userName) :
            `User ${participant.userId}`,
          skillLevel: 'Intermediate',
          level: 'Intermediate' as const,
          status: 'IN-GAME',
          playerStatus: { id: 1, description: 'IN-GAME' },
          isApproved: true,
          gamesPlayed: 0,
          matchCount: 0,
          readyTime: new Date(participant.joinedAt).getTime(),
          skillScore: 2,
          paymentStatus: undefined,
          user: participant.user ? {
            id: participant.user.id,
            userName: participant.user.userName,
            email: participant.user.email,
            personalInfo: participant.user.personalInfo ? {
              firstName: participant.user.personalInfo.firstName,
              lastName: participant.user.personalInfo.lastName,
              contactNo: participant.user.personalInfo.contactNo
            } : undefined
          } : undefined,
          firstName: undefined,
          lastName: undefined
        };
        
        if (participant.team === 'A') {
          teamA.push(participantData);
        } else {
          teamB.push(participantData);
        }
      });
    }

    return {
      id: matchWithParticipants.id,
      courtId: matchWithParticipants.courtId,
      courtName: (matchWithParticipants as any).court?.courtName || `Court ${matchWithParticipants.courtId}`,
      teamA,
      teamB,
      teamAName: matchWithParticipants.team1Name,
      teamBName: matchWithParticipants.team2Name,
      status: (() => {
        if (matchWithParticipants.matchStatusId === 6) return 'Completed';
        if (matchWithParticipants.matchStatusId === 5) return 'IN-GAME';
        return 'Scheduled';
      })(),
      winner: undefined,
      score: undefined
    };
  }, [gameMatches]);

  // Check if game can start
  const canStartGame = useCallback((courtId: string): boolean => {
    const court = courts.find(c => c.id === courtId);
    const teams = localCourtTeams[courtId] ?? { A: [], B: [] };
    const totalPlayers = teams.A.length + teams.B.length;
    
    // Check if there's an active match for this court
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasActiveMatch = courtMatches.some(match => 
      match.matchStatusId && match.matchStatusId <= 10 && match.matchStatusId !== 5
    );
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    // Game can only start if court is open, has exactly 4 players, has an active match, but is not already in-game
    return court?.status === "Open" && totalPlayers === 4 && hasActiveMatch && !hasInGameMatch;
  }, [courts, localCourtTeams, gameMatches]);

  // Check if game can end
  const canEndGame = useCallback((courtId: string): boolean => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    return hasInGameMatch;
  }, [gameMatches]);

  // Check if court can be closed
  const canCloseCourt = useCallback((courtId: string): boolean => {
    const court = courts.find(c => c.id === courtId);
    return court?.status === "Open" || court?.status === "Closed";
  }, [courts]);

  // Generate structured court info list
  const courtInfoList = useMemo((): CourtInfo[] => {
    return courts.map(court => {
      const teams = localCourtTeams[court.id] ?? { A: [], B: [] };
      const names = localTeamNames[court.id] ?? { A: '', B: '' };
      
      return {
        id: court.id,
        name: court.name,
        capacity: court.capacity,
        status: getCourtStatus(court.id),
        location: court.location,
        hourlyRate: court.hourlyRate,
        images: court.images?.filter((img): img is string => typeof img === 'string'),
        hasActiveMatch: hasActiveMatch(court.id),
        hasInGameMatch: hasInGameMatch(court.id),
        hasCompletedMatch: hasCompletedMatch(court.id),
        currentMatch: getCurrentMatch(court.id),
        teamA: teams.A,
        teamB: teams.B,
        teamNames: names,
        canStartGame: canStartGame(court.id),
        canEndGame: canEndGame(court.id),
        canCloseCourt: canCloseCourt(court.id)
      };
    });
  }, [
    courts,
    localCourtTeams,
    localTeamNames,
    getCourtStatus,
    hasActiveMatch,
    hasInGameMatch,
    hasCompletedMatch,
    getCurrentMatch,
    canStartGame,
    canEndGame,
    canCloseCourt
  ]);

  // Get specific court info
  const getCourtInfo = useCallback((courtId: string): CourtInfo | undefined => {
    return courtInfoList.find(court => court.id === courtId);
  }, [courtInfoList]);


  // Update court teams
  const updateCourtTeams = useCallback((courtId: string, teams: { A: Participant[]; B: Participant[] }) => {
    setLocalCourtTeams(prev => ({
      ...prev,
      [courtId]: teams
    }));
  }, []);

  // Update team names
  const updateTeamNames = useCallback((courtId: string, names: { A: string; B: string }) => {
    setLocalTeamNames(prev => ({
      ...prev,
      [courtId]: names
    }));
  }, []);

  return {
    courtInfoList,
    getCourtInfo,
    updateCourtTeams,
    updateTeamNames,
    refreshCourtInfo
  };
};
