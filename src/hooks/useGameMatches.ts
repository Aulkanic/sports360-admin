/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from "react";
import type { Court, Match, Participant } from "@/components/features/open-play/types";
import { getGameMatchesByOccurrenceId, type GameMatch } from "@/services/game-match.service";

interface UseGameMatchesProps {
  currentOccurrenceId?: string | null;
  occurrence?: any | null;
  isDummySession: boolean;
  setGameMatches: React.Dispatch<React.SetStateAction<any[]>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setCourtTeams: React.Dispatch<React.SetStateAction<Record<string, { A: Participant[]; B: Participant[] }>>>;
  setTeamNames: React.Dispatch<React.SetStateAction<Record<string, { A: string; B: string }>>>;
  setCourts: React.Dispatch<React.SetStateAction<Court[]>>;
  setIsLoadingGameMatches: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingGameMatches: boolean;
  convertGameMatchToMatch: (gameMatch: GameMatch) => Match;
  convertGameMatchToCourtTeams: (gameMatch: GameMatch) => { A: Participant[]; B: Participant[] };
  availableCourts: Court[];
  getUserAvatarUrl: (user: any) => string;
}

export const useGameMatches = ({
  currentOccurrenceId,
  occurrence,
  isDummySession,
  setGameMatches,
  setMatches,
  setCourtTeams,
  setTeamNames,
  setCourts,
  setIsLoadingGameMatches,
  isLoadingGameMatches,
  convertGameMatchToMatch,
  convertGameMatchToCourtTeams,
  availableCourts,
}: UseGameMatchesProps) => {
  const hasFetchedGameMatches = useRef(false);
  const lastFetchTime = useRef(0);

  // Function to fetch game matches by occurrence ID
  const fetchGameMatches = useCallback(async () => {
    const occurrenceId = currentOccurrenceId || occurrence?.id;
    
    if (!occurrenceId) {
      return;
    }

    if (isLoadingGameMatches) {
      return;
    }

    // Debounce: prevent calls within 500ms of each other
    const now = Date.now();
    if (now - lastFetchTime.current < 500) {
      return;
    }
    lastFetchTime.current = now;

    setIsLoadingGameMatches(true);
    try {
      // Check if this is dummy data
      if (isDummySession) {
        // For dummy data, just set empty state
        setMatches([]);
        setCourtTeams({});
        setTeamNames({});
        setCourts([]);
        setIsLoadingGameMatches(false);
        return;
      }

      const fetchedGameMatches = await getGameMatchesByOccurrenceId(occurrenceId);
      
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
        return isActive;
      });
      
      const completedGameMatches = fetchedGameMatches.filter(gameMatch => {
        const statusId = gameMatch.matchStatusId;
        const isCompleted = statusId && Number(statusId) > 10;
        return isCompleted;
      });
      
      
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
              return completed;
            });
            
            if (isCompleted) return 'Closed';
            
            return 'Open';
          })()
        };
        newCourts.push(court);
      });
      
      // Process completed matches and add them to convertedMatches
      completedGameMatches.forEach(gameMatch => {
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
            // Merge teams: use server data if available, otherwise keep existing
            merged[courtId] = {
              A: newTeams.A.length > 0 ? newTeams.A : (existingTeams?.A || []),
              B: newTeams.B.length > 0 ? newTeams.B : (existingTeams?.B || [])
            };
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
      
    } catch (error) {
      // Don't show alert for this as it's not critical for basic functionality
    } finally {
      setIsLoadingGameMatches(false);
    }
  }, [
    currentOccurrenceId,
    occurrence,
    isDummySession,
    setGameMatches,
    setMatches,
    setCourtTeams,
    setTeamNames,
    setCourts,
    setIsLoadingGameMatches,
    convertGameMatchToMatch,
    convertGameMatchToCourtTeams,
    availableCourts,
    lastFetchTime
  ]);

  return {
    fetchGameMatches,
    hasFetchedGameMatches,
  };
};
