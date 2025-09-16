/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getGameMatchesByOccurrenceId } from '@/services/game-match.service';
import { getAllCourts } from '@/services/court.service';
import { getUserProfileImageUrl } from '@/utils/image.utils';
import { API_CONFIG } from '@/config/api';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  level?: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
  // API fields
  playerStatusId?: number;
  registeredAt?: string;
  notes?: string | null;
  statusId?: number;
  paymentAmount?: string | null;
  apiPaymentStatus?: string | null;
  updatedPlayerStatusAt?: string | null;
  user?: {
    id: string;
    userName: string;
    email: string;
    upload?: {
      id: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: string;
    } | null;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo?: string;
      skillId?: number;
      upload?: {
        id: string;
        fileName: string;
        filePath: string;
      };
      skill?: {
        id: number;
        description: string;
      };
    };
  };
  apiStatus?: {
    id: number;
    description: string;
  };
  playerStatus?: {
    id: number;
    description: string;
  };
  email?: string;
  contactNo?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Rejected';
  skillLevel?: string;
  matchCount?: number;
}

export interface Court {
  id: string;
  name: string;
  capacity: number;
  status: "Open" | "In-Game" | "Closed";
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  startTime?: string;
  endTime?: string;
  score?: string;
  winner?: "A" | "B";
}

export interface MatchupData {
  id: string;
  sport: string;
  hubName?: string;
  occurrenceId?: string;
  occurrenceDate?: string;
  occurrenceStartTime?: string;
  occurrenceEndTime?: string;
  courts: Court[];
  focusedCourtId?: string;
}

export const useMatchupData = () => {
  const location = useLocation();
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserAvatarUrl = (user: any): string => {
    if (!user) {
      return '/default_avatar.png';
    }
    
    if (user.upload?.filePath) {
      if (user.upload.filePath.startsWith('http')) {
        return user.upload.filePath;
      }
      return `${API_CONFIG.IMG_URL}${user.upload.filePath}`;
    }
    
    if (user.upload?.fileName) {
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.fileName}`;
    }
    
    if (user.personalInfo?.upload?.filePath) {
      if (user.personalInfo.upload.filePath.startsWith('http')) {
        return user.personalInfo.upload.filePath;
      }
      return `${API_CONFIG.IMG_URL}${user.personalInfo.upload.filePath}`;
    }
    
    if (user.personalInfo?.upload?.fileName) {
      return `${API_CONFIG.IMG_URL}/uploads/${user.personalInfo.upload.fileName}`;
    }
    
    if (user.personalInfo?.photoUrl) {
      return user.personalInfo.photoUrl;
    }
    return getUserProfileImageUrl(user);
  };

  const convertGameMatchParticipant = (participant: any): Participant => {
    return {
      id: participant.id.toString(),
      name: participant.user?.personalInfo ? 
        `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}`.trim() :
        participant.user?.userName || 'Unknown Player',
      avatar: participant.user ? getUserAvatarUrl(participant.user) : '',
      initials: participant.user?.personalInfo ? 
        `${participant.user.personalInfo.firstName?.[0]}${participant.user.personalInfo.lastName?.[0]}` :
        participant.user?.userName?.[0] || 'U',
      level: (participant.user?.personalInfo?.skill?.description || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
      status: 'Ready' as any, 
      playerStatusId: participant.playerStatusId,
      registeredAt: participant.joinedAt,
      notes: null,
      statusId: participant.playerStatusId,
      paymentAmount: null,
      apiPaymentStatus: null,
      updatedPlayerStatusAt: participant.updatedAt,
      user: participant.user ? {
        ...participant.user,
        personalInfo: participant.user.personalInfo ? {
          ...participant.user.personalInfo,
          upload: participant.user.personalInfo.upload || undefined
        } : undefined
      } : undefined,
      apiStatus: undefined,
      playerStatus: undefined,
      email: participant.user?.email,
      contactNo: participant.user?.personalInfo?.contactNo || undefined,
      paymentStatus: 'Paid' as 'Paid' | 'Pending' | 'Rejected',
      skillLevel: participant.user?.personalInfo?.skill?.description || 'Intermediate',
      matchCount: participant.matchCount || 0
    };
  };

  const fetchMatchupData = async (occurrenceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hubId = localStorage.getItem('activeHubId') || '1';
      
      const [gameMatches, allCourts] = await Promise.all([
        getGameMatchesByOccurrenceId(occurrenceId),
        getAllCourts({ hubId: hubId })
      ]);
      const activeGameMatches = gameMatches.filter((match: any) => {
        const statusId = match.matchStatusId;
        const isActive = statusId && Number(statusId) <= 10;
        return isActive;
      });
      
      const courtToMatchMap = new Map();
      activeGameMatches.forEach((match: any) => {
        if (match.courtId) {
          courtToMatchMap.set(match.courtId, match);
        }
      });
      
      const courts: Court[] = allCourts.map((court: any) => {
        const match = courtToMatchMap.get(court.id);
        
        if (match) {
          const teamA: Participant[] = [];
          const teamB: Participant[] = [];
          
          if (match.participants && match.participants.length > 0) {
            match.participants.forEach((participant: any) => {
              const player = convertGameMatchParticipant(participant);
              
              if (participant.teamNumber === 1) {
                teamA.push(player);
              } else if (participant.teamNumber === 2) {
                teamB.push(player);
              }
            });
          }
          
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: (match.matchStatusId === 5) ? 'In-Game' : 
                    (match.matchStatusId === 6) ? 'Closed' : 'Open',
            teamA,
            teamB,
            teamAName: match.team1Name,
            teamBName: match.team2Name,
            startTime: match.startTime,
            endTime: match.endTime,
            score: match.team1Score && match.team2Score ? `${match.team1Score}-${match.team2Score}` : undefined,
            winner: match.winner as "A" | "B" | undefined
          };
        } else {
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: 'Open' as const,
            teamA: [],
            teamB: [],
            teamAName: undefined,
            teamBName: undefined,
            startTime: undefined,
            endTime: undefined,
            score: undefined,
            winner: undefined
          };
        }
      });
      
      const matchupData: MatchupData = {
        id: `matchup-${occurrenceId}`,
        sport: gameMatches[0]?.occurrence?.session?.sport?.name || 'Pickleball',
        hubName: gameMatches[0]?.occurrence?.session?.hub?.sportsHubName,
        occurrenceId: occurrenceId,
        occurrenceDate: gameMatches[0]?.occurrence?.occurrenceDate,
        occurrenceStartTime: gameMatches[0]?.occurrence?.startTime,
        occurrenceEndTime: gameMatches[0]?.occurrence?.endTime,
        courts: courts,
        focusedCourtId: localStorage.getItem('activeCourtId') || undefined
      };
      
      setMatchup(matchupData);
      
    } catch (error) {
      console.error('Error fetching matchup data:', error);
      setError('Failed to load matchup data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const urlParams = new URLSearchParams(location.search);
  const occurrenceId = urlParams.get('occurrenceId');

  // Initialize matchup data
  useEffect(() => {
    const activeOccurrenceId = localStorage.getItem('activeOccurrenceId');
    const finalOccurrenceId = occurrenceId || activeOccurrenceId;
    
    if (location.state?.matchup) {
      setMatchup(location.state.matchup);
    } else if (finalOccurrenceId) {
      fetchMatchupData(finalOccurrenceId);
    } else {
      setMatchup({
        id: "match-1",
        sport: "Pickleball",
        courts: []
      });
    }
  }, [location.state, occurrenceId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'MATCHUP_DATA') {
        setMatchup(event.data.data);
        const courtId = event.data.data.focusedCourtId;
        if (courtId) {
          localStorage.setItem('activeCourtId', courtId);
        } else {
          localStorage.removeItem('activeCourtId');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return {
    matchup,
    isLoading,
    error,
    fetchMatchupData
  };
};
