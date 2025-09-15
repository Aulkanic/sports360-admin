import { useCallback, useState } from "react";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";

import type { Court, Match, Participant } from "@/components/features/open-play/types";
import { buildBalancedTeams } from "@/components/features/open-play/utils";
import { assignPlayerToTeam, createGameMatch, endGameMatch, removePlayerFromMatch, updateGameMatch, updatePlayerStatus, type GameMatch, type CreateGameMatchRequest } from "@/services/game-match.service";

interface UseGameManagementProps {
  courts: Court[];
  setCourts: React.Dispatch<React.SetStateAction<Court[]>>;
  courtTeams: Record<string, { A: Participant[]; B: Participant[] }>;
  setCourtTeams: React.Dispatch<React.SetStateAction<Record<string, { A: Participant[]; B: Participant[] }>>>;
  teamNames: Record<string, { A: string; B: string }>;
  setTeamNames: React.Dispatch<React.SetStateAction<Record<string, { A: string; B: string }>>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  gameMatches: any[];
  readyList: Participant[];
  isDummySession: boolean;
  currentOccurrenceId?: string | null;
  occurrence?: any | null;
  isAddingPlayersToMatch: Set<string>;
  setIsAddingPlayersToMatch: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsCreatingGameMatch: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStartingGame: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsEndingGame: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsRemovingPlayer: React.Dispatch<React.SetStateAction<boolean>>;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  findMatchIdByCourtId: (courtId: string) => string | null;
  getSkillScore: (participant: Participant) => number;
  deepClone: <T>(obj: T) => T;
  refreshSessionData: () => Promise<void>;
  fetchGameMatches: () => Promise<void>;
  showWinnerDialog: string | null;
  setShowWinnerDialog: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useGameManagement = ({
  courts,
  setCourts,
  courtTeams,
  setCourtTeams,
  teamNames,
  setTeamNames,
  setMatches,
  gameMatches,
  readyList,
  isDummySession,
  currentOccurrenceId,
  occurrence,
  isAddingPlayersToMatch,
  setIsAddingPlayersToMatch,
  setIsCreatingGameMatch,
  setIsStartingGame,
  setIsEndingGame,
  setIsRemovingPlayer,
  setParticipants,
  findMatchIdByCourtId,
  getSkillScore,
  deepClone,
  refreshSessionData,
  fetchGameMatches,
  showWinnerDialog,
  setShowWinnerDialog,
}: UseGameManagementProps) => {
  const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});

  // Convert GameMatch to existing Match format
  const convertGameMatchToMatch = useCallback((gameMatch: GameMatch): Match => {
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
  }, []);

  // Convert GameMatch participants to court teams format
  const convertGameMatchToCourtTeams = useCallback((gameMatch: GameMatch) => {
    const teamA: Participant[] = [];
    const teamB: Participant[] = [];
    
    if (gameMatch.participants) {
      gameMatch.participants.forEach(participant => {
        const participantId = (participant as any).participantId?.toString() || participant.userId?.toString();
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
          avatar: undefined, // Will be set by parent component
          initials: participant.user
            ? (participant.user.personalInfo
              ? `${participant.user.personalInfo.firstName?.[0] ?? ''}${participant.user.personalInfo.lastName?.[0] ?? ''}`
              : participant.user.userName?.[0] ?? '')
            : `P${participantId}`,
          firstName: undefined,
          lastName: undefined
        };
        const playerStatusId = (participant as any).playerStatusId;
        const isOnBench = playerStatusId === 16;
        if (isOnBench) {
          participantData.status = 'BENCH';
          participantData.playerStatus = { 
            id: playerStatusId, 
            description: 'BENCH' 
          };
        }
        
        // Assign to team based on teamNumber (1 = Team A, 2 = Team B)
        const teamNumber = (participant as any).teamNumber;
        
        if (teamNumber === 1) {
          teamA.push(participantData);
        } else if (teamNumber === 2) {
          teamB.push(participantData);
        }
      });
    }
    return { A: teamA, B: teamB };
  }, []);

  // Helper function to find which match a participant is currently in
  const findParticipantMatchId = useCallback((participantId: string): string | null => {
    for (const [courtId, teams] of Object.entries(courtTeams)) {
      if (teams.A.some(p => p.id === participantId) || teams.B.some(p => p.id === participantId)) {
        return courtId; // courtId is the match ID
      }
    }
    return null;
  }, [courtTeams]);

  // Helper function to remove player from match via API
  const removePlayerFromMatchAPI = useCallback(async (participantId: string, matchId: string) => {
    try {
      await removePlayerFromMatch(participantId);
      console.log(`Player ${participantId} removed from match ${matchId}`);
    } catch (error) {
      console.error('Error removing player from match:', error);
    }
  }, []);

  // Handle remove player from match
  const handleRemovePlayer = useCallback(async (participant: Participant, team: 'A' | 'B', courtId: string) => {
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
    } catch (error) {
      console.error('Error removing player from match:', error);
      throw error; // Re-throw to show error in UI
    } finally {
      setIsRemovingPlayer(false);
    }
  }, [gameMatches, setCourtTeams, setParticipants]);

  // Move player to court team
  const moveToCourtTeam = useCallback(async (courtId: string, teamKey: "A" | "B", participant: Participant) => {
    // Check if participant is already being processed
    if (isAddingPlayersToMatch.has(participant.id)) {
      return;
    }
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
        // For dummy data, we'll still refresh to maintain consistency
        await fetchGameMatches();
        return;
      }

      // Find the matchId for this court
      let matchId = findMatchIdByCourtId(courtId);
      console.log(`Looking for match for court ${courtId}, found matchId: ${matchId}`);
      
      // If no match found, try to refresh game matches and try again
      if (!matchId) {
        console.log('No match found, refreshing game matches...');
        try {
          await fetchGameMatches();
          matchId = findMatchIdByCourtId(courtId);
          console.log(`After refresh, found matchId: ${matchId}`);
        } catch (refreshError) {
          console.error('Failed to refresh game matches:', refreshError);
        }
      }
      
      if (!matchId) {
        console.error(`No match found for court ${courtId} after refresh`);
        console.log('Available game matches:', gameMatches);
        console.log('Available courts:', courts);
        alert('No active match found for this court. Please create a match first.');
        return;
      }
      const teamNumber = teamKey === 'A' ? 1 : 2;
      
      // First assign the player to the team in the match
      try {
        const assignResult = await assignPlayerToTeam(matchId, participant.id, teamNumber);
        console.log(`✅ Player assigned to team successfully for ${participant.name}:`, assignResult);
      } catch (assignError) {
        console.error(`❌ Failed to assign player to team for ${participant.name}:`, assignError);
        alert('Failed to add player to match. Please try again.');
        throw assignError; // Re-throw to trigger rollback
      }
      
      // Then update the player status (this is optional and shouldn't fail the entire operation)
      try {
        const statusUpdateResult = await updatePlayerStatus(participant.id, { 
          playerStatus: 'ready',
          teamNumber: teamNumber,
          position: 'active'
        });
        console.log(`✅ Player status updated successfully for ${participant.name}:`, statusUpdateResult);
      } catch (statusError) {
        console.warn(`⚠️ Failed to update player status for ${participant.name}, but player was assigned to team:`, statusError);
        // Don't fail the entire operation if status update fails
        // The player is already assigned to the team, which is the main goal
      }
      
      // Refresh data immediately after successful assignment
      try {
        await fetchGameMatches();
        console.log('✅ Game matches refreshed after player assignment');
        // Show success message
        console.log(`✅ Successfully added ${participant.name} to team ${teamKey} in court ${courtId}`);
      } catch (refreshError) {
        console.error('❌ Error fetching latest data after team assignment:', refreshError);
        // Don't fail the operation if refresh fails, the assignment was successful
        console.log(`✅ Player ${participant.name} was assigned to team ${teamKey} but refresh failed`);
      }
      
    } catch (error) {
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
  }, [
    isAddingPlayersToMatch,
    courts,
    courtTeams,
    findParticipantMatchId,
    removePlayerFromMatchAPI,
    isDummySession,
    findMatchIdByCourtId,
    deepClone,
    setIsAddingPlayersToMatch,
    setCourtTeams
  ]);

  // Drag and drop handler
  const onDragEnd = useCallback(async (e: DragEndEvent, updateStatus: (participantId: string, status: any) => Promise<void>) => {
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
      return;
    }

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
      console.log(`Drag drop target: ${overId}, courtId: ${courtId}, teamKey: ${teamKey}`);
      
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

        console.log(`Moving participant ${participant.name} to court ${courtId}, team ${teamKey}`);
        await moveToCourtTeam(courtId, teamKey, participant);
      } else {
        console.log('Invalid drop target:', overId);
      }
    } catch (error) {
      console.error('Error in drag and drop operation:', error);
      // Show user-friendly error message
      alert('Failed to move player. Please try again.');
    }
  }, [isAddingPlayersToMatch, findParticipantMatchId, removePlayerFromMatchAPI, courts, moveToCourtTeam]);

  // Add court function
  const addCourt = useCallback(async (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number;
  }) => {
    const availableCourts = courts; // This should be passed from parent
    const selectedCourt = availableCourts.find(c => c.id === data.courtId);
    if (!selectedCourt) {
      throw new Error(`Selected court not found. Court ID: ${data.courtId}, Available IDs: ${availableCourts.map(c => c.id).join(', ')}`);
    }
    setIsCreatingGameMatch(true);
    
    try {
      // Check if this is dummy data
      if (isDummySession) {
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

      // Get the occurrence ID
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      if (!occurrenceId) {
        throw new Error('No occurrence ID available for creating game match');
      }

      // Create the game match via API
      const matchData: CreateGameMatchRequest = {
        occurrenceId: occurrenceId.toString(),
        courtId: data.courtId,
        matchName: `${data.team1Name} vs ${data.team2Name}`,
        requiredPlayers: selectedCourt.capacity || 4,
        team1Name: data.team1Name,
        team2Name: data.team2Name,
        organizerNotes: `Match duration: ${data.matchDuration} minutes`
      };

      console.log('Creating game match with data:', matchData);
      console.log('API endpoint:', '/game-match/create');
      console.log('Current occurrence ID:', occurrenceId);
      console.log('Court ID:', data.courtId);
      
      const createdMatch = await createGameMatch(matchData);
      console.log('✅ Game match created successfully:', createdMatch);

      // Refresh the game matches to get the updated data
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
  }, [courts, isDummySession, setCourts, setIsCreatingGameMatch, currentOccurrenceId, occurrence, fetchGameMatches]);

  // Rename court function
  const renameCourt = useCallback((courtId: string) => {
    const newName = window.prompt(
      "Rename court",
      courts.find((c) => c.id === courtId)?.name ?? "Court"
    );
    if (!newName) return;
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, name: newName } : c)));
  }, [courts, setCourts]);

  // Toggle court open/closed
  const toggleCourtOpen = useCallback((courtId: string) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId ? { ...c, status: c.status === "Closed" ? "Open" : "Closed" } : c
      )
    );
  }, [setCourts]);

  // Start game function
  const startGame = useCallback(async (courtId: string) => {
    try {
      // Find the match ID for this court
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court. Please create a match first.');
        return;
      }
    
      // Set loading state
      setIsStartingGame(prev => new Set(prev).add(courtId));
      
      // Call API to update game match status
      const updateData = {
        matchStatus: "5",
        gameStatus: "5",
        startTime: new Date().toISOString()
      };
      await updateGameMatch(matchId, updateData);
      await fetchGameMatches();
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
  }, [findMatchIdByCourtId, setIsStartingGame]);

  // End game function
  const endGame = useCallback((courtId: string) => {
    console.log('🎯 End Game button clicked for court:', courtId);
    console.log('🎯 Current showWinnerDialog state:', showWinnerDialog);
    // Show winner selection dialog instead of automatically ending
    setShowWinnerDialog(courtId);
    console.log('🎯 Set showWinnerDialog to:', courtId);
  }, [setShowWinnerDialog, showWinnerDialog]);

  // Confirm game end function
  const confirmGameEnd = useCallback(async (courtId: string, winner: "A" | "B", score?: string) => {
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
      console.log('✅ Game matches refreshed successfully after game end');
      
      // Also refresh session data to update participant counts and statuses
      console.log('🔄 Refreshing session data after game end...');
      await refreshSessionData();
      console.log('✅ Session data refreshed successfully after game end');
      
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
  }, [findMatchIdByCourtId, setIsEndingGame, setShowWinnerDialog]);

  // Enhanced player selection algorithm
  const selectPlayersForMatch = useCallback((availablePlayers: Participant[], needed: number): Participant[] => {
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
  }, [getSkillScore]);

  // Match make court function
  const matchMakeCourt = useCallback(async (courtId: string) => {
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
  }, [
    courts,
    courtTeams,
    readyList,
    selectPlayersForMatch,
    isDummySession,
    findMatchIdByCourtId,
    setIsAddingPlayersToMatch
  ]);

  // Validation functions
  const canStartGame = useCallback((courtId: string): boolean => {
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
  }, [courts, courtTeams, gameMatches]);

  const canEndGame = useCallback((courtId: string): boolean => {
    // Check if there's an in-game match for this court
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    // Game can only end if it's currently in-game (matchStatusId === 5)
    return hasInGameMatch;
  }, [gameMatches]);

  const canCloseCourt = useCallback((courtId: string): boolean => {
    const court = courts.find(c => c.id === courtId);
    // Court can only be closed if it's open (no active game) or if the game has been completed
    return court?.status === "Open" || court?.status === "Closed";
  }, [courts]);

  // View matchup screen function
  const viewMatchupScreen = useCallback((courtId: string, rawSessionData: any) => {
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
    const sessionName = rawSessionData?.sessionName || "Open Play";
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
  }, [findMatchIdByCourtId, currentOccurrenceId, courts, courtTeams, teamNames, occurrence]);

  // Set result function
  const setResult = useCallback((matchId: string, winner: "A" | "B") => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, winner, status: "Completed", score: scoreEntry[matchId] } : m
      )
    );
  }, [setMatches, scoreEntry]);

  // Set score entry function
  const setScoreEntryForMatch = useCallback((matchId: string, score: string) => {
    setScoreEntry((s) => ({ ...s, [matchId]: score }));
  }, [setScoreEntry]);

  // Set team names function
  const setTeamNamesForCourt = useCallback((courtId: string, team: "A" | "B", name: string) => {
    setTeamNames(prev => ({
      ...prev,
      [courtId]: { ...prev[courtId], [team]: name }
    }));
  }, [setTeamNames]);

  return {
    // State
    showWinnerDialog,
    setShowWinnerDialog,
    scoreEntry,
    setScoreEntry: setScoreEntryForMatch,
    
    // Functions
    convertGameMatchToMatch,
    convertGameMatchToCourtTeams,
    findParticipantMatchId,
    removePlayerFromMatchAPI,
    handleRemovePlayer,
    moveToCourtTeam,
    onDragEnd,
    addCourt,
    renameCourt,
    toggleCourtOpen,
    startGame,
    endGame,
    confirmGameEnd,
    matchMakeCourt,
    viewMatchupScreen,
    setResult,
    setTeamNamesForCourt,
    
    // Validation functions
    canStartGame,
    canEndGame,
    canCloseCourt,
  };
};
