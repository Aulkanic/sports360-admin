/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { CourtCanvas } from "@/components/features/open-play/components/court-canvas";
import CourtMatchmakingCard from "@/components/features/open-play/components/court-matching-card";
import DroppablePanel from "@/components/features/open-play/components/draggable-panel";
import DraggablePill from "@/components/features/open-play/components/draggable-pill";
import AddCourtModal from "@/components/features/open-play/AddCourtModal";
import RemovePlayerDialog from "@/components/features/open-play/components/RemovePlayerDialog";
import type { Court, Match, Participant, Level } from "@/components/features/open-play/types";
import { getSkillLevel, getSkillLevelAsLevel } from "@/components/features/open-play/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Users, Filter, Search, X, Star } from "lucide-react";
import { useCourts } from "@/hooks";

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
  gameMatches?: any[]; // Add game matches from API
  onDragEnd: (e: DragEndEvent) => Promise<void>;
  onAddCourt: (data: {
    courtId: string;
    team1Name: string;
    team2Name: string;
    matchDuration: number;
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
  onRemovePlayer?: (participant: Participant, team: 'A' | 'B', courtId: string) => Promise<void>;
  isRemovingPlayer?: boolean;
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
  gameMatches = [],
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
  isAddingPlayersToMatch = new Set(),
  isStartingGame = new Set(),
  isEndingGame = new Set(),
  onRemovePlayer,
  isRemovingPlayer = false,
}) => {
  console.log(courtTeams)
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | undefined>(undefined);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<Level | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Remove player dialog state
  const [showRemovePlayerDialog, setShowRemovePlayerDialog] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{
    participant: Participant;
    team: 'A' | 'B';
    courtId: string;
  } | null>(null);
  
  // Get all courts from the court management system
  const { items: allCourts, isLoading: isLoadingAllCourts } = useCourts();

  // Handle remove player
  const handleRemovePlayer = (participant: Participant, team: 'A' | 'B', courtId: string) => {
    setPlayerToRemove({ participant, team, courtId });
    setShowRemovePlayerDialog(true);
  };

  // Confirm remove player
  const handleConfirmRemovePlayer = async () => {
    if (!playerToRemove || !onRemovePlayer) return;
    
    try {
      await onRemovePlayer(playerToRemove.participant, playerToRemove.team, playerToRemove.courtId);
      setShowRemovePlayerDialog(false);
      setPlayerToRemove(null);
    } catch (error) {
      console.error('Error removing player:', error);
      // Keep dialog open on error
    }
  };

  // Cancel remove player
  const handleCancelRemovePlayer = () => {
    setShowRemovePlayerDialog(false);
    setPlayerToRemove(null);
  };

  // Helper function to check if a court has any active matches
  const courtHasActiveMatch = (courtId: string): boolean => {
    const hasActive = gameMatches.some(match => 
      match.courtId === courtId && 
      match.matchStatusId && 
      match.matchStatusId !== 10 // Assuming 10 is COMPLETED status
    );
    console.log('🔍 courtHasActiveMatch for court', courtId, ':', {
      gameMatches: gameMatches.length,
      hasActive,
      matches: gameMatches.filter(m => m.courtId === courtId)
    });
    return hasActive;
  };

  // Filter ready list by skill level and search query
  const filteredReadyList = useMemo(() => {
    let filtered = readyList;

    console.log('🔍 SKILL LEVEL FILTER DEBUG:', {
      selectedSkillLevel,
      totalReadyList: readyList.length,
      readyListSkillLevels: readyList.map(p => ({
        name: p.name,
        skillLevel: getSkillLevel(p),
        skillLevelAsLevel: getSkillLevelAsLevel(p)
      }))
    });

    // Filter by skill level
    if (selectedSkillLevel !== "All") {
      filtered = filtered.filter(participant => {
        const skillLevel = getSkillLevel(participant).toUpperCase();
        const matches = skillLevel === selectedSkillLevel.toUpperCase();
        console.log(`🔍 FILTERING: ${participant.name} - ${skillLevel} vs ${selectedSkillLevel.toUpperCase()} = ${matches}`);
        return matches;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(participant => {
        const name = participant.name?.toLowerCase() || '';
        const email = participant.user?.email?.toLowerCase() || '';
        const firstName = participant.user?.personalInfo?.firstName?.toLowerCase() || '';
        const lastName = participant.user?.personalInfo?.lastName?.toLowerCase() || '';
        
        return name.includes(query) || 
               email.includes(query) || 
               firstName.includes(query) || 
               lastName.includes(query) ||
               `${firstName} ${lastName}`.trim().includes(query);
      });
    }

    return filtered;
  }, [readyList, selectedSkillLevel, searchQuery]);

  // Create ready list with queue positions and priority info
  const readyListWithQueuePositions = useMemo(() => {
    return filteredReadyList.map((participant, index) => ({
      ...participant,
      queuePosition: index + 1,
      hasPriority: !!participant.updatedPlayerStatusAt,
      priorityTime: participant.updatedPlayerStatusAt ? new Date(participant.updatedPlayerStatusAt) : null
    }));
  }, [filteredReadyList]);

  // Get available skill levels from ready list
  const availableSkillLevels = useMemo(() => {
    const levels = new Set<Level>();
    readyList.forEach(participant => {
      const skillLevel = getSkillLevelAsLevel(participant);
      levels.add(skillLevel);
    });
    return Array.from(levels).sort();
  }, [readyList]);

  // Merge all courts with existing game courts
  const displayCourts = useMemo(() => {
    // Convert all courts to the format expected by the game management
    const convertedAllCourts = allCourts.map(court => ({
      id: court.id,
      name: court.name,
      capacity: court.capacity || 4,
      status: "Open" as const,
      location: court.location,
      hourlyRate: court.hourlyRate,
      images: court.images?.filter((img): img is string => typeof img === 'string'),
      // Add any other properties needed for display
    }));

    // Create a map of existing game courts by ID
    const existingGameCourts = new Map(courts.map(court => [court.id, court]));
    
    // Merge: use existing game court data if available, otherwise use converted court data
    return convertedAllCourts.map(court => {
      const existingGameCourt = existingGameCourts.get(court.id);
      return existingGameCourt || court;
    });
  }, [allCourts, courts]);
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
                subtitle={`Players ready to play • ${readyListWithQueuePositions.filter(p => p.hasPriority).length} with priority`}
                childrenClassName="grid grid-cols-1"
              >
                {/* Priority Legend */}
                {readyListWithQueuePositions.some(p => p.hasPriority) && (
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-amber-800">
                      <Star className="h-3 w-3 text-amber-600" />
                      <span className="font-medium">Priority Queue Active</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Players with ⭐ are queued by priority based on when they became ready
                    </p>
                  </div>
                )}

                {/* Search and Filter Section */}
                <div className="mb-3 space-y-3 p-2 bg-gray-50 rounded-lg border">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Search players:</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-xs pr-8"
                      />
                      {searchQuery && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Skill Level Filter Tabs */}
                  {availableSkillLevels.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Filter by skill level:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant={selectedSkillLevel === "All" ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs font-medium"
                          onClick={() => {
                            console.log('🔍 FILTER CHANGED: Setting to All');
                            setSelectedSkillLevel("All");
                          }}
                        >
                          All ({readyList.length})
                        </Button>
                        {availableSkillLevels.map((level) => {
                          const count = readyList.filter(p => getSkillLevelAsLevel(p) === level).length;
                          const getVariant = (level: Level) => {
                            switch (level) {
                              case "Beginner": return selectedSkillLevel === level ? "default" : "outline";
                              case "Intermediate": return selectedSkillLevel === level ? "default" : "outline";
                              case "Advanced": return selectedSkillLevel === level ? "default" : "outline";
                              default: return "outline";
                            }
                          };
                          return (
                            <Button
                              key={level}
                              variant={getVariant(level)}
                              size="sm"
                              className="h-6 px-2 text-xs font-medium"
                              onClick={() => {
                                console.log(`🔍 FILTER CHANGED: Setting to ${level}`);
                                setSelectedSkillLevel(level);
                              }}
                            >
                              {level} ({count})
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {readyListWithQueuePositions.map((p) => (
                  <DraggablePill 
                    key={p.id} 
                    participant={p} 
                    queuePosition={p.queuePosition}
                    showQueueInfo={true}
                    hasPriority={p.hasPriority}
                    priorityTime={p.priorityTime}
                    isLoading={isAddingPlayersToMatch.has(p.id)}
                  />
                ))}
                {readyListWithQueuePositions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {searchQuery.trim() 
                      ? `No players found matching "${searchQuery}"`
                      : selectedSkillLevel === "All" 
                        ? "No players ready" 
                        : `No ${selectedSkillLevel.toLowerCase()} players ready`}
                  </p>
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
                  <DraggablePill 
                    key={p.id} 
                    participant={p} 
                    isLoading={isAddingPlayersToMatch.has(p.id)}
                  />
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
                  <DraggablePill 
                    key={p.id} 
                    participant={p} 
                    isLoading={isAddingPlayersToMatch.has(p.id)}
                  />
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
                  <DraggablePill 
                    key={p.id} 
                    participant={p} 
                    isLoading={isAddingPlayersToMatch.has(p.id)}
                  />
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
                      onClick={() => {
                        // Open matchup screen with the first court that has an active match
                        const courtWithMatch = courts.find(court => {
                          const hasMatch = courtTeams[court.id] && (courtTeams[court.id].A.length > 0 || courtTeams[court.id].B.length > 0);
                          return hasMatch;
                        });
                        
                        if (courtWithMatch) {
                          onViewMatchupScreen(courtWithMatch.id);
                        } else {
                          alert("No courts with active matches available to display");
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
                {isLoadingAllCourts ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Courts</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      Fetching all available courts...
                    </p>
                  </div>
                ) : displayCourts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courts Available</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      No courts are available for this session. Please check your court management settings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayCourts.map((court, idx) => {
                      console.log(court)
                      const teams = courtTeams[court.id] ?? { A: [], B: [] };
                      const perTeam = Math.floor(court.capacity / 2);
                      const hasMatch = teams.A.length > 0 || teams.B.length > 0;
                      const hasActiveMatch = courtHasActiveMatch(court.id);
                      console.log('🏟️ Court analysis for court', court.id, ':', {
                        teams,
                        perTeam,
                        hasMatch,
                        hasActiveMatch,
                        shouldShowCreateButton: !hasMatch && !hasActiveMatch
                      });
                      return (
                        <div key={idx}>
                          <div className="p-2">
                     <CourtMatchmakingCard
                       court={court}
                       teamA={teams.A}
                       teamB={teams.B}
                       capacity={court.capacity}
                       onStart={() => onStartGame(court.id)}
                       onEnd={() => onEndGame(court.id)}
                       onRename={() => onRenameCourt(court.id)}
                       onToggleOpen={() => onToggleCourtOpen(court.id)}
                       onRandomPick={() => onMatchMakeCourt(court.id)}
                       onCreateMatch={() => {
                         console.log('🎯 CREATE MATCH BUTTON CLICKED for court:', court);
                         console.log('🎯 Court ID type:', typeof court.id, 'Value:', court.id);
                         console.log('🎯 Setting selectedCourt:', court);
                         console.log('🎯 Setting showAddCourtModal to true');
                         setSelectedCourt(court);
                         setShowAddCourtModal(true);
                         console.log('🎯 Modal state should be updated');
                       }}
                       canStartGame={canStartGame(court.id)}
                       isStartingGame={isStartingGame.has(court.id)}
                       isEndingGame={isEndingGame.has(court.id)}
                       canEndGame={canEndGame(court.id)}
                       canCloseCourt={canCloseCourt(court.id)}
                       isAddingPlayers={isAddingPlayersToMatch.size > 0}
                       hasMatch={hasMatch}
                       hasActiveMatch={hasActiveMatch}
                       onRemovePlayer={(participant, team) => handleRemovePlayer(participant, team, court.id)}
                       showRemoveButtons={hasMatch || hasActiveMatch}
                     />
                            <div className="flex flex-col items-center gap-2 mt-2">
                              <p className="text-[11px] text-muted-foreground text-center">
                                Team size: {perTeam} • {(hasMatch || hasActiveMatch) ? 'Drag players onto A/B or use "Matchmake This Court"' : 'Create a match first to drag players'}
                              </p>
                              {hasMatch && (
                                <>
                                  <p className="text-[10px] text-green-600 text-center">
                                    Active match with {teams.A.length + teams.B.length} players
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewMatchupScreen(court.id)}
                                    className="text-xs h-7 px-3 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                                  >
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Play Screen
                                  </Button>
                                </>
                              )}
                              {!hasMatch && hasActiveMatch && (
                                <>
                                  <p className="text-[10px] text-blue-600 text-center">
                                    Match exists - waiting for players
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewMatchupScreen(court.id)}
                                    className="text-xs h-7 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                  >
                                    <Trophy className="h-3 w-3 mr-1" />
                                    View Match
                                  </Button>
                                </>
                              )}
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
        onClose={() => {
          console.log('🚪 MODAL CLOSING');
          setShowAddCourtModal(false);
          setSelectedCourt(undefined);
        }}
        onAddCourt={onAddCourt}
        selectedCourt={selectedCourt}
      />
      
      {/* Remove Player Dialog */}
      <RemovePlayerDialog
        isOpen={showRemovePlayerDialog}
        onClose={handleCancelRemovePlayer}
        onConfirm={handleConfirmRemovePlayer}
        participant={playerToRemove?.participant || null}
        team={playerToRemove?.team || null}
        isLoading={isRemovingPlayer}
      />
    </DndContext>
  );
};

export default GameManagementTab;
