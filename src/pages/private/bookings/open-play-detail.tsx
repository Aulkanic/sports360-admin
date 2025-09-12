/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, type Location } from "react-router-dom";

import { SAMPLE_SESSIONS } from "@/components/features/open-play/data/sample-sessions";
import type {
  Court,
  Match,
  OpenPlaySession,
  Participant,
} from "@/components/features/open-play/types";
import type { ParticipantStatus } from "@/services/open-play.service";
import { getStatusString } from "@/components/features/open-play/types";
import { buildBalancedTeams } from "@/components/features/open-play/utils";
import AddPlayerModal, { type PlayerFormData } from "@/components/features/open-play/AddPlayerModal";
import { getOpenPlaySessionById, convertSessionFromAPI, convertParticipantFromAPI, updateParticipantPlayerStatusByAdmin, mapParticipantStatusToPlayerStatusId } from "@/services/open-play.service";
import { createGameMatch } from "@/services/game-match.service";
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
  const getSkillScore = (level: string): number => {
    switch (level) {
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
        skillScore: participant.skillScore ?? getSkillScore(participant.skillLevel)
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
  const [lastStatusUpdate, setLastStatusUpdate] = useState<number>(0);
  const [isCreatingGameMatch, setIsCreatingGameMatch] = useState(false);

  const inAnyTeam = useMemo(
    () =>
      new Set(
        Object.values(courtTeams)
          .flatMap((t) => [...t.A, ...t.B])
          .map((p) => p.id)
      ),
    [courtTeams]
  );

  const readyList = useMemo(
    () => {      
      const ready = participants.filter((p) => {
        const statusString = getStatusString(p.playerStatus?.description);
        const isReady = statusString === "READY";
        const notInTeam = !inAnyTeam.has(p.id);
        return isReady && notInTeam;
      });
      return ready;
    },
    [participants, inAnyTeam]
  );
  const restingList = useMemo(
    () => participants.filter((p) => getStatusString(p.playerStatus?.description) === "RESTING" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const reserveList = useMemo(
    () => participants.filter((p) => getStatusString(p.playerStatus?.description) === "RESERVE" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const waitlistList = useMemo(
    () => participants.filter((p) => getStatusString(p.playerStatus?.description) === "WAITLIST" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );

  const session = useMemo<OpenPlaySession | null>(() => {
    if (sessionById) return { ...sessionById, participants };
    return null;
  }, [sessionById, participants]);


  // Auto-refresh functionality - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    console.log('Auto-refresh is currently disabled for debugging');
    // const refreshInterval = setInterval(async () => {
    //   if (session?.id && !isRefreshing && isUpdatingStatus.size === 0) {
    //     // Don't refresh if we just updated a status (within last 30 seconds)
    //     const timeSinceLastUpdate = Date.now() - lastStatusUpdate;
    //     if (timeSinceLastUpdate > 30000) { // Increased to 30 seconds
    //       console.log('Auto-refreshing session data...');
    //       await refreshSessionData();
    //     } else {
    //       console.log('Skipping auto-refresh due to recent status update, time since:', timeSinceLastUpdate);
    //     }
    //   } else {
    //     console.log('Skipping auto-refresh - refreshing:', isRefreshing, 'updating status:', isUpdatingStatus.size);
    //   }
    // }, 30000); // Refresh every 30 seconds (increased from 15)

    // return () => clearInterval(refreshInterval);
  }, [session?.id, isRefreshing, lastStatusUpdate, isUpdatingStatus.size]);

  async function updateStatus(participantId: string, status: ParticipantStatus) {
    console.log(`Updating participant ${participantId} to status: ${status}`);
    
    // Track the status update time to prevent auto-refresh from overriding
    setLastStatusUpdate(Date.now());
    
    // Immediately update local state for instant UI feedback
    setParticipants((prev) => {
      const updated = prev.map((p) => 
          p.id === participantId 
            ? { 
                ...p, 
              playerStatus: { id: 1, description: status },
              readyTime: status === 'READY' ? Date.now() : p.readyTime
            } 
          : p
      );
      console.log('Updated participants locally:', updated.find(p => p.id === participantId));
      return updated;
    });

    // Check if we have occurrence data
    if (!occurrence?.id) {
      console.warn('No occurrence ID available for status update');
      return;
    }

    // Set loading state
    setIsUpdatingStatus(prev => new Set(prev).add(participantId));

    try {
      // Map status to player status ID
      const playerStatusId = mapParticipantStatusToPlayerStatusId(status);
      
      // Call admin API
      const updatedParticipant = await updateParticipantPlayerStatusByAdmin(
        participantId,
        occurrence.id,
        playerStatusId
      );

      // Update local state with the response from server (in case server has different data)
      const convertedParticipant = convertParticipantFromAPI(updatedParticipant);
      console.log('Server response for participant:', convertedParticipant);
      console.log('Expected status:', status, 'Server status:', convertedParticipant.status);
      
      // Only update from server if the status matches what we expect or is a valid status
      if (convertedParticipant.status && 
          (convertedParticipant.status === status || 
           ['READY', 'RESTING', 'RESERVE', 'IN-GAME', 'WAITLIST', 'PENDING', 'ONGOING', 'COMPLETED'].includes(convertedParticipant.status))) {
        setParticipants((prev) => {
          const currentParticipant = prev.find(p => p.id === participantId);
          console.log('Current participant before server update:', currentParticipant);
          
          const updated = prev.map((p) => 
            p.id === participantId 
              ? { 
                  ...p, 
                  playerStatus: { id: 1, description: convertedParticipant.status },
                  status: convertedParticipant.status,
                  readyTime: status === 'READY' ? Date.now() : p.readyTime
                } 
              : p
          );
          console.log('Updated participants from server:', updated.find(p => p.id === participantId));
          return updated;
        });
      } else {
        console.log('Skipping server update - status does not match expected or is invalid:', convertedParticipant.status);
        // Keep the optimistic update and just update the timestamp
      }
      
      // Update the last status update time to prevent auto-refresh from overriding
      setLastStatusUpdate(Date.now());
    } catch (error) {
      console.error('Error updating participant status:', error);
      // Revert the optimistic update on error
      setParticipants((prev) =>
        prev.map((p) => 
          p.id === participantId 
            ? { 
                ...p, 
                playerStatus: p.playerStatus, // Keep original status
                readyTime: p.readyTime
              } 
            : p
        )
      );
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

    await updateStatus(participant.id, "IN-GAME");
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const participant = (active?.data?.current as { participant?: Participant } | undefined)
      ?.participant;
    if (!participant) return;

    const overId = String(over.id as UniqueIdentifier);

    // Queues
    if (overId === "ready") {
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "READY");
      return;
    }
    if (overId === "resting") {
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "RESTING");
      return;
    }
    if (overId === "reserve") {
      removeFromAllTeams(participant.id);
      await updateStatus(participant.id, "RESERVE");
      return;
    }
    if (overId === "waitlist") {
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
    matchName: string;
  }) {
    const selectedCourt = availableCourts.find(c => c.id === data.courtId);
    if (!selectedCourt) return;

    setIsCreatingGameMatch(true);
    
    try {
      // Create game match record in the backend
      const gameMatchData = {
        occurrenceId: occurrence?.id || sessionById?.occurrenceId || '1', // Use occurrence ID or fallback
        courtId: data.courtId,
        matchName: data.matchName,
        requiredPlayers: selectedCourt.capacity || 4,
        team1Name: data.team1Name,
        team2Name: data.team2Name,
        organizerNotes: `Game match created for ${selectedCourt.name}`
      };

      const createdMatch = await createGameMatch(gameMatchData);

      // Create a new court instance for the game management UI
      const newCourt: Court = {
        id: createdMatch.id, // Use the API-created match ID
        name: `${selectedCourt.name} - ${data.matchName}`,
        capacity: selectedCourt.capacity || 4,
        status: "Open"
      };

      setCourts((prev) => [...prev, newCourt]);
      setCourtTeams((prev) => ({ ...prev, [newCourt.id]: { A: [], B: [] } }));
      
      // Set team names
      setTeamNames((prev) => ({
        ...prev,
        [newCourt.id]: {
          A: data.team1Name,
          B: data.team2Name
        }
      }));

      console.log('Game match created successfully:', createdMatch);
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
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "IN-GAME" } : c)));
    const t = courtTeams[courtId] ?? { A: [], B: [] };
    await Promise.all([...t.A, ...t.B].map((p) => updateStatus(p.id, "IN-GAME")));
  }

  function endGame(courtId: string) {
    // Show winner selection dialog instead of automatically ending
    setShowWinnerDialog(courtId);
  }

  async function confirmGameEnd(courtId: string, winner: "A" | "B", score?: string) {
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "Open" } : c)));
    const t = courtTeams[courtId] ?? { A: [], B: [] };
    
    // Update participants to resting and increment games played
    await Promise.all([...t.A, ...t.B].map(async (p) => {
      await updateStatus(p.id, "RESTING");
      // Increment games played count
      setParticipants(prev => 
        prev.map(participant => 
          participant.id === p.id 
            ? { ...participant, gamesPlayed: (participant.gamesPlayed || 0) + 1 }
            : participant
        )
      );
    }));
    
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
    await Promise.all([...A, ...B].map((p) => updateStatus(p.id, "IN-GAME")));
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
    const teams = courtTeams[courtId] ?? { A: [], B: [] };
    
    if (teams.A.length === 0 && teams.B.length === 0) {
      alert("No players assigned to this court yet");
      return;
    }

    // Save the active court to localStorage
    localStorage.setItem('activeCourtId', courtId);

    // Create matchup data with all courts from the hub
    const matchupData = {
      id: `matchup-${Date.now()}`,
      sport: session?.title || "Open Play",
      focusedCourtId: courtId, // This will be the court to focus on
      courts: courts.map(c => ({
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        status: c.status,
        teamA: courtTeams[c.id]?.A || [],
        teamB: courtTeams[c.id]?.B || [],
        teamAName: teamNames[c.id]?.A,
        teamBName: teamNames[c.id]?.B,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score: undefined,
        winner: undefined
      }))
    };

    // Check if matchup window is already open
    const existingWindow = window.open('', 'matchupWindow');
    if (existingWindow && !existingWindow.closed) {
      // Update existing window
      existingWindow.location.href = `/matchup-multi/${courtId}`;
      existingWindow.focus();
      // Send updated data
      existingWindow.postMessage({ type: 'MATCHUP_DATA', data: matchupData }, window.location.origin);
    } else {
      // Open new Multi-Court TV Display window
      const newWindow = window.open(`/matchup-multi/${courtId}`, 'matchupWindow', 'width=1920,height=1080');
      
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
  function approveWaitlistParticipant(participantId: string, targetStatus: "READY" | "RESERVE") {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              status: targetStatus,
              isApproved: true,
              paymentStatus: "Paid",
            }
          : p
      )
    );
  }

  function rejectWaitlistParticipant(participantId: string) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              isApproved: false,
              paymentStatus: "Rejected",
            }
          : p
      )
    );
  }


  // Function to refresh session data from API
  const refreshSessionData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsRefreshing(true);
      
      if (!session?.id) {
        console.error('No session ID available for refresh');
        return;
      }
      
      const sessionId = session.id;
      console.log('Refreshing session data for sessionId:', sessionId);
      
      const updatedSessionData = await getOpenPlaySessionById(sessionId);
      console.log('Fresh session data from API:', updatedSessionData);
      
      const convertedSession = convertSessionFromAPI(updatedSessionData);
      console.log('Converted session data:', convertedSession);
      
      // If we have occurrence-specific data, find the matching occurrence
      if (occurrence?.id && updatedSessionData.occurrences) {
        const matchingOccurrence = updatedSessionData.occurrences.find((occ: any) => occ.id === occurrence.id);
        if (matchingOccurrence?.participants) {
          console.log('Using occurrence-specific participants:', matchingOccurrence.participants);
          const freshParticipants = matchingOccurrence.participants.map(convertParticipantFromAPI).map((p: any) => ({
            ...p,
            skillLevel: p.level as 'Beginner' | 'Intermediate' | 'Advanced'
          }));
          
          // Only update participants that haven't been recently modified
          setParticipants((currentParticipants) => {
            const timeSinceLastUpdate = Date.now() - lastStatusUpdate;
            if (timeSinceLastUpdate < 30000) { // Within last 30 seconds
              console.log('Skipping participant update due to recent status change, time since:', timeSinceLastUpdate);
              return currentParticipants;
            }
            
            console.log('Updated participants from occurrence:', freshParticipants);
            return freshParticipants;
          });
        }
      } else if (convertedSession.participants) {
        // Otherwise use session participants
        console.log('Using session participants:', convertedSession.participants);
        const freshParticipants = convertedSession.participants.map((p: any) => ({
          ...p,
          skillLevel: p.level as 'Beginner' | 'Intermediate' | 'Advanced'
        }));
        
        // Only update participants that haven't been recently modified
        setParticipants((currentParticipants) => {
          const timeSinceLastUpdate = Date.now() - lastStatusUpdate;
          if (timeSinceLastUpdate < 30000) { // Within last 30 seconds
            console.log('Skipping participant update due to recent status change, time since:', timeSinceLastUpdate);
            return currentParticipants;
          }
          
          console.log('Updated participants from session:', freshParticipants);
          return freshParticipants;
        });
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
      
      // Show success message based on payment status
      if (playerData.paymentStatus === 'Paid') {
        console.log('✅ Player added as "Ready to Play"');
      } else if (playerData.paymentStatus === 'Pending') {
        console.log('⚠️ Player added to Waitlist - Payment pending');
      }
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
                <h1 className="text-2xl font-bold">{session.title}</h1>
                {occurrence && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Specific Occurrence
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{session.when}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
                <Badge variant="outline" className="text-white border-white/30">
                  {session.level.join(" / ")}
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
                className="text-white border-white/30 hover:bg-white/10"
                onClick={refreshSessionData}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
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
          courtTeams={courtTeams}
          matches={matches}
          scoreEntry={scoreEntry}
          showWinnerDialog={showWinnerDialog}
          teamNames={teamNames}
          readyList={readyList}
          restingList={restingList}
          reserveList={reserveList}
          waitlistList={waitlistList}
          availableCourts={availableCourts}
          onDragEnd={onDragEnd}
          onAddCourt={addCourt}
          isCreatingGameMatch={isCreatingGameMatch}
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
        />
      )}


      {/* Add Player Modal */}
      <AddPlayerModal
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        sessionTitle={session.title}
        occurrenceId={occurrence?.id || (session as any).occurrenceId || ""}
        sessionPrice={150} // Default price in pesos - you can get this from session data if available
        onAddPlayer={handleAddPlayer}
        onSuccess={handlePlayerAddSuccess}
        onError={handlePlayerAddError}
        isLoading={isAddingPlayer}
      />
    </div>
  );
};

export default OpenPlayDetailPage;
