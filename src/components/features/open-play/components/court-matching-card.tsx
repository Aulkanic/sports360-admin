import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import type { Court, Participant } from "../types";
import MatchCardPanel from "./match-card-panel";
import MatchDraggablePill from "./match-card-pill";

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
}> = ({ court, teamA, teamB, capacity, onStart, onEnd, onToggleOpen, onRandomPick }) => {
  const perTeam = Math.floor(capacity / 2);
  const totalLen = 44;
  const nvz = 7;
  const nvzPct = (nvz / totalLen) * 100;
  const midPct = 50;
  const upperNVZ = midPct - nvzPct;
  const lowerNVZ = midPct + nvzPct;

  return (
    <div className="rounded-2xl border p-0 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <p className="font-semibold uppercase tracking-wide">{court.name}</p>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {court.status}
        </Badge>
      </div>

      <div className="relative">
        <div
          className="relative"
          style={{
            aspectRatio: "11 / 5",
            minHeight: 40,                 // ⬅️ taller drawing
            background: "#137a46",
          }}
        >
          <div className="absolute inset-2 rounded-sm border-2 border-white/70 pointer-events-none" />
          <div
            className="absolute left-2 right-2 bg-white/90"
            style={{ top: `${midPct}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white/12 pointer-events-none"
            style={{ top: `${upperNVZ}%`, height: `${nvzPct * 2}%` }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${upperNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${lowerNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute bg-white/75"
            style={{ left: "50%", width: 2, top: "8px", bottom: `${100 - upperNVZ}%`, transform: "translateX(-1px)" }}
          />
          <div
            className="absolute bg-white/75"
            style={{ left: "50%", width: 2, top: `${lowerNVZ}%`, bottom: "8px", transform: "translateX(-1px)" }}
          />

          <div
            className="absolute grid place-items-center rounded-xl bg-black text-white px-3 py-2 text-sm font-extrabold"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            VS
          </div>

          {/* overlays keep same geometry, panels are now taller via min-h */}
          <div className="absolute" style={{ left: "12px", right: "12px", top: "12px", bottom: `${100 - upperNVZ + 4}%` }}>
            <MatchCardPanel
              id={`${court.id}:A`}
              title={`Team A (${teamA.length}/${perTeam})`}
              className="h-full bg-white/10 backdrop-blur-[1px] border-white/40"
            >
              {teamA.map((p) => <MatchDraggablePill key={p.id} participant={p} />)}
            </MatchCardPanel>
          </div>

          <div className="absolute" style={{ left: "12px", right: "12px", top: `${lowerNVZ + 4}%`, bottom: "12px" }}>
            <MatchCardPanel
              id={`${court.id}:B`}
              title={`Team B (${teamB.length}/${perTeam})`}
              className="h-full bg-white/10 backdrop-blur-[1px] border-white/40"
            >
              {teamB.map((p) => <MatchDraggablePill key={p.id} participant={p} />)}
            </MatchCardPanel>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-3">
        <Button size="sm" variant="outline" onClick={onRandomPick}>Random Pick</Button>
        <Button size="sm" onClick={onStart}>Start Game</Button>
        <Button size="sm" variant="outline" onClick={onEnd}>End Game</Button>
        <Button size="sm" variant="outline" onClick={onToggleOpen}>
          {court.status === "Closed" ? "Reopen Court" : "Close Court"}
        </Button>
      </div>
    </div>
  );
};

export default CourtMatchmakingCard;

