import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Court, Participant } from "../types";
import DroppablePanel from "./draggable-panel";
import DraggablePill from "./draggable-pill";

const CourtMatchmakingCard: React.FC<{
  court: Court;
  teamA: Participant[];
  teamB: Participant[];
  capacity: number;
  onStart: () => void;
  onEnd: () => void;
  onRename: () => void;
  onToggleOpen: () => void;
}> = ({ court, teamA, teamB, capacity, onStart, onEnd, onRename, onToggleOpen }) => {
  const perTeam = Math.floor(capacity / 2);

  return (
    <div className="rounded-2xl border p-0 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <p className="font-semibold uppercase tracking-wide">{court.name}</p>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {court.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-0 p-3 md:p-4">
        <DroppablePanel
          id={`${court.id}:A`}
          title={`Team A (${teamA.length}/${perTeam})`}
          subtitle="Drop players here"
        >
          {teamA.map((p) => <DraggablePill key={p.id} participant={p} />)}
        </DroppablePanel>

        <div className="flex items-center justify-center">
          <div className="grid place-items-center rounded-xl bg-black text-white px-3 py-2 text-sm font-extrabold">VS</div>
        </div>

        <DroppablePanel
          id={`${court.id}:B`}
          title={`Team B (${teamB.length}/${perTeam})`}
          subtitle="Drop players here"
        >
          {teamB.map((p) => <DraggablePill key={p.id} participant={p} />)}
        </DroppablePanel>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
        <Button size="sm" variant="outline" onClick={onRename}>Rename Court</Button>
        <Button size="sm" variant="outline" onClick={onToggleOpen}>
          {court.status === "Closed" ? "Reopen Court" : "Close Court"}
        </Button>
        <Button size="sm" variant="outline" onClick={onEnd}>End Game</Button>
        <Button size="sm" onClick={onStart}>Start Game</Button>
      </div>
    </div>
  );
};

export default CourtMatchmakingCard;
