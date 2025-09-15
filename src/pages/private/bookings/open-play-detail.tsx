/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";

import AddPlayerModal, { type PlayerFormData } from "@/components/features/open-play/AddPlayerModal";
import { SAMPLE_SESSIONS } from "@/components/features/open-play/data/sample-sessions";
import DetailsParticipantsTab from "@/components/features/open-play/DetailsParticipantsTab";
import GameManagementTab from "@/components/features/open-play/GameManagementTab";
import type {
  Court,
  Match,
  OpenPlaySession,
  Participant,
} from "@/components/features/open-play/types";
import { getSkillLevel, getSkillLevelAsLevel, getStatusString } from "@/components/features/open-play/types";
import { buildBalancedTeams } from "@/components/features/open-play/utils";
import { useCourts } from "@/hooks";
import { useCourtInfo } from "@/hooks/useCourtInfo";
import { useOpenPlaySession } from "@/hooks/useOpenPlaySession";
import { assignPlayerToTeam, createGameMatch, endGameMatch, getGameMatchesByOccurrenceId, removePlayerFromMatch, updateGameMatch, updatePlayerStatus, type GameMatch } from "@/services/game-match.service";
import { mapParticipantStatusToPlayerStatusId, mapStatusToPlayerStatusId, updateParticipantPlayerStatusByAdmin } from "@/services/open-play.service";

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
  const location = useLocation() as Location & { state?: LocationState };
  console.log(location)
  
  // Use custom hook for session management
  const {
    rawSessionData,
    currentOccurrenceId,
    participants,
    setParticipants,
    isLoading,
    refreshSessionData,
    getUserAvatarUrl,
  } = useOpenPlaySession();
  
  const [tab, setTab] = useState<"details" | "game">("details");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Set<string>>(new Set());
  const [isRemovingPlayer, setIsRemovingPlayer] = useState(false);

  const stateSession = location.state?.session;
  const occurrence = location.state?.occurrence;
  const sessionById = useMemo(
    () => stateSession ?? SAMPLE_SESSIONS.find((s) => s.id === rawSessionData?.id),
    [stateSession, rawSessionData?.id]
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

  // Initialize courts with all available courts from court management
  useEffect(() => {
    if (availableCourts.length > 0 && courts.length === 0) {
      setCourts(availableCourts);
    }
  }, [availableCourts, courts.length]);

  const [courtTeams, setCourtTeams] = useState<
    Record<string, { A: Participant[]; B: Participant[] }>
  >({ "court-1": { A: [], B: [] } });

  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});
  const [showWinnerDialog, setShowWinnerDialog] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<Record<string, { A: string; B: string }>>({});
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isCreatingGameMatch, setIsCreatingGameMatch] = useState(false);
  const [isAddingPlayersToMatch, setIsAddingPlayersToMatch] = useState<Set<string>>(new Set());
  const [isLoadingGameMatches, setIsLoadingGameMatches] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState<Set<string>>(new Set());
  const [isEndingGame, setIsEndingGame] = useState<Set<string>>(new Set());
  const [gameMatches, setGameMatches] = useState<any[]>([]); // Store raw game matches from API
  const hasFetchedGameMatches = useRef(false);

  // Initialize court info hook
  const {
    courtInfoList,

  } = useCourtInfo({
    courts,
    gameMatches,
    courtTeams,
    teamNames
  });

  // Court info hook provides structured court data
  // Available functions: getCourtInfo, updateCourtTeamsFromHook, updateTeamNamesFromHook, refreshCourtInfo

  // Helper function to find matchId for a given courtId
  const findMatchIdByCourtId = (courtId: string): string | null => {
    console.log('🔍 Finding match for court:', courtId);
    console.log('🔍 Available game matches:', gameMatches.map(m => ({ 
      id: m.id, 
      courtId: m.courtId, 
      status: m.matchStatusId,
      participants: m.participants?.length || 0,
      createdAt: m.createdAt
    })));
    
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    console.log('🔍 Court matches found:', courtMatches.length);
    
    if (courtMatches.length === 0) {
      console.log('❌ No matches found for court:', courtId);
      return null;
    }
    
    // Filter to only active matches (not completed)
    const activeMatches = courtMatches.filter(match => 
      match.matchStatusId && match.matchStatusId <= 10
    );
    
    console.log('🔍 Active matches (status <= 10):', activeMatches.length);
    
    if (activeMatches.length === 0) {
      console.log('❌ No active matches found for court:', courtId);
      return null;
    }
    
    // If only one active match, return it
    if (activeMatches.length === 1) {
      const match = activeMatches[0];
      console.log('✅ Only one active match found:', { 
        id: match.id, 
        courtId: match.courtId, 
        status: match.matchStatusId,
        participants: match.participants?.length || 0,
        matchName: match.matchName
      });
      return match.id;
    }
    
    // If multiple active matches, prioritize by:
    // 1. Matches with participants (active matches)
    // 2. Most recently created match (newest first)
    const prioritizedMatch = activeMatches.sort((a, b) => {
      // First priority: matches with participants
      const aHasParticipants = a.participants && a.participants.length > 0;
      const bHasParticipants = b.participants && b.participants.length > 0;
      
      if (aHasParticipants && !bHasParticipants) return -1;
      if (!aHasParticipants && bHasParticipants) return 1;
      
      // Second priority: most recently created (newest first)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })[0];
    
    console.log('✅ Selected prioritized match:', { 
      id: prioritizedMatch.id, 
      courtId: prioritizedMatch.courtId, 
      status: prioritizedMatch.matchStatusId,
      participants: prioritizedMatch.participants?.length || 0,
      matchName: prioritizedMatch.matchName,
      createdAt: prioritizedMatch.createdAt
    });
    
    return prioritizedMatch.id;
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

  
  // Check if the current session is dummy data
  const isDummySession = useMemo(() => {
    return sessionById?.isDummy || rawSessionData?.isDummy || false;
  }, [sessionById, rawSessionData]);

  // Get full participant information by matching participant ID
  const getFullParticipantInfo = useMemo(() => {
    return (participantId: string) => {
      
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
              console.log('getFullParticipantInfo: Full participant found:', fullParticipant);
              return {
                id: fullParticipant.id.toString(),
                name: fullParticipant.user?.personalInfo ? 
                  `${fullParticipant.user.personalInfo.firstName} ${fullParticipant.user.personalInfo.lastName}`.trim() :
                  fullParticipant.user?.userName || 'Unknown Player',
                level: getSkillLevelAsLevel(fullParticipant),
                status: mapPlayerStatusFromDescription(fullParticipant.playerStatus?.description) || 'READY',
                playerStatus: fullParticipant.playerStatus,
                skillLevel: getSkillLevel(fullParticipant),
                avatar: getUserAvatarUrl(fullParticipant.user),
                initials: fullParticipant.user?.personalInfo ? 
                  `${fullParticipant.user.personalInfo.firstName?.[0]}${fullParticipant.user.personalInfo.lastName?.[0]}` :
                  fullParticipant.user?.userName?.[0] || '?',
                paymentAmount: fullParticipant.paymentAmount,
                notes: fullParticipant.notes,
                user: fullParticipant.user,
                isApproved: fullParticipant.playerStatusId === 1, // playerStatusId 1 means READY/approved
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
    console.log('🏟️ CURRENT GAME MATCHES:', gameMatches.map(m => ({ id: m.id, matchStatusId: m.matchStatusId, courtId: m.courtId })));
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
        const statusString = getStatusString(p.playerStatus ?? '');
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
        return (a.name || '').localeCompare(b.name || '');
      });
      
      return sortedReady;
    },
    [participants, inAnyTeam]
  );
  const restingList = useMemo(
    () => {
      const resting = participants.filter((p) => {
        const statusString = getStatusString(p.playerStatus)?.toUpperCase();
        const isResting = statusString === "RESTING";
        const notInTeam = !inAnyTeam.has(p.id);
        console.log(`Player ${p.id} (${p.name}): status=${statusString}, isResting=${isResting}, notInTeam=${notInTeam}`);
        return isResting && notInTeam;
      });
      console.log('🛌 RESTING LIST:', resting.map(p => ({ id: p.id, name: p.name, status: getStatusString(p.playerStatus) })));
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
          skillLevel: 'Intermediate', // Default value, could be enhanced
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
      status: (() => {
        // Map matchStatusId to display status
        if (gameMatch.matchStatusId === 6) return 'Completed';
        if (gameMatch.matchStatusId === 5) return 'IN-GAME';
        if (gameMatch.matchStatusId && gameMatch.matchStatusId > 10) return 'Completed';
        return 'Scheduled';
      })(),
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
        console.log('Processing participant:', participantId);
        const participantData: Participant = {
          id: participantId,
          name: participant.user ? 
            (participant.user.personalInfo ? 
              `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}` : 
              participant.user.userName) : 
            `Player ${participantId}`,
          skillLevel: 'Intermediate',
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
              contactNo: participant.user.personalInfo.contactNo,
              upload: (participant.user.personalInfo as any).upload
            } : undefined
          } : undefined,
          avatar: getUserAvatarUrl(participant.user),
          initials: participant.user
            ? (participant.user.personalInfo
                ? `${participant.user.personalInfo.firstName?.[0] ?? ''}${participant.user.personalInfo.lastName?.[0] ?? ''}`
                : participant.user.userName?.[0] ?? '')
            : 
            `P${participantId}`
        };
        
        console.log('Created participant data:', participantData);
        
        // Check if participant is on bench (playerStatusId: 16 = BENCH)
        const playerStatusId = (participant as any).playerStatusId;
        const isOnBench = playerStatusId === 16;
        
        console.log(`🔍 Processing participant ${participantData.name} (ID: ${participantId}):`, {
          playerStatusId,
          isOnBench,
          teamNumber: (participant as any).teamNumber,
          position: (participant as any).positionP
        });
        
        // Update participant status based on bench status
        if (isOnBench) {
          participantData.status = 'BENCH';
          participantData.playerStatus = { 
            id: playerStatusId, 
            description: 'BENCH' 
          };
          console.log(`⏸️ Participant ${participantData.name} (ID: ${participantId}) is on bench but will be included in display`);
        }
        
        // Assign to team based on teamNumber (1 = Team A, 2 = Team B)
        const teamNumber = (participant as any).teamNumber;
        console.log(`Assigning participant ${participantData.name} (ID: ${participantId}) to team ${teamNumber}`);
        
        if (teamNumber === 1) {
          teamA.push(participantData);
          console.log(`✅ Added to Team A: ${participantData.name} (ID: ${participantId})`);
        } else if (teamNumber === 2) {
          teamB.push(participantData);
          console.log(`✅ Added to Team B: ${participantData.name} (ID: ${participantId})`);
        } else {
          console.warn(`❌ Unknown team number ${teamNumber} for participant ${participantData.name} (ID: ${participantId})`);
        }
      });
    }
    
    console.log('Final teams for match', gameMatch.id, ':', { A: teamA, B: teamB });
    return { A: teamA, B: teamB };
  };



  // Note: Participant processing is now handled in the initial fetch useEffect above
  // to match the same logic as refreshSessionData

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
      console.log('🎮 Game management tab accessed', {
        occurrenceId,
        isLoadingGameMatches,
        courtsLength: courts.length,
        gameMatchesLength: gameMatches.length,
        hasFetchedGameMatches: hasFetchedGameMatches.current
      });
      
      // Reset the fetch flag to allow fresh data loading
      hasFetchedGameMatches.current = false;
      
      if (occurrenceId && !isLoadingGameMatches) {
        // Always fetch game matches when switching to game management tab
        console.log('🔄 Fetching game matches for game management tab...');
        // Small delay to ensure tab switch is complete
        setTimeout(() => {
          fetchGameMatches();
        }, 100);
      } else if (isLoadingGameMatches) {
        console.log('⏳ Already loading game matches, skipping fetch');
      } else {
        console.log('❌ No occurrence ID available for fetching game matches');
      }
    }
  }, [tab, occurrence?.id, currentOccurrenceId]); // Include dependencies that affect data availability

  // Additional effect to ensure data is loaded when GameManagementTab is rendered
  useEffect(() => {
    if (tab === "game" && gameMatches.length === 0 && !isLoadingGameMatches) {
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      if (occurrenceId) {
        console.log('🔄 GameManagementTab rendered but no data, fetching...');
        fetchGameMatches();
      }
    }
  }, [tab, gameMatches.length, isLoadingGameMatches, occurrence?.id, currentOccurrenceId]);

  

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
        // For dummy data, we'll still refresh to maintain consistency
        await refreshSessionData();
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

  // Handle remove player from match
  const handleRemovePlayer = async (participant: Participant, team: 'A' | 'B', courtId: string) => {
    setIsRemovingPlayer(true);
    try {
      // Find the current match for this court
      const currentMatch = gameMatches.find(match => match.courtId === courtId);
      if (!currentMatch) {
        throw new Error('No active match found for this court');
      }

      // Remove player from API
      await removePlayerFromMatch(participant.id);

      // Update local state - remove player from court teams
      setCourtTeams(prev => {
        const newTeams = { ...prev };
        if (newTeams[courtId]) {
          newTeams[courtId] = {
            ...newTeams[courtId],
            [team]: newTeams[courtId][team].filter(p => p.id !== participant.id)
          };
        }
        return newTeams;
      });

      // Update participants status back to READY
      setParticipants((prev: Participant[]) => 
        prev.map((p: Participant) => 
          p.id === participant.id 
            ? { ...p, status: { id: 1, description: 'READY' }, playerStatus: { id: 1, description: 'READY' } }
            : p
        )
      );

      console.log(`Player ${participant.name} removed from Team ${team} on court ${courtId}`);
    } catch (error) {
      console.error('Error removing player from match:', error);
      throw error; // Re-throw to show error in UI
    } finally {
      setIsRemovingPlayer(false);
    }
  };

  async function moveToCourtTeam(courtId: string, teamKey: "A" | "B", participant: Participant) {
    // Check if participant is already being processed
    if (isAddingPlayersToMatch.has(participant.id)) {
      console.log(`Player ${participant.name} is already being processed`);
      return;
    }

    // Check if court is closed
    console.log(participant)
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

    // Set loading state immediately
    setIsAddingPlayersToMatch(prev => new Set(prev).add(participant.id));

    // Store original state for rollback
    const originalCourtTeams = deepClone(courtTeams);

    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for player assignment');
        // For dummy data, we'll still refresh to maintain consistency
        await fetchGameMatches();
        return;
      }

      // Find the matchId for this court
      let matchId = findMatchIdByCourtId(courtId);
      
      // If no match found, try to refresh game matches and try again
      if (!matchId) {
        console.log('No match found, refreshing game matches...');
        try {
          await fetchGameMatches();
          matchId = findMatchIdByCourtId(courtId);
        } catch (refreshError) {
          console.error('Failed to refresh game matches:', refreshError);
        }
      }
      
      if (!matchId) {
        console.error(`No match found for court ${courtId} after refresh`);
        alert('No active match found for this court. Please create a match first.');
        return;
      }

      // Convert team key to team number (A = 1, B = 2)
      const teamNumber = teamKey === 'A' ? 1 : 2;
      
      // Assign player to team via API first
      console.log(`Assigning player ${participant.name} (ID: ${participant.id}) to team ${teamKey} (${teamNumber}) in match ${matchId} (court ${courtId})`);
      const assignmentResult = await assignPlayerToTeam(matchId, participant.id, teamNumber);
      console.log(`Player assignment API response:`, assignmentResult);
      
      // Local state will be updated via API refresh
      
      // Update player status from BENCH to active (if they were on bench)
      try {
        console.log(`🔄 Updating player status for ${participant.name} (ID: ${participant.id}) from BENCH to active`);
        const statusUpdateResult = await updatePlayerStatus(participant.id, { 
          playerStatus: 'ready',
          teamNumber: teamNumber,
          position: 'active'
        });
        console.log(`✅ Player status updated successfully for ${participant.name}:`, statusUpdateResult);
      } catch (statusError) {
        console.error(`❌ Failed to update player status for ${participant.name}:`, statusError);
        // Don't fail the entire operation if status update fails
      }
      
      // Refresh data after successful assignment
      setTimeout(async () => {
        try {
          console.log('🔄 Fetching latest data from server after team assignment...');
          await fetchGameMatches();
          console.log('✅ Data refresh completed after team assignment');
        } catch (error) {
          console.error('❌ Error fetching latest data after team assignment:', error);
        }
      }, 1000); // Reduced delay since we're doing API first
      
    } catch (error) {
      console.error('Error in player assignment process:', error);
      
      // Revert to original state on API error
      setCourtTeams(originalCourtTeams);
      
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
    if (!participant) {
      console.log('No participant found in drag data');
      return;
    }

    // Check if participant is already being processed
    if (isAddingPlayersToMatch.has(participant.id)) {
      console.log(`Player ${participant.name} is already being processed, ignoring drag operation`);
      return;
    }

    console.log('Drag end - participant:', {
      id: participant.id,
      name: participant.name,
      currentStatus: participant.status
    });

    const overId = String(over.id as UniqueIdentifier);

    // Check if participant is currently in a match
    const currentMatchId = findParticipantMatchId(participant.id);

    try {
      // Queues - when dragging from match to queue, remove from match first
      if (overId === "ready") {
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "READY");
        return;
      }
      if (overId === "resting") {
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "RESTING");
        return;
      }
      if (overId === "reserve") {
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "RESERVE");
        return;
      }
      if (overId === "waitlist") {
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "WAITLIST");
        return;
      }

      // Court targets: "court-1:A" | "court-1:B"
      const [courtId, teamKey] = overId.split(":");
      if (courtId && (teamKey === "A" || teamKey === "B")) {
        // Validate court exists
        const court = courts.find(c => c.id === courtId);
        if (!court) {
          console.error(`Court ${courtId} not found`);
          alert('Court not found. Please refresh and try again.');
          return;
        }

        // Validate team key
        if (teamKey !== "A" && teamKey !== "B") {
          console.error(`Invalid team key: ${teamKey}`);
          return;
        }

        await moveToCourtTeam(courtId, teamKey, participant);
      } else {
        console.log('Invalid drop target:', overId);
      }
    } catch (error) {
      console.error('Error in drag and drop operation:', error);
      // Show user-friendly error message
      alert('Failed to move player. Please try again.');
    }
  }

  /* Controls */

  async function addCourt(data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number;
  }) {
    console.log('🏗️ ADD COURT called with data:', data);
    console.log('🏗️ Available courts:', availableCourts.map(c => ({ id: c.id, name: c.name })));
    console.log('🏗️ Looking for court ID:', data.courtId);
    
    const selectedCourt = availableCourts.find(c => c.id === data.courtId);
    if (!selectedCourt) {
      console.error('❌ Selected court not found:', data.courtId);
      console.error('❌ Available court IDs:', availableCourts.map(c => c.id));
      console.error('❌ Court ID being searched:', data.courtId);
      console.error('❌ Type of court ID being searched:', typeof data.courtId);
      console.error('❌ Available court ID types:', availableCourts.map(c => ({ id: c.id, type: typeof c.id })));
      throw new Error(`Selected court not found. Court ID: ${data.courtId}, Available IDs: ${availableCourts.map(c => c.id).join(', ')}`);
    }

    console.log('🏗️ Setting isCreatingGameMatch to true');
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
        console.log('✅ Dummy court added successfully');
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

      console.log('🏗️ Creating game match with data:', gameMatchData);
      const createdMatch = await createGameMatch(gameMatchData);
      console.log('✅ Game match created successfully:', createdMatch);
      
      // Refetch the matches list to get updated data from server
      console.log('🔄 Refetching game matches...');
      await fetchGameMatches();
      console.log('✅ Game matches refetched successfully');
    } catch (error) {
      console.error('❌ Error creating game match:', error);
      // Show error to user (you might want to add a toast notification here)
      alert('Failed to create game match. Please try again.');
      throw error; // Re-throw to let the modal handle it
    } finally {
      console.log('🏗️ Setting isCreatingGameMatch to false');
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
      console.log('🚀 STARTING GAME for court ID:', courtId);
      
      // Find the match ID for this court
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court. Please create a match first.');
        return;
      }
      
      console.log('🚀 Using match ID:', matchId);
      
      // Set loading state
      setIsStartingGame(prev => new Set(prev).add(courtId));
      
      // Call API to update game match status
      const updateData = {
        matchStatus: "5",
        gameStatus: "5",
        startTime: new Date().toISOString()
      };
      
      console.log('📡 CALLING updateGameMatch API with match ID:', matchId, 'and data:', updateData);
      await updateGameMatch(matchId, updateData);
      console.log('✅ GAME MATCH UPDATED SUCCESSFULLY');
      
      // Refresh data from backend to ensure UI is synchronized
      console.log('🔄 Refreshing data from backend after game start...');
      await fetchGameMatches();
      console.log('✅ Data refreshed successfully after game start');
      
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
      console.log('🏁 ENDING GAME for court ID:', courtId, 'Winner:', winner, 'Score:', score);
      
      // Find the match ID for this court
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court. Cannot end game.');
        return;
      }
      
      console.log('🏁 Using match ID:', matchId);
      
      // Set loading state
      setIsEndingGame(prev => new Set(prev).add(courtId));
      
      // Use the new endGameMatch API to end the game
      console.log('📡 CALLING endGameMatch API for match ID:', matchId);
      await endGameMatch(matchId);
      console.log('✅ GAME MATCH ENDED SUCCESSFULLY');
      
      // Refresh data from backend to ensure UI is synchronized
      console.log('🔄 Refreshing data from backend after game end...');
      await fetchGameMatches();
      console.log('✅ Data refreshed successfully after game end');
      
      // Note: Participant status updates are handled by the backend after successful game end
      console.log('✅ Game ended successfully - backend will handle participant status updates');
      
      // Close the winner dialog
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

    // Call API to add all players to match (this will also update their status)
    const allPlayers = [...A, ...B];
    setIsAddingPlayersToMatch(prev => new Set([...prev, ...allPlayers.map(p => p.id)]));
    
    try {
      // Check if this is dummy data
      if (isDummySession) {
        console.log('Dummy session detected, skipping API call for random pick');
        // For dummy data, we'll still refresh to maintain consistency
        await fetchGameMatches();
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
      
      // Refetch matches to get updated data from server
      console.log('Refreshing data after team assignments...');
      await fetchGameMatches();
      console.log('Data refreshed successfully after team assignments');
    } catch (error) {
      
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
      if (a.playerStatus !== b.playerStatus) {
        return a.playerStatus === 'READY' ? -1 : 1;
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
    
    // Check if there's an active match for this court
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasActiveMatch = courtMatches.some(match => 
      match.matchStatusId && match.matchStatusId <= 10 && match.matchStatusId !== 5
    );
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    const canStart = court?.status === "Open" && totalPlayers === 4 && hasActiveMatch && !hasInGameMatch;
    
    console.log(`🎮 canStartGame for court ${courtId}:`, {
      courtStatus: court?.status,
      totalPlayers,
      hasActiveMatch,
      hasInGameMatch,
      canStart,
      courtMatches: courtMatches.map(m => ({
        id: m.id,
        matchStatusId: m.matchStatusId,
        isActive: m.matchStatusId && m.matchStatusId <= 10
      }))
    });
    
    return canStart;
  }

  function canEndGame(courtId: string): boolean {
    // Check if there's an in-game match for this court
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    // Game can only end if it's currently in-game (matchStatusId === 5)
    return hasInGameMatch;
  }

  function canCloseCourt(courtId: string): boolean {
    const court = courts.find(c => c.id === courtId);
    // Court can only be closed if it's open (no active game) or if the game has been completed
    return court?.status === "Open" || court?.status === "Closed";
  }

  function viewMatchupScreen(courtId: string) {
    // Allow opening matchup screen even if no players are assigned
    // Courts without players will show WaitingMatchCard

    // Find the match ID for this court
    const matchId = findMatchIdByCourtId(courtId);
    if (!matchId) {
      console.error(`No match found for court ${courtId}`);
      alert('No active match found for this court. Please create a match first.');
      return;
    }

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
      // Update existing window with match ID instead of court ID
      existingWindow.location.href = `/matchup-multi/${matchId}?occurrenceId=${occurrenceId}`;
      existingWindow.focus();
      // Send updated data
      existingWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
    } else {
      // Open new Multi-Court TV Display window with match ID instead of court ID
      const newWindow = window.open(`/matchup-multi/${matchId}?occurrenceId=${occurrenceId}`, 'matchupWindow', 'width=1920,height=1080');
      
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
      
      // Filter matches to show both active (<= 10) and completed (> 10) matches
      const activeGameMatches = fetchedGameMatches.filter(gameMatch => {
        const statusId = gameMatch.matchStatusId;
        const isActive = statusId && Number(statusId) <= 10;
        console.log(`🔍 Filtering match ${gameMatch.id}:`, { matchStatusId: statusId, type: typeof statusId, isActive });
        return isActive;
      });
      
      const completedGameMatches = fetchedGameMatches.filter(gameMatch => {
        const statusId = gameMatch.matchStatusId;
        const isCompleted = statusId && Number(statusId) > 10;
        console.log(`🔍 Filtering completed match ${gameMatch.id}:`, { matchStatusId: statusId, type: typeof statusId, isCompleted });
        return isCompleted;
      });
      
      console.log('🔍 MATCH FILTERING DEBUG:', {
        totalMatches: fetchedGameMatches.length,
        activeMatches: activeGameMatches.length,
        completedMatches: completedGameMatches.length,
        activeMatchIds: activeGameMatches.map(m => ({ id: m.id, matchStatusId: m.matchStatusId })),
        completedMatchIds: completedGameMatches.map(m => ({ id: m.id, matchStatusId: m.matchStatusId })),
        allMatchStatusIds: fetchedGameMatches.map(m => ({ id: m.id, matchStatusId: m.matchStatusId, type: typeof m.matchStatusId }))
      });
      
      console.log(`Filtered ${activeGameMatches.length} active matches and ${completedGameMatches.length} completed matches out of ${fetchedGameMatches.length} total matches`);
      
      // Group matches by courtId to handle multiple matches per court
      const matchesByCourt: Record<string, any[]> = {};
      activeGameMatches.forEach(gameMatch => {
        if (!matchesByCourt[gameMatch.courtId]) {
          matchesByCourt[gameMatch.courtId] = [];
        }
        matchesByCourt[gameMatch.courtId].push(gameMatch);
      });
      
      // Process each court and its matches
      Object.entries(matchesByCourt).forEach(([courtId, courtMatches]) => {
        console.log(`🏟️ Processing court ${courtId} with ${courtMatches.length} matches`);
        console.log(`🏟️ Court ${courtId} match statuses:`, courtMatches.map(m => ({
          id: m.id,
          matchStatusId: m.matchStatusId,
          matchStatus: m.matchStatus,
          gameStatus: m.gameStatus,
          participants: m.participants?.length || 0
        })));
        
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
          status: (() => {
            const isInGame = courtMatches.some(m => {
              // Check for INGAME status - could be status ID 5, gameStatus 5, or description 'INGAME'
              const inGame = m.matchStatus === 5 || m.gameStatus === 5 || 
                            m.matchStatus === '5' || m.gameStatus === '5' ||
                            m.matchStatus?.toLowerCase() === 'ingame' || 
                            m.gameStatus?.toLowerCase() === 'ingame' ||
                            m.gameStatus?.toLowerCase() === 'in_progress';
              if (inGame) {
                console.log(`Court ${courtId} is IN-GAME based on match:`, {
                  id: m.id,
                  matchStatus: m.matchStatus,
                  gameStatus: m.gameStatus
                });
              }
              return inGame;
            });
            
            if (isInGame) return 'IN-GAME';
            
            const isCompleted = courtMatches.some(m => {
              // Check for completed status - could be status ID 6, gameStatus 6, or description 'ENDED'/'COMPLETED'
              const completed = m.matchStatus === 6 || m.gameStatus === 6 || 
                              m.matchStatus === '6' || m.gameStatus === '6' ||
                              m.matchStatus?.toLowerCase() === 'ended' || 
                              m.gameStatus?.toLowerCase() === 'ended' ||
                              m.gameStatus?.toLowerCase() === 'completed';
              if (completed) {
                console.log(`Court ${courtId} is Closed based on match:`, {
                  id: m.id,
                  matchStatus: m.matchStatus,
                  gameStatus: m.gameStatus
                });
              }
              return completed;
            });
            
            if (isCompleted) return 'Closed';
            
            console.log(`Court ${courtId} is Open - no active or completed matches found`);
            return 'Open';
          })()
        };
        newCourts.push(court);
        
        console.log(`Court ${courtId} final teams:`, courtTeams);
      });
      
      // Process completed matches and add them to convertedMatches
      console.log(`Processing ${completedGameMatches.length} completed matches`);
      completedGameMatches.forEach(gameMatch => {
        console.log(`Processing completed match ${gameMatch.id} for court ${gameMatch.courtId}`);
        const completedMatch = convertGameMatchToMatch(gameMatch);
        convertedMatches.push(completedMatch);
      });
      
      // Update state - merge with existing data instead of overriding
      setMatches(convertedMatches);
      setCourtTeams(prev => {
        const merged = { ...prev };
        Object.keys(newCourtTeams).forEach(courtId => {
          const newTeams = newCourtTeams[courtId];
          const existingTeams = merged[courtId];
          
          if (newTeams && (newTeams.A.length > 0 || newTeams.B.length > 0)) {
            console.log(`Updating court ${courtId} teams with server data:`, newTeams);
            console.log(`Previous teams for court ${courtId}:`, existingTeams);
            
            // Merge teams: use server data if available, otherwise keep existing
            merged[courtId] = {
              A: newTeams.A.length > 0 ? newTeams.A : (existingTeams?.A || []),
              B: newTeams.B.length > 0 ? newTeams.B : (existingTeams?.B || [])
            };
            
            console.log(`Final merged teams for court ${courtId}:`, merged[courtId]);
          }
        });
        return merged;
      });
      setTeamNames(prev => ({ ...prev, ...newTeamNames }));
      
      // Merge new courts with all available courts from court management
      setCourts(prev => {
        const mergedCourts = [...prev];
        
        // Update existing courts with match data
        newCourts.forEach(newCourt => {
          const existingIndex = mergedCourts.findIndex(c => c.id === newCourt.id);
          if (existingIndex >= 0) {
            // Update existing court with new status and data
            mergedCourts[existingIndex] = { ...mergedCourts[existingIndex], ...newCourt };
          } else {
            // Add new court if it doesn't exist
            mergedCourts.push(newCourt);
          }
        });
        
        // Ensure all courts from court management are included
        availableCourts.forEach(availableCourt => {
          const exists = mergedCourts.some(c => c.id === availableCourt.id);
          if (!exists) {
            mergedCourts.push(availableCourt);
          }
        });
        
        return mergedCourts;
      });
      
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

  if (!rawSessionData?.id || !session) {
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
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
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
          courtInfoList={courtInfoList}
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
          onRemovePlayer={handleRemovePlayer}
          isRemovingPlayer={isRemovingPlayer}
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
