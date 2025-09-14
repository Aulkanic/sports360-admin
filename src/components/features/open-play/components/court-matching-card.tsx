import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import type { Court, Participant } from "../types";
import MatchCardPanel from "./match-card-panel";
import MatchCardPlayer from "./match-card-player";

const CourtMatchmakingCard: React.FC<{
  court: Court;
  teamA: Participant[];
  teamB: Participant[];
  capacity: number;
  onStart: () => void;
  onEnd: () => void;
  onRename: () => void;
  onToggleOpen: () => void;
  onRandomPick: () => void;
  canStartGame: boolean;
  canEndGame: boolean;
  canCloseCourt: boolean;
  isAddingPlayers?: boolean;
  isStartingGame?: boolean;
  isEndingGame?: boolean;
  hasMatch?: boolean;
  hasActiveMatch?: boolean; // Add this prop
}> = ({ court, teamA, teamB, capacity, onStart, onEnd, onToggleOpen, onRandomPick, canStartGame, canEndGame, canCloseCourt, isAddingPlayers = false, isStartingGame = false, isEndingGame = false, hasMatch = false, hasActiveMatch = false }) => {
  const perTeam = Math.floor(capacity / 2);
  const totalLen = 54;
  const nvz = 7;
  const nvzPct = (nvz / totalLen) * 100;
  const midPct = 50;
  const upperNVZ = midPct - nvzPct;
  const lowerNVZ = midPct + nvzPct;

  return (
    <div className="rounded-2xl border p-0 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center gap-2">
          <p className="font-semibold uppercase tracking-wide">{court.name}</p>
          {court.status === "Open" && !canStartGame && (
            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
              Need 4 players
            </span>
          )}
          {court.status === "Open" && canStartGame && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              Ready to start
            </span>
          )}
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {court.status}
        </Badge>
      </div>

      <div className="relative p-3 bg-[#B85537]">
        <div
          className="relative"
          style={{
            aspectRatio: "11 / 5",
            minHeight: 40,                 // ⬅️ taller drawing
            background: "#ffffff",
          }}
        >
          <div className="absolute inset-2 rounded-sm bg-white pointer-events-none" />
          <div
            className="absolute left-2 right-2 bg-black z-4"
            style={{ top: `${midPct}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-[#B8ADA9] pointer-events-none"
            style={{ top: `${upperNVZ}%`, height: `${nvzPct * 2}%` }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${upperNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white"
            style={{ top: `${lowerNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute bg-white z-8"
            style={{ left: "50%", width: 2, top: "8px", bottom: `${100 - upperNVZ}%`, transform: "translateX(-1px)" }}
          />
          <div
            className="absolute bg-white z-8"
            style={{ left: "50%", width: 2, top: `${lowerNVZ}%`, bottom: "8px", transform: "translateX(-1px)" }}
          />

          <div
            className="absolute grid place-items-center z-6 bg-black text-white px-8 py-2 text-sm font-extrabold"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            VS
          </div>

          {/* overlays keep same geometry, panels are now taller via min-h */}
          <div className="absolute" style={{ left: "12px", right: "12px", top: "12px", bottom: `${100 - upperNVZ + 4}%` }}>
            <MatchCardPanel
              id={(hasMatch || hasActiveMatch) ? `${court.id}:A` : `disabled:${court.id}:A`}
              title={`Team A (${teamA.length}/${perTeam})`}
              className={`h-full backdrop-blur-[1px] border-white/40 ${!(hasMatch || hasActiveMatch) ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={!(hasMatch || hasActiveMatch)}
            >
              {teamA.map((p) => <MatchCardPlayer key={p.id} participant={p} />)}
            </MatchCardPanel>
          </div>

          <div className="absolute" style={{ left: "12px", right: "12px", top: `${lowerNVZ + 4}%`, bottom: "12px" }}>
            <MatchCardPanel
              id={(hasMatch || hasActiveMatch) ? `${court.id}:B` : `disabled:${court.id}:B`}
              title={`Team B (${teamB.length}/${perTeam})`}
              className={`h-full backdrop-blur-[1px] border-white/40 ${!(hasMatch || hasActiveMatch) ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={!(hasMatch || hasActiveMatch)}
            >
              {teamB.map((p) => <MatchCardPlayer key={p.id} participant={p} />)}
            </MatchCardPanel>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-3">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRandomPick}
          disabled={court.status !== "Open" || isAddingPlayers}
          title={court.status !== "Open" ? "Court must be open to random pick players" : isAddingPlayers ? "Adding players to match..." : "Randomly pick players for this court"}
        >
          {isAddingPlayers ? "Adding Players..." : "Random Pick"}
        </Button>
        <Button 
          size="sm" 
          onClick={onStart}
          disabled={!canStartGame || isStartingGame}
          title={!canStartGame ? "Need exactly 4 players to start game" : isStartingGame ? "Starting game..." : "Start the game"}
        >
          {isStartingGame ? "Starting..." : "Start Game"}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onEnd}
          disabled={!canEndGame || isEndingGame}
          title={!canEndGame ? "Game must be in progress to end" : isEndingGame ? "Ending game..." : "End the game and select winner"}
        >
          {isEndingGame ? "Ending..." : "End Game"}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onToggleOpen}
          disabled={!canCloseCourt}
          title={!canCloseCourt ? "Cannot close court while game is in progress" : court.status === "Closed" ? "Reopen Court" : "Close Court"}
        >
          {court.status === "Closed" ? "Reopen Court" : "Close Court"}
        </Button>
      </div>
    </div>
  );
};

export default CourtMatchmakingCard;

