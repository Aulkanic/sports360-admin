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
  getUserAvatarUrl,
}: UseGameMatchesProps) => {
  const hasFetchedGameMatches = useRef(false);
  const lastFetchTime = useRef(0);

  // Function to fetch game matches by occurrence ID
  const fetchGameMatches = useCallback(async () => {
    const occurrenceId = currentOccurrenceId || occurrence?.id;
    
    if (!occurrenceId) {
      console.log('No occurrence ID available for fetching game matches');
      return;
    }

    if (isLoadingGameMatches) {
      console.log('Already loading game matches, skipping duplicate call');
      return;
    }

    // Debounce: prevent calls within 500ms of each other
    const now = Date.now();
    if (now - lastFetchTime.current < 500) {
      console.log('Debouncing fetchGameMatches call - too soon after last fetch');
      return;
    }
    lastFetchTime.current = now;

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
