/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, type Location } from "react-router-dom";

import { SAMPLE_SESSIONS } from "@/components/features/open-play/data/sample-sessions";
import type {
  Court,
  Match,
  OpenPlaySession,
  Participant,
} from "@/components/features/open-play/types";
import { getStatusString, getSkillLevelAsLevel } from "@/components/features/open-play/types";
import { buildBalancedTeams } from "@/components/features/open-play/utils";
import AddPlayerModal, { type PlayerFormData } from "@/components/features/open-play/AddPlayerModal";
import { getOpenPlaySessionById, updateParticipantPlayerStatusByAdmin, mapParticipantStatusToPlayerStatusId, mapStatusToPlayerStatusId } from "@/services/open-play.service";
import { createGameMatch, assignPlayerToTeam, getGameMatchesByOccurrenceId, removePlayerFromMatch, updateGameMatch, setGameMatchWinner, type GameMatch } from "@/services/game-match.service";
import { useCourts } from "@/hooks";
import DetailsParticipantsTab from "@/components/features/open-play/DetailsParticipantsTab";
import GameManagementTab from "@/components/features/open-play/GameManagementTab";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { urls } from "@/routes";

import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import {
  Clock,
  MapPin,
} from "lucide-react";

/** Safe deep-clone that works on simple JSONy objects */
function deepClone<T>(obj: T): T {
  // Prefer native structuredClone when available
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

type LocationState = {
  session?: OpenPlaySession;
  occurrence?: any; // OpenPlayOccurrence type
};


const OpenPlayDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation() as Location & { state?: LocationState };
  const [tab, setTab] = useState<"details" | "game">("details");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Set<string>>(new Set());

  const stateSession = location.state?.session;
  const occurrence = location.state?.occurrence;
  const sessionById = useMemo(
    () => stateSession ?? SAMPLE_SESSIONS.find((s) => s.id === id),
    [stateSession, id]
  );

  // Convert skill level to numeric score for sorting
  const getSkillScore = (participant: Participant): number => {
    const skillLevel = getSkillLevelAsLevel(participant);
    switch (skillLevel) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      default: return 2;
    }
  };

  const [participants, setParticipants] = useState<Participant[]>(
    () => {
      // Use occurrence participants if available, otherwise use session participants
      const sourceParticipants = occurrence?.participants || sessionById?.participants || [];
      const initialParticipants = sourceParticipants as Participant[];
      
      // Initialize existing participants with game history data
      return initialParticipants.map(participant => ({
        ...participant,
        gamesPlayed: participant.gamesPlayed ?? Math.floor(Math.random() * 15), // Mock data
        readyTime: participant.readyTime ?? (getStatusString(participant.status) === 'Ready' ? Date.now() - Math.random() * 3600000 : undefined),
        skillScore: participant.skillScore ?? getSkillScore(participant)
      }));
    }
  );

  const [courts, setCourts] = useState<Court[]>([]);
  
  // Use the Court Management hook to get available courts
  const { items: courtManagementCourts } = useCourts();
  
  // Convert Court Management courts to Game Management format
  const availableCourts: Court[] = courtManagementCourts.map(court => ({
    id: court.id,
    name: court.name,
    capacity: court.capacity || 4,
    status: "Open" as const
  }));

  const [courtTeams, setCourtTeams] = useState<
    Record<string, { A: Participant[]; B: Participant[] }>
  >({ "court-1": { A: [], B: [] } });

  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});
  const [showWinnerDialog, setShowWinnerDialog] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<Record<string, { A: string; B: string }>>({});
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingGameMatch, setIsCreatingGameMatch] = useState(false);
  const [isAddingPlayersToMatch, setIsAddingPlayersToMatch] = useState<Set<string>>(new Set());
  const [isLoadingGameMatches, setIsLoadingGameMatches] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState<Set<string>>(new Set());
  const [isEndingGame, setIsEndingGame] = useState<Set<string>>(new Set());
  const [gameMatches, setGameMatches] = useState<any[]>([]); // Store raw game matches from API
  const hasFetchedGameMatches = useRef(false);

  // Helper function to find matchId for a given courtId
  const findMatchIdByCourtId = (courtId: string): string | null => {
    const match = gameMatches.find(match => match.courtId === courtId);
    return match ? match.id : null;
  };

  // Helper function to map player status from description
  const mapPlayerStatusFromDescription = (playerStatusDescription: string): any => {
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
  const [currentOccurrenceId, setCurrentOccurrenceId] = useState<string>("");
  const [rawSessionData, setRawSessionData] = useState<any>(null);
  
  // Check if the current session is dummy data
  const isDummySession = useMemo(() => {
    return sessionById?.isDummy || rawSessionData?.isDummy || false;
  }, [sessionById, rawSessionData]);

  // Get full participant information by matching participant ID
  const getFullParticipantInfo = useMemo(() => {
    return (participantId: string) => {
      console.log('🔍 OPEN-PLAY-DETAIL: Looking for participant ID:', participantId, 'Type:', typeof participantId);
      console.log('📊 OPEN-PLAY-DETAIL: Raw session data available:', !!rawSessionData);
      console.log('🏟️ OPEN-PLAY-DETAIL: Raw session occurrences count:', rawSessionData?.occurrences?.length);
      
      // First check if we have raw session data with occurrence participants
      if (rawSessionData?.occurrences) {
        console.log('✅ OPEN-PLAY-DETAIL: Raw session data has occurrences, searching...');
        for (const occurrence of rawSessionData.occurrences) {
          console.log(`🏟️ OPEN-PLAY-DETAIL: Checking occurrence ${occurrence.id}:`, {
            id: occurrence.id,
            participantsCount: occurrence.participants?.length,
            participants: occurrence.participants?.map((p: any) => ({
              id: p.id,
              idType: typeof p.id,
              name: p.user?.personalInfo?.firstName
            }))
          });
          
          if (occurrence.participants) {
            console.log('👥 OPEN-PLAY-DETAIL: Occurrence participants:', occurrence.participants.map((p: any) => ({ 
              id: p.id, 
              idString: p.id.toString(),
              name: p.user?.personalInfo?.firstName 
            })));
            
            const fullParticipant = occurrence.participants.find((p: any) => {
              const match = p.id.toString() === participantId;
              console.log(`🔍 OPEN-PLAY-DETAIL: Comparing: ${p.id} (${typeof p.id}) === ${participantId} (${typeof participantId}) = ${match}`);
              return match;
            });
            
            if (fullParticipant) {
              console.log('✅ OPEN-PLAY-DETAIL: Found full participant:', {
                id: fullParticipant.id,
                name: fullParticipant.user?.personalInfo?.firstName,
                email: fullParticipant.user?.email,
                skill: fullParticipant.user?.personalInfo?.skill,
                skillId: fullParticipant.user?.personalInfo?.skillId,
                profileUpload: fullParticipant.user?.personalInfo?.upload,
                profilePhoto: fullParticipant.user?.personalInfo?.photoUrl,
                skillScore: fullParticipant.skillScore,
                gamesPlayed: fullParticipant.gamesPlayed
              });
              return {
                id: fullParticipant.id.toString(),
                name: fullParticipant.user?.personalInfo ? 
                  `${fullParticipant.user.personalInfo.firstName} ${fullParticipant.user.personalInfo.lastName}`.trim() :
                  fullParticipant.user?.userName || 'Unknown Player',
                level: (fullParticipant.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
                status: mapPlayerStatusFromDescription(fullParticipant.playerStatus?.description) || fullParticipant.status?.description || 'READY',
                playerStatus: fullParticipant.playerStatus,
                skillLevel: fullParticipant.skillLevel,
                avatar: fullParticipant.user?.personalInfo?.photoUrl || undefined,
                initials: fullParticipant.user?.personalInfo ? 
                  `${fullParticipant.user.personalInfo.firstName?.[0]}${fullParticipant.user.personalInfo.lastName?.[0]}` :
                  fullParticipant.user?.userName?.[0] || '?',
                paymentAmount: fullParticipant.paymentAmount,
                notes: fullParticipant.notes,
                user: fullParticipant.user,
                isApproved: fullParticipant.statusId === 5, // Assuming statusId 5 means approved
                paymentStatus: undefined, // Not displaying payment status
                // Add additional fields that might be useful
                email: fullParticipant.user?.email,
                contactNo: fullParticipant.user?.personalInfo?.contactNo,
                address: fullParticipant.user?.personalInfo?.address,
                gender: fullParticipant.user?.personalInfo?.gender,
                birthday: fullParticipant.user?.personalInfo?.birthday,
                country: fullParticipant.user?.personalInfo?.country,
                // Add skills information
                skill: fullParticipant.user?.personalInfo?.skill,
                skillId: fullParticipant.user?.personalInfo?.skillId,
                // Add profile upload information
                profileUpload: fullParticipant.user?.personalInfo?.upload,
                profilePhoto: fullParticipant.user?.personalInfo?.photoUrl,
                // Additional skill-related fields
                skillScore: fullParticipant.skillScore,
                gamesPlayed: fullParticipant.gamesPlayed
              } as Participant & {
                email?: string;
                contactNo?: string;
                address?: string;
                gender?: string;
                birthday?: string;
                country?: string;
                skill?: any;
                skillId?: number;
                profileUpload?: any;
                profilePhoto?: string;
                skillScore?: number;
                gamesPlayed?: number;
              };
            }
          }
        }
      }
      
      // Fallback to current participants list
      const fallbackParticipant = participants.find(p => p.id === participantId);
      console.log('Fallback participant found:', fallbackParticipant);
      return fallbackParticipant;
    };
  }, [rawSessionData, participants]);

  // Enrich court teams with full participant information
  const enrichedCourtTeams = useMemo(() => {
    console.log('🏟️ ENRICHING COURT TEAMS:', courtTeams);
    const enriched: Record<string, { A: Participant[]; B: Participant[] }> = {};
    
    Object.entries(courtTeams).forEach(([courtId, teams]) => {
      console.log(`🏟️ PROCESSING COURT ${courtId}:`, {
        teamA: teams.A.map(p => ({ id: p.id, name: p.name })),
        teamB: teams.B.map(p => ({ id: p.id, name: p.name }))
      });
      
      enriched[courtId] = {
        A: teams.A.map(participant => {
          console.log(`🔍 ENRICHING TEAM A PARTICIPANT:`, participant.id, participant.name);
          const enriched = getFullParticipantInfo(participant.id) || participant;
          console.log(`📊 ENRICHED RESULT:`, {
            name: enriched.name,
            hasUser: !!enriched.user,
            skill: enriched.skill,
            skillId: enriched.skillId,
            profileUpload: enriched.profileUpload,
            profilePhoto: enriched.profilePhoto,
            skillScore: enriched.skillScore,
            gamesPlayed: enriched.gamesPlayed
          });
          return enriched;
        }),
        B: teams.B.map(participant => {
          console.log(`🔍 ENRICHING TEAM B PARTICIPANT:`, participant.id, participant.name);
          const enriched = getFullParticipantInfo(participant.id) || participant;
          console.log(`📊 ENRICHED RESULT:`, {
            name: enriched.name,
            hasUser: !!enriched.user,
            skill: enriched.skill,
            skillId: enriched.skillId,
            profileUpload: enriched.profileUpload,
            profilePhoto: enriched.profilePhoto,
            skillScore: enriched.skillScore,
            gamesPlayed: enriched.gamesPlayed
          });
          return enriched;
        })
      };
    });
    
    console.log('✅ ENRICHED COURT TEAMS RESULT:', enriched);
    return enriched;
  }, [courtTeams, getFullParticipantInfo]);

  const inAnyTeam = useMemo(
    () => {
      const teamPlayerIds = new Set(
        Object.values(courtTeams)
          .flatMap((t) => [...t.A, ...t.B])
          .map((p) => p.id)
      );
      console.log('🏟️ IN ANY TEAM CALCULATION:', {
        courtTeams: Object.keys(courtTeams),
        teamPlayerIds: Array.from(teamPlayerIds),
        courtTeamsData: Object.entries(courtTeams).map(([courtId, teams]) => ({
          courtId,
          teamA: teams.A.map(p => ({ id: p.id, name: p.name })),
          teamB: teams.B.map(p => ({ id: p.id, name: p.name }))
        }))
      });
      return teamPlayerIds;
    },
    [courtTeams]
  );

  const readyList = useMemo(
    () => {      
      console.log('participants', participants);
      console.log('inAnyTeam', Array.from(inAnyTeam));
      const ready = participants.filter((p) => {
        const statusString = getStatusString(p.status ?? '');
        const isReady = statusString?.toUpperCase() === "READY";
        const notInTeam = !inAnyTeam.has(p.id);
        console.log(`Player ${p.id} (${p.name}): isReady=${isReady}, notInTeam=${notInTeam}, status=${statusString}`);
        return isReady && notInTeam;
      });
      
      // Sort by priority based on updatedPlayerStatusAt timestamp
      const sortedReady = ready.sort((a, b) => {
        // Players with updatedPlayerStatusAt timestamp get higher priority (earlier timestamp = higher priority)
        const aTimestamp = a.updatedPlayerStatusAt ? new Date(a.updatedPlayerStatusAt).getTime() : 0;
        const bTimestamp = b.updatedPlayerStatusAt ? new Date(b.updatedPlayerStatusAt).getTime() : 0;
        
        // If both have timestamps, sort by timestamp (earlier first)
        if (aTimestamp > 0 && bTimestamp > 0) {
          return aTimestamp - bTimestamp;
        }
        
        // If only one has timestamp, prioritize the one with timestamp
        if (aTimestamp > 0 && bTimestamp === 0) {
          return -1; // a comes first
        }
        if (aTimestamp === 0 && bTimestamp > 0) {
          return 1; // b comes first
        }
        
        // If neither has timestamp, maintain original order (fallback to name for consistency)
        return a.name.localeCompare(b.name);
      });
      
      console.log('readyList (priority sorted)', sortedReady.map(p => ({ 
        id: p.id, 
        name: p.name, 
        updatedPlayerStatusAt: p.updatedPlayerStatusAt,
        priority: p.updatedPlayerStatusAt ? new Date(p.updatedPlayerStatusAt).toLocaleString() : 'No timestamp'
      })));
      return sortedReady;
    },
    [participants, inAnyTeam]
  );
  const restingList = useMemo(
    () => {
      const resting = participants.filter((p) => {
        const statusString = getStatusString(p.status)?.toUpperCase();
        const isResting = statusString === "RESTING";
        const notInTeam = !inAnyTeam.has(p.id);
        console.log(`Player ${p.id} (${p.name}): status=${statusString}, isResting=${isResting}, notInTeam=${notInTeam}`);
        return isResting && notInTeam;
      });
      console.log('🛌 RESTING LIST:', resting.map(p => ({ id: p.id, name: p.name, status: getStatusString(p.status) })));
      return resting;
    },
    [participants, inAnyTeam]
  );
  const reserveList = useMemo(
    () => participants.filter((p) => getStatusString(p.status)?.toUpperCase() === "RESERVE" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const waitlistList = useMemo(
    () => participants.filter((p) => getStatusString(p.status)?.toUpperCase() === "WAITLIST" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );

  // Use raw session data if available, otherwise fall back to sessionById
  const session = useMemo(() => {
    if (rawSessionData) return rawSessionData;
    if (sessionById) return { ...sessionById, participants };
    return null;
  }, [rawSessionData, sessionById, participants]);

  // Convert GameMatch to existing Match format
  const convertGameMatchToMatch = (gameMatch: GameMatch): Match => {
    const teamA: Participant[] = [];
    const teamB: Participant[] = [];
    
    if (gameMatch.participants) {
      gameMatch.participants.forEach(participant => {
        const participantData: Participant = {
          id: participant.userId,
          name: participant.user ? 
            (participant.user.personalInfo ? 
              `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}` : 
              participant.user.userName) : 
            `User ${participant.userId}`,
          skillLevel: 'Intermediate' as const, // Default value, could be enhanced
          level: 'Intermediate' as const,
          status: 'IN-GAME',
          playerStatus: { id: 1, description: 'IN-GAME' },
          isApproved: true,
          gamesPlayed: 0,
          readyTime: new Date(participant.joinedAt).getTime(),
          skillScore: 2,
          paymentStatus: undefined, // Not displaying payment status
          user: participant.user ? {
            id: participant.user.id,
            userName: participant.user.userName,
            email: participant.user.email,
            personalInfo: participant.user.personalInfo ? {
              firstName: participant.user.personalInfo.firstName,
              lastName: participant.user.personalInfo.lastName,
              contactNo: participant.user.personalInfo.contactNo
            } : undefined
          } : undefined
        };
        
        if (participant.team === 'A') {
          teamA.push(participantData);
        } else {
          teamB.push(participantData);
        }
      });
    }
    
    return {
      id: gameMatch.id,
      courtId: gameMatch.courtId,
      courtName: (gameMatch as any).court?.courtName || `Court ${gameMatch.courtId}`,
      teamA,
      teamB,
      teamAName: gameMatch.team1Name,
      teamBName: gameMatch.team2Name,
      status: gameMatch.matchStatus === 'completed' ? 'Completed' : 'Scheduled',
      winner: undefined,
      score: undefined
    };
  };

  // Convert GameMatch participants to court teams format
  const convertGameMatchToCourtTeams = (gameMatch: GameMatch) => {
    const teamA: Participant[] = [];
    const teamB: Participant[] = [];
    
    if (gameMatch.participants) {
      console.log('Processing participants for match:', gameMatch.id, gameMatch.participants);
      
      gameMatch.participants.forEach(participant => {
        console.log('Processing participant:', participant);
        
        // Use participantId instead of userId for the ID
        const participantId = (participant as any).participantId?.toString() || participant.userId?.toString();
        
        const participantData: Participant = {
          id: participantId,
          name: participant.user ? 
            (participant.user.personalInfo ? 
              `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}` : 
              participant.user.userName) : 
            `Player ${participantId}`,
          skillLevel: 'Intermediate' as const,
          level: 'Intermediate' as const,
          status: 'IN-GAME',
          playerStatus: { 
            id: (participant as any).playerStatusId || 1, 
            description: 'IN-GAME' 
          },
          isApproved: true,
          gamesPlayed: (participant as any).matchCount || 0,
          readyTime: new Date(participant.joinedAt).getTime(),
          skillScore: 2,
          paymentStatus: undefined, // Not displaying payment status
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
          avatar: undefined,
          initials: participant.user ? 
            (participant.user.personalInfo ? 
              `${participant.user.personalInfo.firstName?.[0]}${participant.user.personalInfo.lastName?.[0]}` : 
              participant.user.userName?.[0]) : 
            `P${participantId}`
        };
        
        console.log('Created participant data:', participantData);
        
        // Assign to team based on teamNumber (1 = Team A, 2 = Team B)
        const teamNumber = (participant as any).teamNumber;
        console.log(`Assigning participant ${participantData.name} to team ${teamNumber}`);
        
        if (teamNumber === 1) {
          teamA.push(participantData);
          console.log(`Added to Team A: ${participantData.name}`);
        } else if (teamNumber === 2) {
          teamB.push(participantData);
          console.log(`Added to Team B: ${participantData.name}`);
        } else {
          console.warn(`Unknown team number ${teamNumber} for participant ${participantData.name}`);
        }
      });
    }
    
    console.log('Final teams for match', gameMatch.id, ':', { A: teamA, B: teamB });
    return { A: teamA, B: teamB };
  };


  // Set initial occurrence ID from navigation state or session data
  useEffect(() => {
    if (occurrence?.id) {
      setCurrentOccurrenceId(occurrence.id);
    } else if (id && !rawSessionData) {
      // If no raw session data, fetch it using the ID from URL
      const fetchInitialSessionData = async () => {
        try {
          // Check if this is dummy data first
          if (sessionById?.isDummy) {
            console.log('Dummy session detected, skipping API call');
            // For dummy data, use the session data directly
            setRawSessionData(sessionById);
            if (sessionById.occurrences && sessionById.occurrences.length > 0) {
              setCurrentOccurrenceId(sessionById.occurrences[0].id);
            }
            return;
          }
          
          const sessionData = await getOpenPlaySessionById(id);
          setRawSessionData(sessionData);
          if (sessionData.occurrences && sessionData.occurrences.length > 0) {
            setCurrentOccurrenceId(sessionData.occurrences[0].id);
          }
        } catch (error) {
          console.error('Error fetching initial session data:', error);
        }
      };
      fetchInitialSessionData();
    }
  }, [occurrence?.id, id, rawSessionData, sessionById]);

  // Process participants when rawSessionData changes (for initial load)
  useEffect(() => {
    if (!rawSessionData) return;
    
    console.log('Processing participants from rawSessionData:', rawSessionData);
    
    // If we have occurrence-specific data, find the matching occurrence
    if (occurrence?.id && rawSessionData.occurrences) {
      const matchingOccurrence = rawSessionData.occurrences.find((occ: any) => occ.id === occurrence.id);
      if (matchingOccurrence?.participants) {
        console.log('Using occurrence-specific participants (initial load):', matchingOccurrence.participants);
        
        // Use raw participants data without conversion
        const freshParticipants = matchingOccurrence.participants.map((p: any) => ({
          id: p.id.toString(),
          name: p.user?.personalInfo ? 
            `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}`.trim() :
            p.user?.userName || 'Unknown Player',
          level: (p.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
          status: mapPlayerStatusFromDescription(p.playerStatus?.description) || p.status?.description || 'READY',
          playerStatus: p.playerStatus,
          skillLevel: p.skillLevel,
          avatar: undefined,
          initials: p.user?.personalInfo ? 
            `${p.user.personalInfo.firstName?.[0] || ''}${p.user.personalInfo.lastName?.[0] || ''}` :
            p.user?.userName?.[0] || 'U',
          isApproved: p.statusId === 1, // CONFIRMED
          checkedInAt: p.checkedInAt,
          joinedAt: p.registeredAt,
          notes: p.notes,
          gamesPlayed: 0,
          skillScore: p.skillLevel === 'beginner' ? 1 : p.skillLevel === 'advanced' ? 3 : 2,
          readyTime: undefined,
          paymentStatus: undefined, // Not displaying payment status
          user: p.user
        }));
        
        // Update participants with fresh data from server
        setParticipants(freshParticipants);
        console.log('Updated participants from occurrence (initial load):', freshParticipants);
      }
    } else if (rawSessionData.occurrences && rawSessionData.occurrences.length > 0) {
      // Use first occurrence participants if no specific occurrence
      const firstOccurrence = rawSessionData.occurrences[0];
      if (firstOccurrence?.participants) {
        console.log('Using first occurrence participants (initial load):', firstOccurrence.participants);
        
        // Use raw participants data without conversion
        const freshParticipants = firstOccurrence.participants.map((p: any) => ({
          id: p.id.toString(),
          name: p.user?.personalInfo ? 
            `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}`.trim() :
            p.user?.userName || 'Unknown Player',
          level: (p.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
          status: mapPlayerStatusFromDescription(p.playerStatus?.description) || p.status?.description || 'READY',
          playerStatus: p.playerStatus,
          skillLevel: p.skillLevel,
          avatar: undefined,
          initials: p.user?.personalInfo ? 
            `${p.user.personalInfo.firstName?.[0] || ''}${p.user.personalInfo.lastName?.[0] || ''}` :
            p.user?.userName?.[0] || 'U',
          isApproved: p.statusId === 1, // CONFIRMED
          checkedInAt: p.checkedInAt,
          joinedAt: p.registeredAt,
          notes: p.notes,
          gamesPlayed: 0,
          skillScore: p.skillLevel === 'beginner' ? 1 : p.skillLevel === 'advanced' ? 3 : 2,
          readyTime: undefined,
          paymentStatus: undefined, // Not displaying payment status
          user: p.user
        }));
        
        // Update participants with fresh data from server
        setParticipants(freshParticipants);
        console.log('Updated participants from first occurrence (initial load):', freshParticipants);
      }
    }
  }, [rawSessionData, occurrence?.id]);

  // Fetch game matches on component mount and when occurrence changes
  useEffect(() => {
    if (occurrence?.id && !hasFetchedGameMatches.current) {
      console.log('Fetching game matches for occurrence:', occurrence.id);
      hasFetchedGameMatches.current = true;
      // Clear existing data before fetching new matches
      setCourts([]);
      setCourtTeams({});
      setTeamNames({});
      setMatches([]);
      fetchGameMatches();
    }
  }, [occurrence?.id]);

  // Fetch game matches when game management tab is accessed
  useEffect(() => {
    if (tab === "game") {
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      console.log('Game management tab accessed');
      
      if (occurrenceId && !isLoadingGameMatches && courts.length === 0) {
        // Only fetch if not already loading and no courts are loaded
        console.log('Fetching game matches...');
        fetchGameMatches();
      } else if (courts.length > 0) {
        console.log('Courts already loaded, skipping fetch');
      } else if (isLoadingGameMatches) {
        console.log('Already loading, skipping fetch');
      } else {
        console.log('No occurrence ID available for fetching game matches');
      }
    }
  }, [tab]); // Only depend on tab to prevent infinite loops

  

  async function updateStatus(participantId: string, status: any) {
    console.log(`Updating participant ${participantId} to status: ${status}`);
    
    // Get the current occurrence ID
    const occurrenceId = currentOccurrenceId || occurrence?.id;

    // Check if we have occurrence data
    if (!occurrenceId) {
      console.warn('No occurrence ID available for status update');
      alert('No occurrence ID available. Please refresh the page and try again.');
      return;
    }

    // Set loading state
    setIsUpdatingStatus(prev => new Set(prev).add(participantId));

    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for status update');
        // For dummy data, just update the local state
        setParticipants(prev => prev.map(p => 
          p.id === participantId 
            ? { ...p, status: status }
            : p
        ));
        setIsUpdatingStatus(prev => {
          const newSet = new Set(prev);
          newSet.delete(participantId);
          return newSet;
        });
        return;
      }

      // Map status to player status ID
      const playerStatusId = mapParticipantStatusToPlayerStatusId(status);
      console.log(`Mapped status "${status}" to playerStatusId: ${playerStatusId}`);
      
      // Call admin API
      console.log(`Calling API with participantId: ${participantId}, occurrenceId: ${occurrenceId}, playerStatusId: ${playerStatusId}`);
      await updateParticipantPlayerStatusByAdmin(
        participantId,
        occurrenceId,
        playerStatusId
      );

      // Refresh session data to get updated participant information from server
      await refreshSessionData();
      
      console.log(`Successfully updated participant ${participantId} to status: ${status}`);
    } catch (error) {
      console.error('Error updating participant status:', error);
      // Show error message to user
      alert('Failed to update participant status. Please try again.');
    } finally {
      // Clear loading state
      setIsUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  }

  function removeFromAllTeams(participantId: string) {
    setCourtTeams((prev) => {
      const next = deepClone(prev);
      for (const cid of Object.keys(next)) {
        next[cid].A = next[cid].A.filter((p) => p.id !== participantId);
        next[cid].B = next[cid].B.filter((p) => p.id !== participantId);
      }
      return next;
    });
  }

  // Helper function to find which match a participant is currently in
  function findParticipantMatchId(participantId: string): string | null {
    for (const [courtId, teams] of Object.entries(courtTeams)) {
      if (teams.A.some(p => p.id === participantId) || teams.B.some(p => p.id === participantId)) {
        return courtId; // courtId is the match ID
      }
    }
    return null;
  }

  // Helper function to remove player from match via API
  async function removePlayerFromMatchAPI(participantId: string, matchId: string) {
    try {
      await removePlayerFromMatch(participantId);
      console.log(`Player ${participantId} removed from match ${matchId}`);
    } catch (error) {
      console.error('Error removing player from match:', error);
      // Don't throw error here to avoid breaking the drag operation
      // The UI will still update locally, but the API call failed
    }
  }

  async function moveToCourtTeam(courtId: string, teamKey: "A" | "B", participant: Participant) {
    // Check if court is closed
    const court = courts.find(c => c.id === courtId);
    if (court?.status === "Closed") {
      alert("Cannot add players to a closed court");
      return;
    }

    // Check if court already has 4 players
    const currentTeams = courtTeams[courtId] ?? { A: [], B: [] };
    const currentTotalPlayers = currentTeams.A.length + currentTeams.B.length;
    if (currentTotalPlayers >= 4) {
      alert("Court already has maximum 4 players");
      return;
    }

    // Check if participant is currently in a different match
    const currentMatchId = findParticipantMatchId(participant.id);
    if (currentMatchId && currentMatchId !== courtId) {
      // Remove from current match first
      await removePlayerFromMatchAPI(participant.id, currentMatchId);
    }

    setCourtTeams((prev) => {
      const next = deepClone(prev);
      if (!next[courtId]) next[courtId] = { A: [], B: [] };

      // Ensure participant is not on any team on any court
      for (const k of Object.keys(next)) {
        next[k].A = next[k].A.filter((p) => p.id !== participant.id);
        next[k].B = next[k].B.filter((p) => p.id !== participant.id);
      }

      const perTeam = Math.floor((courts.find((c) => c.id === courtId)?.capacity ?? 4) / 2);
      if (next[courtId][teamKey].length >= perTeam) return prev;

      next[courtId][teamKey].push({ ...participant, status: "IN-GAME" });
      return next;
    });

    // Call API to add player to match
    setIsAddingPlayersToMatch(prev => new Set(prev).add(participant.id));
    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for player assignment');
        setIsAddingPlayersToMatch(prev => {
          const newSet = new Set(prev);
          newSet.delete(participant.id);
          return newSet;
        });
        return;
      }

      // Find the matchId for this court
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court');
        return;
      }

      // Convert team key to team number (A = 1, B = 2)
      const teamNumber = teamKey === 'A' ? 1 : 2;
      
      // Assign player to team
      await assignPlayerToTeam(matchId, participant.id, teamNumber);
      console.log(`Player ${participant.name} assigned to team ${teamKey} (${teamNumber}) in match ${matchId} (court ${courtId})`);
      
      // Refetch matches to get updated data from server
      await fetchGameMatches();
    } catch (error) {
      console.error('Error in player assignment process:', error);
      // Revert the local state change on API error
      setCourtTeams((prev) => {
        const next = deepClone(prev);
        next[courtId][teamKey] = next[courtId][teamKey].filter((p) => p.id !== participant.id);
        return next;
      });
      
      // Enhanced error handling
      let errorMessage = 'Failed to assign player to team. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('already in')) {
          errorMessage = 'Player is already in this match.';
        } else if (error.message.includes('full')) {
          errorMessage = 'Match is full. Cannot add more players.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Match or player not found. Please refresh and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      alert(errorMessage);
    } finally {
      setIsAddingPlayersToMatch(prev => {
        const newSet = new Set(prev);
        newSet.delete(participant.id);
        return newSet;
      });
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const participant = (active?.data?.current as { participant?: Participant } | undefined)
      ?.participant;
    if (!participant) return;

    const overId = String(over.id as UniqueIdentifier);

    // Check if participant is currently in a match
    const currentMatchId = findParticipantMatchId(participant.id);

    // Queues - when dragging from match to queue, remove from match first
    if (overId === "ready") {
      if (currentMatchId) {
        await removePlayerFromMatchAPI(participant.id, currentMatchId);
      }
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "READY");
      return;
    }
    if (overId === "resting") {
      if (currentMatchId) {
        await removePlayerFromMatchAPI(participant.id, currentMatchId);
      }
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "RESTING");
      return;
    }
    if (overId === "reserve") {
      if (currentMatchId) {
        await removePlayerFromMatchAPI(participant.id, currentMatchId);
      }
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "RESERVE");
      return;
    }
    if (overId === "waitlist") {
      if (currentMatchId) {
        await removePlayerFromMatchAPI(participant.id, currentMatchId);
      }
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "WAITLIST");
      return;
    }

    // Court targets: "court-1:A" | "court-1:B"
    const [courtId, teamKey] = overId.split(":");
    if (courtId && (teamKey === "A" || teamKey === "B")) {
      await moveToCourtTeam(courtId, teamKey, participant);
    }
  }

  /* Controls */

  async function addCourt(data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number;
  }) {
    const selectedCourt = availableCourts.find(c => c.id === data.courtId);
    if (!selectedCourt) return;

    setIsCreatingGameMatch(true);
    
    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for game match creation');
        // For dummy data, just add the court to local state
        const newCourt: Court = {
          id: data.courtId,
          name: selectedCourt.name,
          capacity: selectedCourt.capacity || 4,
          status: "Open" as const
        };
        setCourts(prev => [...prev, newCourt]);
        setIsCreatingGameMatch(false);
        return;
      }

      // Create game match record in the backend
      const gameMatchData = {
        occurrenceId: currentOccurrenceId || occurrence?.id || sessionById?.occurrenceId || '1', // Use current occurrence ID first
        courtId: data.courtId,
        matchName: `${data.team1Name} vs ${data.team2Name} - ${data.matchDuration}min`,
        requiredPlayers: selectedCourt.capacity || 4,
        team1Name: data.team1Name,
        team2Name: data.team2Name,
        organizerNotes: `Game match created for ${selectedCourt.name} - ${data.matchDuration} minutes`
      };

      const createdMatch = await createGameMatch(gameMatchData);

      console.log('Game match created successfully:', createdMatch);
      
      // Refetch the matches list to get updated data from server
      await fetchGameMatches();
    } catch (error) {
      console.error('Error creating game match:', error);
      // Show error to user (you might want to add a toast notification here)
      alert('Failed to create game match. Please try again.');
    } finally {
      setIsCreatingGameMatch(false);
    }
  }

  function renameCourt(courtId: string) {
    const newName = window.prompt(
      "Rename court",
      courts.find((c) => c.id === courtId)?.name ?? "Court"
    );
    if (!newName) return;
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, name: newName } : c)));
  }

  function toggleCourtOpen(courtId: string) {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId ? { ...c, status: c.status === "Closed" ? "Open" : "Closed" } : c
      )
    );
  }

  async function startGame(courtId: string) {
    try {
      console.log('🚀 STARTING GAME for court/match ID:', courtId);
      
      // Set loading state
      setIsStartingGame(prev => new Set(prev).add(courtId));
      
      // Call API to update game match status
      const updateData = {
        matchStatus: "5",
        gameStatus: "5",
        startTime: new Date().toISOString()
      };
      
      console.log('📡 CALLING updateGameMatch API with data:', updateData);
      await updateGameMatch(courtId, updateData);
      console.log('✅ GAME MATCH UPDATED SUCCESSFULLY');
      
      // Update local state
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "IN-GAME" } : c)));
    const t = courtTeams[courtId] ?? { A: [], B: [] };
    await Promise.all([...t.A, ...t.B].map((p) => updateStatus(p.id, "IN-GAME")));
      
      console.log('✅ GAME STARTED SUCCESSFULLY');
    } catch (error) {
      console.error('❌ ERROR STARTING GAME:', error);
      // You might want to show a toast notification or error message to the user
      alert('Failed to start game. Please try again.');
    } finally {
      // Clear loading state
      setIsStartingGame(prev => {
        const newSet = new Set(prev);
        newSet.delete(courtId);
        return newSet;
      });
    }
  }

  function endGame(courtId: string) {
    // Show winner selection dialog instead of automatically ending
    setShowWinnerDialog(courtId);
  }

  async function confirmGameEnd(courtId: string, winner: "A" | "B", score?: string) {
    try {
      console.log('🏁 ENDING GAME for court/match ID:', courtId, 'Winner:', winner, 'Score:', score);
      
      // Set loading state
      setIsEndingGame(prev => new Set(prev).add(courtId));
      
      // First, update game match status to completed
      const updateData = {
        matchStatus: "completed",
        gameStatus: "completed",
        endTime: new Date().toISOString()
      };
      
      console.log('📡 CALLING updateGameMatch API with data:', updateData);
      await updateGameMatch(courtId, updateData);
      console.log('✅ GAME MATCH STATUS UPDATED SUCCESSFULLY');
      
      // Then, set the winner using the dedicated winner API
      const winnerTeam = winner === "A" ? "team1" : "team2";
      console.log('🏆 CALLING setGameMatchWinner API with winner:', winnerTeam);
      await setGameMatchWinner(courtId, winnerTeam);
      console.log('✅ GAME MATCH WINNER SET SUCCESSFULLY');
      
      // Update local state
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "Open" } : c)));
    const t = courtTeams[courtId] ?? { A: [], B: [] };
    
      // Update participants to resting
      console.log('🔄 UPDATING PARTICIPANTS TO RESTING:', t.A.concat(t.B).map(p => ({ id: p.id, name: p.name })));
    await Promise.all([...t.A, ...t.B].map(async (p) => {
        console.log(`🔄 UPDATING PARTICIPANT ${p.id} (${p.name}) TO RESTING`);
      await updateStatus(p.id, "RESTING");
      }));
      console.log('✅ ALL PARTICIPANTS UPDATED TO RESTING');
    
    // Create a match record for this completed game
    const newMatch: Match = {
      id: `${courtId}-${Date.now()}`,
      courtId,
      courtName: courts.find(c => c.id === courtId)?.name ?? "Unknown Court",
      teamA: t.A,
      teamB: t.B,
      teamAName: teamNames[courtId]?.A,
      teamBName: teamNames[courtId]?.B,
      status: "Completed",
      winner,
      score: score || "N/A"
    };
    
    setMatches(prev => [...prev, newMatch]);
    setCourtTeams((prev) => ({ ...prev, [courtId]: { A: [], B: [] } }));
    setShowWinnerDialog(null);
      
      console.log('✅ GAME ENDED SUCCESSFULLY');
    } catch (error) {
      console.error('❌ ERROR ENDING GAME:', error);
      // You might want to show a toast notification or error message to the user
      alert('Failed to end game. Please try again.');
    } finally {
      // Clear loading state
      setIsEndingGame(prev => {
        const newSet = new Set(prev);
        newSet.delete(courtId);
        return newSet;
      });
    }
  }

  async function matchMakeCourt(courtId: string) {
    // Check if court is closed
    const court = courts.find(c => c.id === courtId);
    if (court?.status === "Closed") {
      alert("Cannot add players to a closed court");
      return;
    }

    // Check if court already has 4 players
    const currentTeams = courtTeams[courtId] ?? { A: [], B: [] };
    const currentTotalPlayers = currentTeams.A.length + currentTeams.B.length;
    if (currentTotalPlayers >= 4) {
      alert("Court already has maximum 4 players");
      return;
    }

    const perTeam = Math.floor((courts.find((c) => c.id === courtId)?.capacity ?? 4) / 2);
    const need = perTeam * 2;
    
    // Enhanced player selection algorithm
    const selectedPlayers = selectPlayersForMatch(readyList, need);
    
    if (selectedPlayers.length < 2) {
      alert("Need at least 2 ready players to start a match");
      return;
    }

    const { A, B } = buildBalancedTeams(selectedPlayers, perTeam);
    setCourtTeams((prev) => ({ ...prev, [courtId]: { A, B } }));

    // Call API to add all players to match (this will also update their status)
    const allPlayers = [...A, ...B];
    setIsAddingPlayersToMatch(prev => new Set([...prev, ...allPlayers.map(p => p.id)]));
    
    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for random pick');
        setIsAddingPlayersToMatch(prev => {
          const newSet = new Set(prev);
          allPlayers.forEach(player => newSet.delete(player.id));
          return newSet;
        });
        return;
      }

      // Find the matchId for this court
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court');
        return;
      }

      // Assign each player to their respective team using the new API
      const teamAAssignments = A.map(player => assignPlayerToTeam(matchId, player.id, 1));
      const teamBAssignments = B.map(player => assignPlayerToTeam(matchId, player.id, 2));
      
      // Wait for all assignments to complete
      await Promise.all([...teamAAssignments, ...teamBAssignments]);
      console.log(`All players assigned to teams in match ${matchId} (court ${courtId}) via random pick`);
      
      // Update local state to reflect the team assignments immediately
      console.log('Updating local state with team assignments:', { A, B });
      
      // Refetch matches to get updated data from server (but don't wait for it)
      fetchGameMatches().catch(error => {
        console.warn('Failed to refetch matches after random pick:', error);
      });
    } catch (error) {
      setCourtTeams((prev) => ({ ...prev, [courtId]: { A: [], B: [] } }));
      
      // Enhanced error handling for random pick
      let errorMessage = 'Failed to assign players to teams. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('already in')) {
          errorMessage = 'One or more players are already in this match.';
        } else if (error.message.includes('full')) {
          errorMessage = 'Match is full. Cannot add more players.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Match or players not found. Please refresh and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      alert(errorMessage);
    } finally {
      setIsAddingPlayersToMatch(prev => {
        const newSet = new Set(prev);
        allPlayers.forEach(player => newSet.delete(player.id));
        return newSet;
      });
    }
  }

  // Enhanced player selection algorithm
  function selectPlayersForMatch(availablePlayers: Participant[], needed: number): Participant[] {
    if (availablePlayers.length <= needed) {
      return availablePlayers;
    }

    // Create enhanced player data with game history and skill scoring
    const enhancedPlayers = availablePlayers.map(player => ({
      ...player,
      // Mock game history - in real app, this would come from database
      gamesPlayed: Math.floor(Math.random() * 20), // Random for demo
      skillScore: getSkillScore(player.skillLevel),
      readyTime: Date.now() // When they became ready
    }));

    // Sort by priority: Ready first, then by games played (ascending), then by skill level
    const sortedPlayers = enhancedPlayers.sort((a, b) => {
      // First priority: Ready status (already filtered, but for safety)
      if (a.status !== b.status) {
        return a.status === 'READY' ? -1 : 1;
      }
      
      // Second priority: Fewer games played (give new players a chance)
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      
      // Third priority: Skill level (Beginner < Intermediate < Advanced)
      if (a.skillScore !== b.skillScore) {
        return a.skillScore - b.skillScore;
      }
      
      // Fourth priority: Time ready (first come, first served)
      return a.readyTime - b.readyTime;
    });

    return sortedPlayers.slice(0, needed);
  }


  // Validation functions
  function canStartGame(courtId: string): boolean {
    const court = courts.find(c => c.id === courtId);
    const teams = courtTeams[courtId] ?? { A: [], B: [] };
    const totalPlayers = teams.A.length + teams.B.length;
    
    // Game can only start if court is open and has exactly 4 players
    return court?.status === "Open" && totalPlayers === 4;
  }

  function canEndGame(courtId: string): boolean {
    const court = courts.find(c => c.id === courtId);
    // Game can only end if it's currently in-game
    return court?.status === "IN-GAME";
  }

  function canCloseCourt(courtId: string): boolean {
    const court = courts.find(c => c.id === courtId);
    // Court can only be closed if it's open (no active game) or if the game has been completed
    return court?.status === "Open" || court?.status === "Closed";
  }

  function viewMatchupScreen(courtId: string) {
    // Allow opening matchup screen even if no players are assigned
    // Courts without players will show WaitingMatchCard

    // Save the active court and occurrence to localStorage
    localStorage.setItem('activeCourtId', courtId);
    if (currentOccurrenceId) {
      localStorage.setItem('activeOccurrenceId', currentOccurrenceId);
    }
    // Also save hubId for fetching all courts
    if (rawSessionData?.hubId) {
      localStorage.setItem('activeHubId', rawSessionData.hubId);
    }

    // Get current occurrence data
    const currentOccurrence = rawSessionData?.occurrences?.find((occ: any) => occ.id === currentOccurrenceId);
    const sessionName = rawSessionData?.sessionName || session?.title || "Open Play";
    const sportName = rawSessionData?.sport?.name || "Pickleball";
    const hubName = rawSessionData?.hub?.sportsHubName || "Sports Hub";

    // Create matchup data with all courts from the occurrence
    const matchupData = {
      id: `matchup-${currentOccurrenceId || Date.now()}`,
      sport: `${sportName} - ${sessionName}`,
      hubName: hubName,
      occurrenceId: currentOccurrenceId,
      occurrenceDate: currentOccurrence?.occurrenceDate,
      occurrenceStartTime: currentOccurrence?.startTime,
      occurrenceEndTime: currentOccurrence?.endTime,
      focusedCourtId: courtId, // This will be the court to focus on
      courts: courts.map(c => {
        const teams = courtTeams[c.id] ?? { A: [], B: [] };
        return {
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        status: c.status,
          teamA: teams.A || [],
          teamB: teams.B || [],
        teamAName: teamNames[c.id]?.A,
        teamBName: teamNames[c.id]?.B,
          startTime: currentOccurrence?.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: currentOccurrence?.endTime || new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: undefined,
        winner: undefined
        };
      })
    };

    // Get the occurrence ID
    const occurrenceId = currentOccurrenceId || occurrence?.id;

    // Check if matchup window is already open
    const existingWindow = window.open('', 'matchupWindow');
    if (existingWindow && !existingWindow.closed) {
      // Update existing window with occurrence ID
      existingWindow.location.href = `/matchup-multi/${courtId}?occurrenceId=${occurrenceId}`;
      existingWindow.focus();
      // Send updated data
      existingWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
    } else {
      // Open new Multi-Court TV Display window with occurrence ID
      const newWindow = window.open(`/matchup-multi/${courtId}?occurrenceId=${occurrenceId}`, 'matchupWindow', 'width=1920,height=1080');
      
      // Pass the matchup data to the new window
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          newWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
        });
      }
    }
  }

  function setResult(matchId: string, winner: "A" | "B") {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, winner, status: "Completed", score: scoreEntry[matchId] } : m
      )
    );
  }

  // Waitlist management
  async function approveWaitlistParticipant(participantId: string, targetStatus: "READY" | "RESERVE") {
    try {
      // Get the playerStatusId for the target status
      const playerStatusId = mapStatusToPlayerStatusId(targetStatus);
      
      // Get the current occurrence ID
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      
      if (!occurrenceId) {
        alert('No occurrence ID available. Please refresh the page and try again.');
        return;
      }
      
      // Call the API to update the player status
      await updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId);
      
      // Refresh session data to get updated participant information from server
      await refreshSessionData();
      
      console.log(`Successfully approved participant ${participantId} as ${targetStatus}`);
    } catch (error) {
      console.error('Error approving waitlist participant:', error);
      alert('Failed to approve participant. Please try again.');
    }
  }

  async function rejectWaitlistParticipant(participantId: string) {
    try {
      // Get the playerStatusId for REJECTED status (using CANCELED as closest match)
      const playerStatusId = mapStatusToPlayerStatusId("CANCELED");
      
      // Get the current occurrence ID
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      
      if (!occurrenceId) {
        alert('No occurrence ID available. Please refresh the page and try again.');
        return;
      }
      
      // Call the API to update the player status
      await updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId);
      
      // Refresh session data to get updated participant information from server
      await refreshSessionData();
      
      console.log(`Successfully rejected participant ${participantId}`);
    } catch (error) {
      console.error('Error rejecting waitlist participant:', error);
      alert('Failed to reject participant. Please try again.');
    }
  }


  // Function to fetch game matches by occurrence ID
  const fetchGameMatches = async () => {
    const occurrenceId = currentOccurrenceId || occurrence?.id;
    
    if (!occurrenceId) {
      console.log('No occurrence ID available for fetching game matches');
      return;
    }

    if (isLoadingGameMatches) {
      console.log('Already loading game matches, skipping duplicate call');
      return;
    }

    setIsLoadingGameMatches(true);
    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for game matches');
        // For dummy data, just set empty state
        setMatches([]);
        setCourtTeams({});
        setTeamNames({});
        setCourts([]);
        setIsLoadingGameMatches(false);
        return;
      }

      console.log('Fetching game matches for occurrence:', occurrenceId);
      const fetchedGameMatches = await getGameMatchesByOccurrenceId(occurrenceId);
      console.log('Fetched game matches:', fetchedGameMatches);
      
      // Store raw game matches for match detection
      setGameMatches(fetchedGameMatches);
      
      // Convert and integrate with existing state
      const convertedMatches: Match[] = [];
      const newCourtTeams: Record<string, { A: Participant[]; B: Participant[] }> = {};
      const newTeamNames: Record<string, { A: string; B: string }> = {};
      const newCourts: Court[] = [];
      
      // Group matches by courtId to handle multiple matches per court
      const matchesByCourt: Record<string, any[]> = {};
      fetchedGameMatches.forEach(gameMatch => {
        if (!matchesByCourt[gameMatch.courtId]) {
          matchesByCourt[gameMatch.courtId] = [];
        }
        matchesByCourt[gameMatch.courtId].push(gameMatch);
      });
      
      // Process each court and its matches
      Object.entries(matchesByCourt).forEach(([courtId, courtMatches]) => {
        console.log(`Processing court ${courtId} with ${courtMatches.length} matches`);
        
        // Find the match with the most participants (or the first one if all are empty)
        const matchWithParticipants = courtMatches.find(match => match.participants && match.participants.length > 0) || courtMatches[0];
        
        // Convert to Match format
        const match = convertGameMatchToMatch(matchWithParticipants);
        convertedMatches.push(match);
        
        // Convert to court teams format - merge participants from all matches for this court
        const allParticipants: any[] = [];
        courtMatches.forEach(gameMatch => {
          if (gameMatch.participants && gameMatch.participants.length > 0) {
            allParticipants.push(...gameMatch.participants);
          }
        });
        
        // Create a combined game match object for processing
        const combinedMatch = {
          ...matchWithParticipants,
          participants: allParticipants
        };
        
        console.log(`Processing court ${courtId} with ${allParticipants.length} total participants:`, allParticipants.map(p => ({
          id: p.participantId,
          name: p.user?.personalInfo ? `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}` : p.user?.userName,
          teamNumber: p.teamNumber
        })));
        
        const courtTeams = convertGameMatchToCourtTeams(combinedMatch);
        newCourtTeams[courtId] = courtTeams;
        
        // Set team names from the match with participants
        newTeamNames[courtId] = {
          A: matchWithParticipants.team1Name || '',
          B: matchWithParticipants.team2Name || ''
        };
        
        // Create court entry using the actual court data from the response
        const court: Court = {
          id: courtId,
          name: (matchWithParticipants as any).court?.courtName || `Court ${courtId}`,
          capacity: (matchWithParticipants as any).court?.capacity || matchWithParticipants.requiredPlayers || 4,
          status: courtMatches.some(m => m.gameStatus === 'in_progress') ? 'IN-GAME' : 
                  courtMatches.some(m => m.gameStatus === 'completed') ? 'Closed' : 'Open'
        };
        newCourts.push(court);
        
        console.log(`Court ${courtId} final teams:`, courtTeams);
      });
      
      // Update state
      setMatches(convertedMatches);
      setCourtTeams(prev => ({ ...prev, ...newCourtTeams }));
      setTeamNames(prev => ({ ...prev, ...newTeamNames }));
      setCourts(newCourts);
      
      // Debug: Log the updated court teams
      console.log('Updated court teams:', newCourtTeams);
      console.log('Players in matches:', Object.values(newCourtTeams).flatMap(t => [...t.A, ...t.B]).map(p => p.id));
      
      // Show info about empty matches
      const emptyMatches = fetchedGameMatches.filter(match => !match.participants || match.participants.length === 0);
      if (emptyMatches.length > 0) {
        console.log(`Found ${emptyMatches.length} matches with no participants yet`);
      }
    } catch (error) {
      console.error('Error fetching game matches:', error);
      // Don't show alert for this as it's not critical for basic functionality
    } finally {
      setIsLoadingGameMatches(false);
    }
  };

  // Function to refresh session data from API
  const refreshSessionData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsRefreshing(true);
      
      if (!session?.id) {
        console.error('No session ID available for refresh');
        return;
      }
      
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for refresh');
        setIsRefreshing(false);
        return;
      }
      
      const sessionId = session.id || session.id;
      
      const updatedSessionData = await getOpenPlaySessionById(sessionId);
      
      // Store raw API response
      setRawSessionData(updatedSessionData);
      console.log('Raw session data from API:', updatedSessionData);
      
      // Set the current occurrence ID from the first occurrence if not already set
      if (!currentOccurrenceId && updatedSessionData.occurrences && updatedSessionData.occurrences.length > 0) {
        setCurrentOccurrenceId(updatedSessionData.occurrences[0].id);
      }
      
      // If we have occurrence-specific data, find the matching occurrence
      if (occurrence?.id && updatedSessionData.occurrences) {
        const matchingOccurrence = updatedSessionData.occurrences.find((occ: any) => occ.id === occurrence.id);
        if (matchingOccurrence?.participants) {
          console.log('Using occurrence-specific participants (raw):', matchingOccurrence.participants);
          
          // Use raw participants data without conversion
          const freshParticipants = matchingOccurrence.participants.map((p: any) => ({
            id: p.id.toString(),
            name: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}`.trim() :
              p.user?.userName || 'Unknown Player',
            level: (p.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
            status: mapPlayerStatusFromDescription(p.playerStatus?.description) || p.status?.description || 'READY',
            playerStatus: p.playerStatus,
            skillLevel: p.skillLevel,
            avatar: undefined,
            initials: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName?.[0] || ''}${p.user.personalInfo.lastName?.[0] || ''}` :
              p.user?.userName?.[0] || 'U',
            isApproved: p.statusId === 1, // CONFIRMED
            checkedInAt: p.checkedInAt,
            joinedAt: p.registeredAt,
            notes: p.notes,
            gamesPlayed: 0,
            skillScore: p.skillLevel === 'beginner' ? 1 : p.skillLevel === 'advanced' ? 3 : 2,
            readyTime: undefined,
            paymentStatus: undefined, // Not displaying payment status
            user: p.user
          }));
          
          // Update participants with fresh data from server
          setParticipants(freshParticipants);
          console.log('Updated participants from occurrence (raw):', freshParticipants);
        }
      } else if (updatedSessionData.occurrences && updatedSessionData.occurrences.length > 0) {
        // Use first occurrence participants if no specific occurrence
        const firstOccurrence = updatedSessionData.occurrences[0];
        if (firstOccurrence?.participants) {
          console.log('Using first occurrence participants (raw):', firstOccurrence.participants);
          
          // Use raw participants data without conversion
          const freshParticipants = firstOccurrence.participants.map((p: any) => ({
            id: p.id.toString(),
            name: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}`.trim() :
              p.user?.userName || 'Unknown Player',
            level: (p.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
            status: mapPlayerStatusFromDescription(p.playerStatus?.description) || p.status?.description || 'READY',
            playerStatus: p.playerStatus,
            skillLevel: p.skillLevel,
            avatar: undefined,
            initials: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName?.[0] || ''}${p.user.personalInfo.lastName?.[0] || ''}` :
              p.user?.userName?.[0] || 'U',
            isApproved: p.statusId === 1, // CONFIRMED
            checkedInAt: p.checkedInAt,
            joinedAt: p.registeredAt,
            notes: p.notes,
            gamesPlayed: 0,
            skillScore: p.skillLevel === 'beginner' ? 1 : p.skillLevel === 'advanced' ? 3 : 2,
            readyTime: undefined,
            paymentStatus: undefined, // Not displaying payment status
            user: p.user
          }));
          
          // Update participants with fresh data from server
          setParticipants(freshParticipants);
          console.log('Updated participants from first occurrence (raw):', freshParticipants);
        }
      }
      
      console.log('Session data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle adding new player
  const handleAddPlayer = async (playerData: PlayerFormData) => {
    setIsAddingPlayer(true);
    try {
      // Close modal first
      setAddPlayerOpen(false);
      
      // Show success message (you could add a toast notification here)
      console.log('Player added successfully:', playerData);
      
      // Show success message
      console.log('✅ Player added successfully');
    } catch (error) {
      console.error('Error adding player:', error);
    } finally {
      setIsAddingPlayer(false);
    }
  };

  // Handle successful player addition
  const handlePlayerAddSuccess = async () => {
    console.log('Player added successfully via API');
    // Add a small delay to ensure the API has processed the new participant
    setTimeout(async () => {
      await refreshSessionData();
    }, 1000);
  };

  // Handle player addition error
  const handlePlayerAddError = (error: any) => {
    console.error('Error adding player:', error);
    // You could add a toast notification here to show the error
  };

  if (!id || !session) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Session not found</h1>
            <p className="text-sm text-muted-foreground">
              The Open Play session you are looking for does not exist.
            </p>
          </div>
          <Button onClick={() => navigate(urls.openPlay ?? -1)}>Back to Open Play</Button>
        </div>
      </div>
    );
  }
  console.log(session);
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg flex-shrink-0">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{session.sessionName || session.title}</h1>
                {isDummySession && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    🧪 DUMMY DATA
                  </Badge>
                )}
                {occurrence && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Specific Occurrence
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{session.occurrences?.[0] ? 
                    `${new Date(session.occurrences[0].occurrenceDate).toLocaleDateString()} • ${session.occurrences[0].startTime}-${session.occurrences[0].endTime}` : 
                    session.when || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{session.occurrences?.[0]?.court?.courtName || session.location || 'TBD'}</span>
                </div>
                <Badge variant="outline" className="text-white border-white/30">
                  {session.level ? session.level.join(" / ") : 'Beginner / Intermediate / Advanced'}
                </Badge>
                {occurrence && (
                  <Badge variant="outline" className="text-white border-white/30">
                    {occurrence.currentParticipants} / {occurrence.court?.capacity || 4} players
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm opacity-90">Total Participants</div>
                <div className="text-2xl font-bold">{participants.length}</div>
              </div>
              <Button
                variant="outline"
                className="text-black border-white/30 hover:bg-white/10"
                onClick={refreshSessionData}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="text-black border-white/30 hover:bg-white/10"
                onClick={() => {
                  hasFetchedGameMatches.current = false;
                  setCourts([]);
                  setCourtTeams({});
                  setTeamNames({});
                  setMatches([]);
                  fetchGameMatches();
                }}
                disabled={isLoadingGameMatches}
              >
                {isLoadingGameMatches ? "Loading Matches..." : "Refresh Matches"}
              </Button>
              <Button
                variant="outline"
                className="text-black border-white/30 hover:bg-white/10"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="w-full px-6">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setTab("details")}
              className={cn(
                "h-12 px-6 text-sm font-medium border-b-2 transition-colors",
                tab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Details & Participants
            </button>
            <button
              onClick={() => setTab("game")}
              className={cn(
                "h-12 px-6 text-sm font-medium border-b-2 transition-colors",
                tab === "game"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              )}
            >
              Game Management
            </button>
          </div>
        </div>
      </div>

      {tab === "details" && (
        <DetailsParticipantsTab
          session={session}
          participants={participants}
          occurrence={occurrence}
          readyList={readyList}
          restingList={restingList}
          reserveList={reserveList}
          waitlistList={waitlistList}
          courts={courts}
          addPlayerOpen={addPlayerOpen}
          setAddPlayerOpen={setAddPlayerOpen}
          isUpdatingStatus={isUpdatingStatus}
          onUpdateStatus={updateStatus}
          onRemoveFromAllTeams={removeFromAllTeams}
          onApproveWaitlistParticipant={approveWaitlistParticipant}
          onRejectWaitlistParticipant={rejectWaitlistParticipant}
          onAddPlayer={handleAddPlayer}
          onPlayerAddSuccess={handlePlayerAddSuccess}
          onPlayerAddError={handlePlayerAddError}
          isAddingPlayer={isAddingPlayer}
          onSwitchToGameTab={() => setTab("game")}
        />
      )}

      {tab === "game" && (
        <GameManagementTab
          participants={participants}
          courts={courts}
          courtTeams={enrichedCourtTeams}
          matches={matches}
          scoreEntry={scoreEntry}
          showWinnerDialog={showWinnerDialog}
          teamNames={teamNames}
          readyList={readyList}
          restingList={restingList}
          reserveList={reserveList}
          waitlistList={waitlistList}
          gameMatches={gameMatches}
          onDragEnd={onDragEnd}
          onAddCourt={addCourt}
          isCreatingGameMatch={isCreatingGameMatch}
          isAddingPlayersToMatch={isAddingPlayersToMatch}
          isStartingGame={isStartingGame}
          isEndingGame={isEndingGame}
          onRenameCourt={renameCourt}
          onToggleCourtOpen={toggleCourtOpen}
          onStartGame={startGame}
          onEndGame={endGame}
          onConfirmGameEnd={confirmGameEnd}
          onMatchMakeCourt={matchMakeCourt}
          onViewMatchupScreen={viewMatchupScreen}
          onSetResult={setResult}
          onSetScoreEntry={(matchId: string, score: string) => 
            setScoreEntry((s) => ({ ...s, [matchId]: score }))
          }
          onSetTeamNames={(courtId: string, team: "A" | "B", name: string) =>
                                      setTeamNames(prev => ({
                                        ...prev,
              [courtId]: { ...prev[courtId], [team]: name }
            }))
          }
          onSetShowWinnerDialog={setShowWinnerDialog}
          canStartGame={canStartGame}
          canEndGame={canEndGame}
          canCloseCourt={canCloseCourt}
          isLoadingGameMatches={isLoadingGameMatches}
        />
      )}


      {/* Add Player Modal */}
      <AddPlayerModal
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        sessionTitle={session.sessionName || session.title}
        onAddPlayer={handleAddPlayer}
        onSuccess={handlePlayerAddSuccess}
        onError={handlePlayerAddError}
        isLoading={isAddingPlayer}
      />
    </div>
  );
};

export default OpenPlayDetailPage;
