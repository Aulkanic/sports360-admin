import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { Participant } from "../types";
import { Badge } from "@/components/ui/badge";

const BenchPill: React.FC<{ participant: Participant }> = ({ participant }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bench-${participant.id}`,
    data: { participant },
  });

  const style = {
    opacity: isDragging ? 0.75 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-2 py-2 backdrop-blur-sm hover:bg-white/10 transition"
    >
      <img
        src={participant.avatar}
        alt={participant.name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/90 font-medium truncate">
          {participant.name}
        </p>
        <p className="text-[10px] text-white/60 truncate">{participant.level}</p>
      </div>
      <Badge variant="outline" className="h-5 text-[10px] px-2 text-white/90 border-white/25">
        {participant.status}
      </Badge>
    </div>
  );
};

export default BenchPill;
