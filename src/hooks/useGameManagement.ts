/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState } from "react";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";

import type { Court, Match, Participant } from "@/components/features/open-play/types";
import { getStatusString } from "@/components/features/open-play/types";
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
      id: gameMatch.id,
      courtId: gameMatch.courtId,
      courtName: (gameMatch as any).court?.courtName || `Court ${gameMatch.courtId}`,
      teamA,
      teamB,
      teamAName: gameMatch.team1Name,
      teamBName: gameMatch.team2Name,
      status: (() => {
        if (gameMatch.matchStatusId === 6) return 'Completed';
        if (gameMatch.matchStatusId === 5) return 'IN-GAME';
        if (gameMatch.matchStatusId && gameMatch.matchStatusId > 10) return 'Completed';
        return 'Scheduled';
      })(),
      winner: undefined,
      score: undefined
    };
  }, []);

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
          matchCount: (participant as any).matchCount || 0,
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
              contactNo: participant.user.personalInfo.contactNo,
              upload: (participant.user.personalInfo as any).upload
            } : undefined
          } : undefined,
          avatar: undefined,
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

  const findParticipantMatchId = useCallback((participantId: string): string | null => {
    for (const [courtId, teams] of Object.entries(courtTeams)) {
      if (teams.A.some(p => p.id === participantId) || teams.B.some(p => p.id === participantId)) {
        return courtId;
      }
    }
    return null;
  }, [courtTeams]);

  const removePlayerFromMatchAPI = useCallback(async (participantId: string, _matchId: string) => {
    try {
      await removePlayerFromMatch(participantId);
    } catch (error) {
      console.error('Error removing player from match:', error);
    }
  }, []);

  const handleRemovePlayer = useCallback(async (participant: Participant, team: 'A' | 'B', courtId: string) => {
    setIsRemovingPlayer(true);
    try {
      const currentMatch = gameMatches.find(match => match.courtId === courtId);
      if (!currentMatch) {
        throw new Error('No active match found for this court');
      }

      await removePlayerFromMatch(participant.id);

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

      setParticipants((prev: Participant[]) => 
        prev.map((p: Participant) => 
          p.id === participant.id 
            ? { ...p, status: { id: 1, description: 'READY' }, playerStatus: { id: 1, description: 'READY' } }
            : p
        )
      );
    } catch (error) {
      console.error('Error removing player from match:', error);
      throw error;
    } finally {
      setIsRemovingPlayer(false);
    }
  }, [gameMatches, setCourtTeams, setParticipants]);

  const moveToCourtTeam = useCallback(async (courtId: string, teamKey: "A" | "B", participant: Participant) => {
    if (isAddingPlayersToMatch.has(participant.id)) {
      return;
    }
    const court = courts.find(c => c.id === courtId);
    if (court?.status === "Closed") {
      alert("Cannot add players to a closed court");
      return;
    }

    const currentTeams = courtTeams[courtId] ?? { A: [], B: [] };
    const currentTotalPlayers = currentTeams.A.length + currentTeams.B.length;
    if (currentTotalPlayers >= 4) {
      alert("Court already has maximum 4 players");
      return;
    }

    const currentMatchId = findParticipantMatchId(participant.id);
    if (currentMatchId && currentMatchId !== courtId) {
      await removePlayerFromMatchAPI(participant.id, currentMatchId);
    }

    setIsAddingPlayersToMatch(prev => new Set(prev).add(participant.id));

    const originalCourtTeams = deepClone(courtTeams);

    try {
      if (isDummySession) {
        await fetchGameMatches();
        return;
      }

      let matchId = findMatchIdByCourtId(courtId);
      
      if (!matchId) {
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
      const teamNumber = teamKey === 'A' ? 1 : 2;
      try {
        await assignPlayerToTeam(matchId, participant.id, teamNumber);
      } catch (assignError) {
        console.error(`Failed to assign player to team for ${participant.name}:`, assignError);
        alert('Failed to add player to match. Please try again.');
        throw assignError;
      }
      
      try {
        await updatePlayerStatus(participant.id, { 
          playerStatus: 'ready',
          teamNumber: teamNumber,
          position: 'active'
        });
      } catch (statusError) {
        console.warn(`Failed to update player status for ${participant.name}, but player was assigned to team:`, statusError);
      }
      
      try {
        await fetchGameMatches();
      } catch (refreshError) {
        console.error('Error fetching latest data after team assignment:', refreshError);
      }
      
    } catch (error) {
      setCourtTeams(originalCourtTeams);
      
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

  const onDragEnd = useCallback(async (e: DragEndEvent, updateStatus: (participantId: string, status: any) => Promise<void>) => {
    const { active, over } = e;
    if (!over) return;

    const participant = (active?.data?.current as { participant?: Participant } | undefined)
      ?.participant;
    if (!participant) {
      return;
    }

    if (isAddingPlayersToMatch.has(participant.id)) {
      return;
    }

    const overId = String(over.id as UniqueIdentifier);

    const currentMatchId = findParticipantMatchId(participant.id);

    try {
      if (overId === "ready") {
        // Check if participant is already in READY status
        const currentStatus = getStatusString(participant.playerStatus ?? '')?.toUpperCase();
        if (currentStatus === "READY") {
          // Already in READY status, no need to make API call
          return;
        }
        
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "READY");
        return;
      }
      if (overId === "resting") {
        // Check if participant is already in RESTING status
        const currentStatus = getStatusString(participant.playerStatus)?.toUpperCase();
        if (currentStatus === "RESTING") {
          // Already in RESTING status, no need to make API call
          return;
        }
        
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "RESTING");
        return;
      }
      if (overId === "reserve") {
        // Check if participant is already in RESERVE status
        const currentStatus = getStatusString(participant.status)?.toUpperCase();
        if (currentStatus === "RESERVE") {
          // Already in RESERVE status, no need to make API call
          return;
        }
        
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "RESERVE");
        return;
      }
      if (overId === "waitlist") {
        // Check if participant is already in WAITLIST status
        const currentStatus = getStatusString(participant.status)?.toUpperCase();
        if (currentStatus === "WAITLIST") {
          // Already in WAITLIST status, no need to make API call
          return;
        }
        
        if (currentMatchId) {
          await removePlayerFromMatchAPI(participant.id, currentMatchId);
        }
        await updateStatus(participant.id, "WAITLIST");
        return;
      }

      const [courtId, teamKey] = overId.split(":");
      
      if (courtId && (teamKey === "A" || teamKey === "B")) {
        const court = courts.find(c => c.id === courtId);
        if (!court) {
          console.error(`Court ${courtId} not found`);
          alert('Court not found. Please refresh and try again.');
          return;
        }

        if (teamKey !== "A" && teamKey !== "B") {
          console.error(`Invalid team key: ${teamKey}`);
          return;
        }

        await moveToCourtTeam(courtId, teamKey, participant);
      }
    } catch (error) {
      console.error('Error in drag and drop operation:', error);
      alert('Failed to move player. Please try again.');
    }
  }, [isAddingPlayersToMatch, findParticipantMatchId, removePlayerFromMatchAPI, courts, moveToCourtTeam]);

  const addCourt = useCallback(async (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number;
  }) => {
    const availableCourts = courts;
    const selectedCourt = availableCourts.find(c => c.id === data.courtId);
    if (!selectedCourt) {
      throw new Error(`Selected court not found. Court ID: ${data.courtId}, Available IDs: ${availableCourts.map(c => c.id).join(', ')}`);
    }
    setIsCreatingGameMatch(true);
    
    try {
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

      const occurrenceId = currentOccurrenceId || occurrence?.id;
      if (!occurrenceId) {
        throw new Error('No occurrence ID available for creating game match');
      }

      const matchData: CreateGameMatchRequest = {
        occurrenceId: occurrenceId.toString(),
        courtId: data.courtId,
        matchName: `${data.team1Name} vs ${data.team2Name}`,
        requiredPlayers: selectedCourt.capacity || 4,
        team1Name: data.team1Name,
        team2Name: data.team2Name,
        organizerNotes: `Match duration: ${data.matchDuration} minutes`
      };

      await createGameMatch(matchData);

      await fetchGameMatches();
    } catch (error) {
      console.error('Error creating game match:', error);
      alert('Failed to create game match. Please try again.');
      throw error;
    } finally {
      setIsCreatingGameMatch(false);
    }
  }, [courts, isDummySession, setCourts, setIsCreatingGameMatch, currentOccurrenceId, occurrence, fetchGameMatches]);

  const renameCourt = useCallback((courtId: string) => {
    const newName = window.prompt(
      "Rename court",
      courts.find((c) => c.id === courtId)?.name ?? "Court"
    );
    if (!newName) return;
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, name: newName } : c)));
  }, [courts, setCourts]);

  const toggleCourtOpen = useCallback((courtId: string) => {
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId ? { ...c, status: c.status === "Closed" ? "Open" : "Closed" } : c
      )
    );
  }, [setCourts]);

  const startGame = useCallback(async (courtId: string) => {
    try {
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court. Please create a match first.');
        return;
      }
    
      setIsStartingGame(prev => new Set(prev).add(courtId));
      
      const updateData = {
        matchStatus: "5",
        gameStatus: "5",
        startTime: new Date().toISOString()
      };
      await updateGameMatch(matchId, updateData);
      await fetchGameMatches();
    } catch (error) {
      console.error('ERROR STARTING GAME:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsStartingGame(prev => {
        const newSet = new Set(prev);
        newSet.delete(courtId);
        return newSet;
      });
    }
  }, [findMatchIdByCourtId, setIsStartingGame]);

  const endGame = useCallback((courtId: string) => {
    setShowWinnerDialog(courtId);
  }, [setShowWinnerDialog]);

  const confirmGameEnd = useCallback(async (courtId: string, _winner: "A" | "B", _score?: string) => {
    try {
      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court. Cannot end game.');
        return;
      }
      
      setIsEndingGame(prev => new Set(prev).add(courtId));
      
      await endGameMatch(matchId);
      
      await fetchGameMatches();
      
      await refreshSessionData();
      
      setShowWinnerDialog(null);
    } catch (error) {
      console.error('ERROR ENDING GAME:', error);
      alert('Failed to end game. Please try again.');
    } finally {
      setIsEndingGame(prev => {
        const newSet = new Set(prev);
        newSet.delete(courtId);
        return newSet;
      });
    }
  }, [findMatchIdByCourtId, setIsEndingGame, setShowWinnerDialog]);

  const selectPlayersForMatch = useCallback((availablePlayers: Participant[], needed: number): Participant[] => {
    if (availablePlayers.length <= needed) {
      return availablePlayers;
    }

    const enhancedPlayers = availablePlayers.map(player => ({
      ...player,
      gamesPlayed: Math.floor(Math.random() * 20),
      skillScore: getSkillScore(player.skillLevel),
      readyTime: Date.now()
    }));

    const sortedPlayers = enhancedPlayers.sort((a, b) => {
      if (a.playerStatus !== b.playerStatus) {
        return a.playerStatus === 'READY' ? -1 : 1;
      }
      
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }
      
      if (a.skillScore !== b.skillScore) {
        return a.skillScore - b.skillScore;
      }
      
      return a.readyTime - b.readyTime;
    });

    return sortedPlayers.slice(0, needed);
  }, [getSkillScore]);

  const matchMakeCourt = useCallback(async (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    if (court?.status === "Closed") {
      alert("Cannot add players to a closed court");
      return;
    }

    const currentTeams = courtTeams[courtId] ?? { A: [], B: [] };
    const currentTotalPlayers = currentTeams.A.length + currentTeams.B.length;
    if (currentTotalPlayers >= 4) {
      alert("Court already has maximum 4 players");
      return;
    }

    const perTeam = Math.floor((courts.find((c) => c.id === courtId)?.capacity ?? 4) / 2);
    const need = perTeam * 2;
    
    const selectedPlayers = selectPlayersForMatch(readyList, need);
    
    if (selectedPlayers.length < 2) {
      alert("Need at least 2 ready players to start a match");
      return;
    }

    const { A, B } = buildBalancedTeams(selectedPlayers, perTeam);

    const allPlayers = [...A, ...B];
    setIsAddingPlayersToMatch(prev => new Set([...prev, ...allPlayers.map(p => p.id)]));
    
    try {
      if (isDummySession) {
        await fetchGameMatches();
        setIsAddingPlayersToMatch(prev => {
          const newSet = new Set(prev);
          allPlayers.forEach(player => newSet.delete(player.id));
          return newSet;
        });
        return;
      }

      const matchId = findMatchIdByCourtId(courtId);
      if (!matchId) {
        console.error(`No match found for court ${courtId}`);
        alert('No active match found for this court');
        return;
      }

      const teamAAssignments = A.map(player => assignPlayerToTeam(matchId, player.id, 1));
      const teamBAssignments = B.map(player => assignPlayerToTeam(matchId, player.id, 2));
      
      await Promise.all([...teamAAssignments, ...teamBAssignments]);
      
      await fetchGameMatches();
    } catch (error) {
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

  const canStartGame = useCallback((courtId: string): boolean => {
    const court = courts.find(c => c.id === courtId);
    const teams = courtTeams[courtId] ?? { A: [], B: [] };
    const totalPlayers = teams.A.length + teams.B.length;
    
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasActiveMatch = courtMatches.some(match => 
      match.matchStatusId && match.matchStatusId <= 10 && match.matchStatusId !== 5
    );
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    const canStart = court?.status === "Open" && totalPlayers === 4 && hasActiveMatch && !hasInGameMatch;
    
    return canStart;
  }, [courts, courtTeams, gameMatches]);

  const canEndGame = useCallback((courtId: string): boolean => {
    const courtMatches = gameMatches.filter(match => match.courtId === courtId);
    const hasInGameMatch = courtMatches.some(match => match.matchStatusId === 5);
    
    return hasInGameMatch;
  }, [gameMatches]);

  const canCloseCourt = useCallback((courtId: string): boolean => {
    const court = courts.find(c => c.id === courtId);
    return court?.status === "Open" || court?.status === "Closed";
  }, [courts]);

  const viewMatchupScreen = useCallback((courtId: string, rawSessionData: any) => {
    const matchId = findMatchIdByCourtId(courtId);
    if (!matchId) {
      console.error(`No match found for court ${courtId}`);
      alert('No active match found for this court. Please create a match first.');
      return;
    }

    localStorage.setItem('activeCourtId', courtId);
    if (currentOccurrenceId) {
      localStorage.setItem('activeOccurrenceId', currentOccurrenceId);
    }
    if (rawSessionData?.hubId) {
      localStorage.setItem('activeHubId', rawSessionData.hubId);
    }

    const currentOccurrence = rawSessionData?.occurrences?.find((occ: any) => occ.id === currentOccurrenceId);
    const sessionName = rawSessionData?.sessionName || "Open Play";
    const sportName = rawSessionData?.sport?.name || "Pickleball";
    const hubName = rawSessionData?.hub?.sportsHubName || "Sports Hub";

    const matchupData = {
      id: `matchup-${currentOccurrenceId || Date.now()}`,
      sport: `${sportName} - ${sessionName}`,
      hubName: hubName,
      occurrenceId: currentOccurrenceId,
      occurrenceDate: currentOccurrence?.occurrenceDate,
      occurrenceStartTime: currentOccurrence?.startTime,
      occurrenceEndTime: currentOccurrence?.endTime,
      focusedCourtId: courtId,
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

    const occurrenceId = currentOccurrenceId || occurrence?.id;

    const existingWindow = window.open('', 'matchupWindow');
    if (existingWindow && !existingWindow.closed) {
      existingWindow.location.href = `/matchup-multi/${matchId}?occurrenceId=${occurrenceId}`;
      existingWindow.focus();
      existingWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
    } else {
      const newWindow = window.open(`/matchup-multi/${matchId}?occurrenceId=${occurrenceId}`, 'matchupWindow', 'width=1920,height=1080');
      
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          newWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
        });
      }
    }
  }, [findMatchIdByCourtId, currentOccurrenceId, courts, courtTeams, teamNames, occurrence]);

  const setResult = useCallback((matchId: string, winner: "A" | "B") => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, winner, status: "Completed", score: scoreEntry[matchId] } : m
      )
    );
  }, [setMatches, scoreEntry]);

  const setScoreEntryForMatch = useCallback((matchId: string, score: string) => {
    setScoreEntry((s) => ({ ...s, [matchId]: score }));
  }, [setScoreEntry]);

  const setTeamNamesForCourt = useCallback((courtId: string, team: "A" | "B", name: string) => {
    setTeamNames(prev => ({
      ...prev,
      [courtId]: { ...prev[courtId], [team]: name }
    }));
  }, [setTeamNames]);

  return {
    showWinnerDialog,
    setShowWinnerDialog,
    scoreEntry,
    setScoreEntry: setScoreEntryForMatch,
    
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
    
    canStartGame,
    canEndGame,
    canCloseCourt,
  };
};
