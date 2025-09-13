/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { CourtCanvas } from "@/components/features/open-play/components/court-canvas";
import CourtMatchmakingCard from "@/components/features/open-play/components/court-matching-card";
import DroppablePanel from "@/components/features/open-play/components/draggable-panel";
import DraggablePill from "@/components/features/open-play/components/draggable-pill";
import AddCourtModal from "@/components/features/open-play/AddCourtModal";
import type { Court, Match, Participant } from "@/components/features/open-play/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Users } from "lucide-react";

interface GameManagementTabProps {
  participants: Participant[];
  courts: Court[];
  courtTeams: Record<string, { A: Participant[]; B: Participant[] }>;
  matches: Match[];
  scoreEntry: Record<string, string>;
  showWinnerDialog: string | null;
  teamNames: Record<string, { A: string; B: string }>;
  readyList: Participant[];
  restingList: Participant[];
  reserveList: Participant[];
  waitlistList: Participant[];
  availableCourts: Court[];
  onDragEnd: (e: DragEndEvent) => Promise<void>;
  onAddCourt: (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchName: string;
  }) => Promise<void>;
  onRenameCourt: (courtId: string) => void;
  onToggleCourtOpen: (courtId: string) => void;
  onStartGame: (courtId: string) => Promise<void>;
  onEndGame: (courtId: string) => void;
  onConfirmGameEnd: (courtId: string, winner: "A" | "B", score?: string) => Promise<void>;
  onMatchMakeCourt: (courtId: string) => Promise<void>;
  onViewMatchupScreen: (courtId: string) => void;
  onSetResult: (matchId: string, winner: "A" | "B") => void;
  onSetScoreEntry: (matchId: string, score: string) => void;
  onSetTeamNames: (courtId: string, team: "A" | "B", name: string) => void;
  onSetShowWinnerDialog: (courtId: string | null) => void;
  canStartGame: (courtId: string) => boolean;
  canEndGame: (courtId: string) => boolean;
  canCloseCourt: (courtId: string) => boolean;
  isCreatingGameMatch?: boolean;
  isAddingPlayersToMatch?: Set<string>;
  isLoadingGameMatches?: boolean;
  isStartingGame?: Set<string>;
  isEndingGame?: Set<string>;
}

const GameManagementTab: React.FC<GameManagementTabProps> = ({
  courts,
  courtTeams,
  matches,
  scoreEntry,
  showWinnerDialog,
  teamNames,
  readyList,
  restingList,
  reserveList,
  waitlistList,
  availableCourts,
  onDragEnd,
  onAddCourt,
  onRenameCourt,
  onToggleCourtOpen,
  onStartGame,
  onEndGame,
  onConfirmGameEnd,
  onMatchMakeCourt,
  onViewMatchupScreen,
  onSetResult,
  onSetScoreEntry,
  onSetShowWinnerDialog,
  canStartGame,
  canEndGame,
  canCloseCourt,
  isCreatingGameMatch = false,
  isAddingPlayersToMatch = new Set(),
  isLoadingGameMatches = false,
  isStartingGame = new Set(),
  isEndingGame = new Set(),
}) => {
  console.log(courtTeams)
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  return (
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
                title="Ready"
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
                title="Resting"
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
                title="Reserve"
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
                title="Waitlist"
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
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddCourtModal(true)}
                      disabled={isCreatingGameMatch}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreatingGameMatch ? 'Creating...' : 'Add Court'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Open matchup screen with the first court, or any available court
                        const firstCourt = courts[0];
                        if (firstCourt) {
                          onViewMatchupScreen(firstCourt.id);
                        } else {
                          alert("No courts available to display");
                        }
                      }}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Play Screen
                    </Button>
                    </div>
                    {courts.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {courts.length} court{courts.length !== 1 ? 's' : ''} loaded • {courts.filter(c => {
                          const teams = courtTeams[c.id] ?? { A: [], B: [] };
                          return teams.A.length > 0 || teams.B.length > 0;
                        }).length} with players
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Court canvas */}
              <CourtCanvas>
                {isLoadingGameMatches ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Game Matches</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      Fetching existing game matches for this occurrence...
                    </p>
                  </div>
                ) : courts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courts Added Yet</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      Get started by adding your first court match. You'll be able to select a court, 
                      name the teams, and set up the match details.
                    </p>
                    <Button onClick={() => setShowAddCourtModal(true)} className="bg-primary text-white hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Court
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courts.map((c,idx) => {
                      const teams = courtTeams[c.id] ?? { A: [], B: [] };
                      const perTeam = Math.floor(c.capacity / 2);

                      return (
                        <div key={idx}>
                          <div className="p-2">
                            <CourtMatchmakingCard
                              court={c}
                              teamA={teams.A}
                              teamB={teams.B}
                              capacity={c.capacity}
                              onStart={() => onStartGame(c.id)}
                              onEnd={() => onEndGame(c.id)}
                              onRename={() => onRenameCourt(c.id)}
                              onToggleOpen={() => onToggleCourtOpen(c.id)}
                              onRandomPick={() => onMatchMakeCourt(c.id)}
                              canStartGame={canStartGame(c.id)}
                              isStartingGame={isStartingGame.has(c.id)}
                              isEndingGame={isEndingGame.has(c.id)}
                              canEndGame={canEndGame(c.id)}
                              canCloseCourt={canCloseCourt(c.id)}
                              isAddingPlayers={isAddingPlayersToMatch.size > 0}
                            />
                            <div className="flex flex-col items-center gap-2 mt-2">
                              <p className="text-[11px] text-muted-foreground text-center">
                                Team size: {perTeam} • Drag players onto A/B or use "Matchmake This Court"
                              </p>
                              {teams.A.length === 0 && teams.B.length === 0 && (
                                <p className="text-[10px] text-orange-600 text-center">
                                  No players assigned yet
                                </p>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewMatchupScreen(c.id)}
                                className="text-xs h-7 px-3 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                Play Screen
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                              onChange={(e) => onSetScoreEntry(m.id, e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => onSetResult(m.id, "A")}>
                                Set A Win
                              </Button>
                              <Button size="sm" onClick={() => onSetResult(m.id, "B")}>
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
                          onClick={() => onConfirmGameEnd(showWinnerDialog, "A")}
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
                          onClick={() => onConfirmGameEnd(showWinnerDialog, "B")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Team B Wins
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => onSetShowWinnerDialog(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Add Court Modal */}
      <AddCourtModal
        open={showAddCourtModal}
        onClose={() => setShowAddCourtModal(false)}
        onAddCourt={onAddCourt}
        availableCourts={availableCourts}
      />
    </DndContext>
  );
};

export default GameManagementTab;
