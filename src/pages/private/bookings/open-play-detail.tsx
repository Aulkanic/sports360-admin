/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from "react";

import AddPlayerModal from "@/components/features/open-play/AddPlayerModal";
import DetailsParticipantsTab from "@/components/features/open-play/DetailsParticipantsTab";
import GameManagementTab from "@/components/features/open-play/GameManagementTab";

import { useOpenPlayDetail } from "@/hooks/useOpenPlayDetail";
import { useGameManagement } from "@/hooks/useGameManagement";
import { useParticipantManagement } from "@/hooks/useParticipantManagement";
import { useGameMatches } from "@/hooks/useGameMatches";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { urls } from "@/routes";

import {
  Clock,
  MapPin,
} from "lucide-react";


const OpenPlayDetailPage: React.FC = () => {
  // Main hook for page state and logic
  const {
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
    deepClone,
    refreshSessionData,
    getUserAvatarUrl,
    setParticipants,
    
    // Refs
    hasFetchedGameMatches,
    
    // Navigation
    navigate,
  } = useOpenPlayDetail();

  // Create a ref to store the fetchGameMatches function
  const fetchGameMatchesRef = useRef<(() => Promise<void>) | null>(null);
  
  // Create a ref to track if we've fetched game matches for the current tab
  const hasFetchedForGameTab = useRef(false);

  // Game management hook
  const gameManagement = useGameManagement({
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
    fetchGameMatches: async () => {
      if (fetchGameMatchesRef.current) {
        await fetchGameMatchesRef.current();
      }
    },
    showWinnerDialog,
    setShowWinnerDialog,
  });

  // Game matches hook
  const { fetchGameMatches } = useGameMatches({
    currentOccurrenceId: currentOccurrenceId || undefined,
    occurrence,
    isDummySession,
    setGameMatches,
    setMatches,
    setCourtTeams,
    setTeamNames,
    setCourts,
    setIsLoadingGameMatches,
    isLoadingGameMatches,
    convertGameMatchToMatch: gameManagement.convertGameMatchToMatch,
    convertGameMatchToCourtTeams: gameManagement.convertGameMatchToCourtTeams,
    availableCourts,
    getUserAvatarUrl,
  });

  // Update the ref with the actual fetchGameMatches function
  useEffect(() => {
    fetchGameMatchesRef.current = fetchGameMatches;
  }, [fetchGameMatches]);

  // Participant management hook
  const participantManagement = useParticipantManagement({
    currentOccurrenceId,
    occurrence,
    isDummySession,
    refreshSessionData,
    isUpdatingStatus,
    setIsUpdatingStatus,
    isRemovingPlayer,
    isAddingPlayer,
    setIsAddingPlayer,
    addPlayerOpen,
    setAddPlayerOpen,
  });

  // Effects
  useEffect(() => {
    if (occurrence?.id && !hasFetchedGameMatches.current) {
      hasFetchedGameMatches.current = true;
      setCourts([]);
      setCourtTeams({});
      setTeamNames({});
      setMatches([]);
      if (fetchGameMatchesRef.current) {
        fetchGameMatchesRef.current();
      }
    }
  }, [occurrence?.id]);

  // Fetch game matches when game management tab is accessed
  useEffect(() => {
    if (tab === "game") {
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      
      if (occurrenceId && !hasFetchedForGameTab.current && fetchGameMatchesRef.current) {
        hasFetchedForGameTab.current = true;
        fetchGameMatchesRef.current();
      }
    } else {
      // Reset the flag when switching away from game tab
      hasFetchedForGameTab.current = false;
    }
  }, [tab, occurrence?.id, currentOccurrenceId]);

  if (!session) {
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
                  hasFetchedForGameTab.current = false;
                  setCourts([]);
                  setCourtTeams({});
                  setTeamNames({});
                  setMatches([]);
                  if (fetchGameMatchesRef.current) {
                    fetchGameMatchesRef.current();
                  }
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
          onUpdateStatus={participantManagement.updateStatus}
          onRemoveFromAllTeams={(participantId: string) => {
            setCourtTeams((prev) => {
              const next = { ...prev };
              for (const cid of Object.keys(next)) {
                next[cid] = {
                  A: next[cid].A.filter((p) => p.id !== participantId),
                  B: next[cid].B.filter((p) => p.id !== participantId)
                };
              }
              return next;
            });
          }}
          onApproveWaitlistParticipant={participantManagement.approveWaitlistParticipant}
          onRejectWaitlistParticipant={participantManagement.rejectWaitlistParticipant}
          onAddPlayer={participantManagement.handleAddPlayer}
          onPlayerAddSuccess={participantManagement.handlePlayerAddSuccess}
          onPlayerAddError={participantManagement.handlePlayerAddError}
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
          scoreEntry={gameManagement.scoreEntry}
          showWinnerDialog={showWinnerDialog}
          teamNames={teamNames}
          readyList={readyList}
          restingList={restingList}
          reserveList={reserveList}
          waitlistList={waitlistList}
          gameMatches={gameMatches}
          courtInfoList={courtInfoList}
          onDragEnd={(e) => gameManagement.onDragEnd(e, participantManagement.updateStatus)}
          onAddCourt={gameManagement.addCourt}
          isCreatingGameMatch={isCreatingGameMatch}
          isAddingPlayersToMatch={isAddingPlayersToMatch}
          isStartingGame={isStartingGame}
          isEndingGame={isEndingGame}
          onRenameCourt={gameManagement.renameCourt}
          onToggleCourtOpen={gameManagement.toggleCourtOpen}
          onStartGame={gameManagement.startGame}
          onEndGame={gameManagement.endGame}
          onConfirmGameEnd={gameManagement.confirmGameEnd}
          onMatchMakeCourt={gameManagement.matchMakeCourt}
          onViewMatchupScreen={(courtId) => gameManagement.viewMatchupScreen(courtId, session)}
          onSetResult={gameManagement.setResult}
          onSetScoreEntry={gameManagement.setScoreEntry}
          onSetTeamNames={gameManagement.setTeamNamesForCourt}
          onSetShowWinnerDialog={setShowWinnerDialog}
          canStartGame={gameManagement.canStartGame}
          canEndGame={gameManagement.canEndGame}
          canCloseCourt={gameManagement.canCloseCourt}
          isLoadingGameMatches={isLoadingGameMatches}
          onRemovePlayer={gameManagement.handleRemovePlayer}
          isRemovingPlayer={isRemovingPlayer}
        />
      )}


      {/* Add Player Modal */}
      <AddPlayerModal
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        sessionTitle={session.sessionName || session.title}
        onAddPlayer={participantManagement.handleAddPlayer}
        onSuccess={participantManagement.handlePlayerAddSuccess}
        onError={participantManagement.handlePlayerAddError}
        isLoading={isAddingPlayer}
      />
    </div>
  );
};

export default OpenPlayDetailPage;
