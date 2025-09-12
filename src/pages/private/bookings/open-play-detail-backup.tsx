/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, type Location } from "react-router-dom";

import { CourtCanvas } from "@/components/features/open-play/components/court-canvas";
import CourtMatchmakingCard from "@/components/features/open-play/components/court-matching-card";
import DroppablePanel from "@/components/features/open-play/components/draggable-panel";
import DraggablePill from "@/components/features/open-play/components/draggable-pill";
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

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { urls } from "@/routes";

import { DndContext, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import {
  Users,
  Clock,
  MapPin,
  Trophy,
  UserCheck,
  UserX,
  UserLock,
  UserPlus,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
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

  const [courts, setCourts] = useState<Court[]>([
    { id: "court-1", name: "Court 1", capacity: 4, status: "Open" },
  ]);

  const [courtTeams, setCourtTeams] = useState<
    Record<string, { A: Participant[]; B: Participant[] }>
  >({ "court-1": { A: [], B: [] } });

  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});
  const [showWinnerDialog, setShowWinnerDialog] = useState<string | null>(null);
  const [teamNames, setTeamNames] = useState<Record<string, { A: string; B: string }>>({});
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

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
    () => participants.filter((p) => p.status === "READY" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const restingList = useMemo(
    () => participants.filter((p) => p.status === "RESTING" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const reserveList = useMemo(
    () => participants.filter((p) => p.status === "RESERVE" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const waitlistList = useMemo(
    () => participants.filter((p) => p.status === "WAITLIST" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );

  const session = useMemo<OpenPlaySession | null>(() => {
    if (sessionById) return { ...sessionById, participants };
    return null;
  }, [sessionById, participants]);

  async function updateStatus(participantId: string, status: ParticipantStatus) {
    // Check if we have occurrence data
    if (!occurrence?.id) {
      console.warn('No occurrence ID available for status update');
      // Still update local state for UI responsiveness
      setParticipants((prev) =>
        prev.map((p) => 
          p.id === participantId 
            ? { 
                ...p, 
                status,
                readyTime: status === 'READY' ? Date.now() : p.readyTime
              } 
            : p
        )
      );
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

      // Update local state with the response from server
      setParticipants((prev) =>
        prev.map((p) => 
          p.id === participantId 
            ? { 
                ...p, 
                status: convertParticipantFromAPI(updatedParticipant).status,
                readyTime: status === 'READY' ? Date.now() : p.readyTime
              } 
            : p
        )
      );
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

  function addCourt() {
    const idx = courts.length + 1;
    const id = `court-${idx}`;
    setCourts((prev) => [...prev, { id, name: `Court ${idx}`, capacity: 4, status: "Open" }]);
    setCourtTeams((prev) => ({ ...prev, [id]: { A: [], B: [] } }));
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

  function getStatusIcon(status: string) {
    switch (status) {
      case "READY":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "IN-GAME":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "RESTING":
        return <Pause className="h-4 w-4 text-orange-600" />;
      case "RESERVE":
        return <RotateCcw className="h-4 w-4 text-gray-600" />;
      case "WAITLIST":
        return <UserLock className="h-4 w-4 text-yellow-600" />;
      default:
        return <UserX className="h-4 w-4 text-red-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "READY":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN-GAME":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RESTING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "RESERVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "WAITLIST":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-red-100 text-red-800 border-red-200";
    }
  }

  // Function to refresh session data from API
  const refreshSessionData = async () => {
    try {
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
          setParticipants(freshParticipants);
          console.log('Updated participants from occurrence:', freshParticipants);
        }
      } else if (convertedSession.participants) {
        // Otherwise use session participants
        console.log('Using session participants:', convertedSession.participants);
        const freshParticipants = convertedSession.participants.map((p: any) => ({
          ...p,
          skillLevel: p.level as 'Beginner' | 'Intermediate' | 'Advanced'
        }));
        setParticipants(freshParticipants);
        console.log('Updated participants from session:', freshParticipants);
      }
      
      console.log('Session data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session data:', error);
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
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="xl:col-span-3 space-y-6">
                {/* Session Info Card */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Session Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Rules</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {session.rules ?? "Standard club rules apply."}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Format</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {session.format ?? "Open queue and court rotation."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Participants Management */}
                <div className="bg-white rounded-xl border shadow-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Participants</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          <span>Total: {participants.length}</span>
                        </div>
                        <Button
                          onClick={() => setAddPlayerOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Player
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="p-6 border-b bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{readyList.length}</div>
                        <div className="text-xs text-gray-600">Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {participants.filter((p) => getStatusString(p.status) === "IN-GAME").length}
                        </div>
                        <div className="text-xs text-gray-600">In Game</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{restingList.length}</div>
                        <div className="text-xs text-gray-600">Resting</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{reserveList.length}</div>
                        <div className="text-xs text-gray-600">Reserve</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{waitlistList.length}</div>
                        <div className="text-xs text-gray-600">Waitlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {participants.filter((p) => p.paymentStatus === "Rejected").length}
                        </div>
                        <div className="text-xs text-gray-600">Rejected</div>
                      </div>
                    </div>
                  </div>

                  {/* Waitlist Section */}
                  {waitlistList.length > 0 && (
                    <div className="p-6 border-b bg-yellow-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <UserLock className="h-5 w-5 text-yellow-600" />
                          <h3 className="font-semibold text-yellow-800">
                            Waitlist ({waitlistList.length})
                          </h3>
                          <Badge variant="outline" className="text-yellow-700 border-yellow-400">
                            Payment Required
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              waitlistList.forEach((p) =>
                                approveWaitlistParticipant(p.id, "RESERVE")
                              );
                            }}
                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Approve All as Reserve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              waitlistList.forEach((p) =>
                                approveWaitlistParticipant(p.id, "READY")
                              );
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve All as Ready
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {waitlistList.map((participant) => {
                          const personalInfo = (participant as any).user?.personalInfo;
                          const participantName = personalInfo 
                            ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
                            : (participant as any).user?.userName || 'Unknown Player';
                          return (
                          <div
                            key={participant.id}
                            className="p-4 bg-white rounded-lg border border-yellow-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={participant.avatar || '/default_avatar.png'} />
                                
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{participantName}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {participant.skillLevel}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        participant.paymentStatus === "Pending"
                                          ? "text-orange-700 border-orange-300 bg-orange-50"
                                          : participant.paymentStatus === "Rejected"
                                          ? "text-red-700 border-red-300 bg-red-50"
                                          : "text-green-700 border-green-300 bg-green-50"
                                      )}
                                    >
                                      {participant.paymentStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectWaitlistParticipant(participant.id)}
                                  className="text-red-700 border-red-300 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    approveWaitlistParticipant(participant.id, "RESERVE")
                                  }
                                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Approve as Reserve
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    approveWaitlistParticipant(participant.id, "READY")
                                  }
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve as Ready
                                </Button>
                              </div>
                            </div>
                            {participant.waitlistReason && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-4 border-yellow-400">
                                <span className="font-medium">Reason:</span>{" "}
                                {participant.waitlistReason}
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Participants */}
                  <div className="p-6">
                    <h3 className="font-semibold mb-4">All Participants</h3>
                    <div className="space-y-3">
                        {participants.map((participant) => {
                          const personalInfo = (participant as any).user?.personalInfo;
                          const participantName = personalInfo 
                            ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
                            : (participant as any).user?.userName || 'Unknown Player';
                          return(
                        <div
                          key={participant.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg transition-colors",
                            participant.paymentStatus === "Rejected"
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={participant.avatar || '/default_avatar.png'} />
                            
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {participantName}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {participant.skillLevel}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(getStatusString(participant.status))}
                                  <span className="text-xs text-gray-600">{getStatusString(participant.status)}</span>
                                </div>
                                {participant.gamesPlayed !== undefined && (
                                  <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-50">
                                    {participant.gamesPlayed} games
                                  </Badge>
                                )}
                                {participant.paymentStatus !== "Paid" && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      participant.paymentStatus === "Pending"
                                        ? "text-orange-700 border-orange-300 bg-orange-50"
                                        : "text-red-700 border-red-300 bg-red-50"
                                    )}
                                  >
                                    {participant.paymentStatus}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(getStatusString(participant.status))}>
                              {getStatusString(participant.status)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusString(participant.status) !== "READY" &&
                                participant.paymentStatus !== "Rejected" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      removeFromAllTeams(participant.id);
                                      await updateStatus(participant.id, "READY");
                                    }}
                                    disabled={isUpdatingStatus.has(participant.id)}
                                    className="text-green-700 border-green-300 hover:bg-green-50"
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    {isUpdatingStatus.has(participant.id) ? "Updating..." : "READY"}
                                  </Button>
                                )}
                              {getStatusString(participant.status) !== "WAITLIST" &&
                                participant.paymentStatus !== "Rejected" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      removeFromAllTeams(participant.id);
                                      await updateStatus(participant.id, "WAITLIST");
                                    }}
                                    disabled={isUpdatingStatus.has(participant.id)}
                                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                                  >
                                    <UserLock className="h-3 w-3 mr-1" />
                                    {isUpdatingStatus.has(participant.id) ? "Updating..." : "WAITLIST"}
                                  </Button>
                                )}
                              {getStatusString(participant.status) !== "RESERVE" &&
                                participant.paymentStatus !== "Rejected" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      removeFromAllTeams(participant.id);
                                      await updateStatus(participant.id, "RESERVE");
                                    }}
                                    disabled={isUpdatingStatus.has(participant.id)}
                                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    {isUpdatingStatus.has(participant.id) ? "Updating..." : "RESERVE"}
                                  </Button>
                                )}
                              {participant.paymentStatus === "Rejected" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setParticipants((prev) =>
                                      prev.map((p) =>
                                        p.id === participant.id
                                          ? { ...p, paymentStatus: "Pending", isApproved: false }
                                          : p
                                      )
                                    );
                                  }}
                                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Reconsider
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )})}
                      {participants.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No participants yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Participants</span>
                      <span className="font-semibold">{participants.length}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Available Courts</span>
                      <span className="font-semibold">
                        {courts.filter((c) => c.status === "Open").length}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Games</span>
                      <span className="font-semibold">
                        {courts.filter((c) => c.status === "IN-GAME").length}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Waitlist</span>
                      <span className="font-semibold text-yellow-600">{waitlistList.length}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Pending</span>
                      <span className="font-semibold text-orange-600">
                        {participants.filter((p) => p.paymentStatus === "Pending").length}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="font-semibold text-red-600">
                        {participants.filter((p) => p.paymentStatus === "Rejected").length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {waitlistList.length > 0 && (
                      <>
                        <Button
                          onClick={() => {
                            waitlistList.forEach((p) => approveWaitlistParticipant(p.id, "READY"));
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve All as Ready
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            waitlistList.forEach((p) => approveWaitlistParticipant(p.id, "RESERVE"));
                          }}
                          className="w-full text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Approve All as Reserve
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={() => setTab("game")} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Manage Games
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "game" && (
        <DndContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-6 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-[400px_minmax(0,1fr)] gap-6">
                {/* ===== Left: Bench / Queues ===== */}
                <aside className="space-y-4 lg:sticky lg:top-6 h-max">
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <p className="text-sm font-semibold">Bench</p>
                    <p className="text-xs text-muted-foreground">Drag players from here onto courts</p>
                  </div>

                  {/* Ready */}
                  <DroppablePanel
                    id="ready"
                    title="READY"
                    subtitle="Players ready to play"
                    childrenClassName="grid grid-cols-1"
                  >
                    {readyList.map((p) => (
                      <DraggablePill key={p.id} participant={p} />
                    ))}
                    {readyList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No players ready</p>
                    )}
                  </DroppablePanel>

                  {/* Resting */}
                  <DroppablePanel
                    id="resting"
                    title="RESTING"
                    subtitle="Players taking a break"
                    childrenClassName="grid grid-cols-1"
                  >
                    {restingList.map((p) => (
                      <DraggablePill key={p.id} participant={p} />
                    ))}
                    {restingList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No players resting</p>
                    )}
                  </DroppablePanel>

                  {/* Reserve */}
                  <DroppablePanel
                    id="reserve"
                    title="RESERVE"
                    subtitle="Overflow or RSVP later"
                    childrenClassName="grid grid-cols-1"
                  >
                    {reserveList.map((p) => (
                      <DraggablePill key={p.id} participant={p} />
                    ))}
                    {reserveList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No players in reserve</p>
                    )}
                  </DroppablePanel>

                  {/* Waitlist */}
                  <DroppablePanel
                    id="waitlist"
                    title="WAITLIST"
                    subtitle="Waiting for availability"
                    childrenClassName="grid grid-cols-1"
                  >
                    {waitlistList.map((p) => (
                      <DraggablePill key={p.id} participant={p} />
                    ))}
                    {waitlistList.length === 0 && (
                      <p className="text-xs text-muted-foreground">No players in waitlist</p>
                    )}
                  </DroppablePanel>
                </aside>

                {/* ===== Right: Courts ===== */}
                <section className="space-y-4">
                  {/* Controls */}
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={addCourt}>
                          Add Court
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const activeCourt = courts.find(c => c.status === "IN-GAME");
                            if (activeCourt) {
                              viewMatchupScreen(activeCourt.id);
                            } else {
                              alert("No active games to display");
                            }
                          }}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          <Trophy className="h-4 w-4 mr-2" />
                          Play Screen
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Court canvas */}
                  <CourtCanvas>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courts.map((c) => {
                        const teams = courtTeams[c.id] ?? { A: [], B: [] };
                        const perTeam = Math.floor(c.capacity / 2);

                        return (
                          <div key={c.id}>
                           

                            <div className="p-2">
                                                              <CourtMatchmakingCard
                                  court={c}
                                  teamA={teams.A}
                                  teamB={teams.B}
                                  capacity={c.capacity}
                                  onStart={() => startGame(c.id)}
                                  onEnd={() => endGame(c.id)}
                                  onRename={() => renameCourt(c.id)}
                                  onToggleOpen={() => toggleCourtOpen(c.id)}
                                  onRandomPick={() => matchMakeCourt(c.id)}
                                  canStartGame={canStartGame(c.id)}
                                  canEndGame={canEndGame(c.id)}
                                  canCloseCourt={canCloseCourt(c.id)}
                                />
                              <div className="flex flex-col items-center gap-2 mt-2">
                                <p className="text-[11px] text-muted-foreground text-center">
                                  Team size: {perTeam} • Drag players onto A/B or use "Matchmake This Court"
                                </p>
                                {(teams.A.length > 0 || teams.B.length > 0) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewMatchupScreen(c.id)}
                                    className="text-xs h-7 px-3 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                  >
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Play Screen
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CourtCanvas>

                  {/* Matches */}
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold">Matches</p>
                      <span className="text-xs text-muted-foreground">{matches.length} scheduled</span>
                    </div>

                    {matches.length === 0 ? (
                      <div className="rounded-md border p-3 text-xs text-muted-foreground">
                        No matches yet. Confirm matches to generate them from court assignments.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {matches.map((m) => (
                          <div key={m.id} className="rounded-2xl border bg-card p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">{m.courtName}</p>
                              <Badge variant={m.status === "Completed" ? "secondary" : "outline"}>
                                {m.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="font-medium">Team A {m.teamAName && `(${m.teamAName})`}</p>
                                <p className="text-muted-foreground truncate">
                                  {m.teamA.map((p) => p.name).join(", ")}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Team B {m.teamBName && `(${m.teamBName})`}</p>
                                <p className="text-muted-foreground truncate">
                                  {m.teamB.map((p) => p.name).join(", ")}
                                </p>
                              </div>
                            </div>
                            {m.status === "Scheduled" ? (
                              <div className="flex items-center justify-between gap-2">
                                <Input
                                  className="h-8 w-28"
                                  placeholder="Score"
                                  value={scoreEntry[m.id] ?? ""}
                                  onChange={(e) =>
                                    setScoreEntry((s) => ({
                                      ...s,
                                      [m.id]: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setResult(m.id, "A")}>
                                    Set A Win
                                  </Button>
                                  <Button size="sm" onClick={() => setResult(m.id, "B")}>
                                    Set B Win
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs">
                                <p>
                                  Winner:{" "}
                                  <span className="font-medium">
                                    {m.winner === "A"
                                      ? m.teamAName || m.teamA.map((p) => p.name).join(", ")
                                      : m.teamBName || m.teamB.map((p) => p.name).join(", ")}
                                  </span>
                                </p>
                                <p className="text-muted-foreground">
                                  Loser:{" "}
                                  {m.winner === "A"
                                    ? m.teamBName || m.teamB.map((p) => p.name).join(", ")
                                    : m.teamAName || m.teamA.map((p) => p.name).join(", ")}
                                  {m.score ? ` • Score: ${m.score}` : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Winner Selection Dialog */}
                  {showWinnerDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Select Winner</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose the winning team for {courts.find(c => c.id === showWinnerDialog)?.name}
                        </p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Team A {teamNames[showWinnerDialog]?.A && `(${teamNames[showWinnerDialog]?.A})`}</p>
                              <p className="text-sm text-gray-600">
                                {courtTeams[showWinnerDialog]?.A.map(p => p.name).join(", ")}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => confirmGameEnd(showWinnerDialog, "A")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Team A Wins
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Team B {teamNames[showWinnerDialog]?.B && `(${teamNames[showWinnerDialog]?.B})`}</p>
                              <p className="text-sm text-gray-600">
                                {courtTeams[showWinnerDialog]?.B.map(p => p.name).join(", ")}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => confirmGameEnd(showWinnerDialog, "B")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Team B Wins
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowWinnerDialog(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Naming Section */}
                  <div className="bg-white rounded-xl border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold">Team Names</p>
                      <span className="text-xs text-muted-foreground">Customize team names for courts</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {courts.map((court) => {
                        const teams = courtTeams[court.id] ?? { A: [], B: [] };
                        const currentNames = teamNames[court.id] ?? { A: "", B: "" };
                        
                        return (
                          <div key={court.id} className="border rounded-lg p-3 space-y-3">
                            <h4 className="font-medium text-sm">{court.name}</h4>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-gray-600">Team A Name</label>
                                <div className="flex gap-2">
                                  <Input
                                    className="h-8 text-sm"
                                    placeholder="Enter team name"
                                    value={currentNames.A}
                                    onChange={(e) =>
                                      setTeamNames(prev => ({
                                        ...prev,
                                        [court.id]: { ...prev[court.id], A: e.target.value }
                                      }))
                                    }
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const teamA = teams.A.map(p => p.name).join(", ");
                                      setTeamNames(prev => ({
                                        ...prev,
                                        [court.id]: { ...prev[court.id], A: teamA }
                                      }));
                                    }}
                                  >
                                    Use Players
                                  </Button>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-600">Team B Name</label>
                                <div className="flex gap-2">
                                  <Input
                                    className="h-8 text-sm"
                                    placeholder="Enter team name"
                                    value={currentNames.B}
                                    onChange={(e) =>
                                      setTeamNames(prev => ({
                                        ...prev,
                                        [court.id]: { ...prev[court.id], B: e.target.value }
                                      }))
                                    }
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const teamB = teams.B.map(p => p.name).join(", ");
                                      setTeamNames(prev => ({
                                        ...prev,
                                        [court.id]: { ...prev[court.id], B: teamB }
                                      }));
                                    }}
                                  >
                                    Use Players
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </DndContext>
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
