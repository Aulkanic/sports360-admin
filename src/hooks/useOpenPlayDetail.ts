import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";

import { SAMPLE_SESSIONS } from "@/components/features/open-play/data/sample-sessions";
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
import { assignPlayerToTeam, endGameMatch, getGameMatchesByOccurrenceId, removePlayerFromMatch, updateGameMatch, updatePlayerStatus, type GameMatch } from "@/services/game-match.service";
import { mapParticipantStatusToPlayerStatusId, mapStatusToPlayerStatusId, updateParticipantPlayerStatusByAdmin } from "@/services/open-play.service";

type LocationState = {
  session?: OpenPlaySession;
  occurrence?: any; // OpenPlayOccurrence type
};

/** Safe deep-clone that works on simple JSONy objects */
function deepClone<T>(obj: T): T {
  // Prefer native structuredClone when available
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

export const useOpenPlayDetail = () => {
  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: LocationState };
  
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
  const lastFetchTime = useRef(0);

  // Initialize court info hook
  const {
    courtInfoList,
  } = useCourtInfo({
    courts,
    gameMatches,
    courtTeams,
    teamNames
  });

  // Check if the current session is dummy data
  const isDummySession = useMemo(() => {
    return sessionById?.isDummy || rawSessionData?.isDummy || false;
  }, [sessionById, rawSessionData]);

  // Use raw session data if available, otherwise fall back to sessionById
  const session = useMemo(() => {
    if (rawSessionData) return rawSessionData;
    if (sessionById) return { ...sessionById, participants };
    return null;
  }, [rawSessionData, sessionById, participants]);

  // Helper function to find matchId for a given courtId
  const findMatchIdByCourtId = (courtId: string): string | null => {    
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    
    if (courtMatches.length === 0) {
      return null;
    }
    
    // Filter to only active matches (not completed)
    const activeMatches = courtMatches.filter(match => 
      match.matchStatusId && match.matchStatusId <= 10
    );
    
    if (activeMatches.length === 0) {
      return null;
    }
    
    // If only one active match, return it
    if (activeMatches.length === 1) {
      const match = activeMatches[0];
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

  // Get full participant information by matching participant ID
  const getFullParticipantInfo = useMemo(() => {
    return (participantId: string) => {
      
      // First check if we have raw session data with occurrence participants
      if (rawSessionData?.occurrences) {
        for (const occurrence of rawSessionData.occurrences) {
          if (occurrence.participants) {            
            const fullParticipant = occurrence.participants.find((p: any) => {
              const match = p.id.toString() === participantId;
              return match;
            });
            
            if (fullParticipant) {
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
              } as unknown as Participant & {
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
      return fallbackParticipant;
    };
  }, [rawSessionData, participants]);

  // Enrich court teams with full participant information
  const enrichedCourtTeams = useMemo(() => {
    const enriched: Record<string, { A: Participant[]; B: Participant[] }> = {};
    
    Object.entries(courtTeams).forEach(([courtId, teams]) => {      
      enriched[courtId] = {
        A: teams.A.map(participant => {
          const enriched = getFullParticipantInfo(participant.id) || participant;
          return enriched;
        }),
        B: teams.B.map(participant => {
          const enriched = getFullParticipantInfo(participant.id) || participant;
          return enriched;
        })
      };
    });
    return enriched;
  }, [courtTeams, getFullParticipantInfo]);

  const inAnyTeam = useMemo(
    () => {
      const teamPlayerIds = new Set(
        Object.values(courtTeams)
          .flatMap((t) => [...t.A, ...t.B])
          .map((p) => p.id)
      );
      return teamPlayerIds;
    },
    [courtTeams]
  );

  const readyList = useMemo(
    () => {      
      const ready = participants.filter((p) => {
        const statusString = getStatusString(p.playerStatus ?? '');
        const isReady = statusString?.toUpperCase() === "READY";
        const notInTeam = !inAnyTeam.has(p.id);
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
        return isResting && notInTeam;
      });
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

  return {
    // State
    tab,
    setTab,
    session,
    occurrence,
    participants,
    courts,
    setCourts,
    courtTeams,
    setCourtTeams,
    matches,
    setMatches,
    scoreEntry,
    setScoreEntry,
    showWinnerDialog,
    setShowWinnerDialog,
    teamNames,
    setTeamNames,
    addPlayerOpen,
    setAddPlayerOpen,
    isAddingPlayer,
    setIsAddingPlayer,
    isCreatingGameMatch,
    setIsCreatingGameMatch,
    isAddingPlayersToMatch,
    setIsAddingPlayersToMatch,
    isLoadingGameMatches,
    setIsLoadingGameMatches,
    isStartingGame,
    setIsStartingGame,
    isEndingGame,
    setIsEndingGame,
    gameMatches,
    setGameMatches,
    isUpdatingStatus,
    setIsUpdatingStatus,
    isRemovingPlayer,
    setIsRemovingPlayer,
    isLoading,
    isDummySession,
    currentOccurrenceId,
    
    // Computed values
    readyList,
    restingList,
    reserveList,
    waitlistList,
    enrichedCourtTeams,
    courtInfoList,
    availableCourts,
    
    // Helper functions
    getSkillScore,
    findMatchIdByCourtId,
    mapPlayerStatusFromDescription,
    getFullParticipantInfo,
    deepClone,
    refreshSessionData,
    getUserAvatarUrl,
    setParticipants,
    
    // Refs
    hasFetchedGameMatches,
    lastFetchTime,
    
    // Navigation
    navigate,
  };
};
