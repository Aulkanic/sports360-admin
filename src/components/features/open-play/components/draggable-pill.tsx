import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Participant } from "../types";
import { initials } from "../utils";
import { cn } from "@/lib/utils";

const DraggablePill: React.FC<{ participant: Participant }> = ({ participant }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `p-${participant.id}`,
    data: { participant },
  });

  const style = {
    opacity: isDragging ? 0.65 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as React.CSSProperties;

  const statusColor =
    participant.status === "In-Game"
      ? "bg-emerald-500"
      : participant.status === "Ready"
      ? "bg-blue-500"
      : participant.status === "Resting"
      ? "bg-amber-500"
      : "bg-muted-foreground";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "group rounded-lg border bg-card px-2 py-2 flex items-center gap-3 hover:shadow-sm transition",
        isDragging ? "ring-2 ring-primary/40" : ""
      )}
      role="listitem"
      aria-roledescription="Draggable player"
      aria-label={participant.name}
    >
      <div
        className="grid place-items-center text-muted-foreground/70 hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-hidden
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="opacity-70">
          <circle cx="5" cy="6" r="1.5" />
          <circle cx="5" cy="10" r="1.5" />
          <circle cx="5" cy="14" r="1.5" />
          <circle cx="11" cy="6" r="1.5" />
          <circle cx="11" cy="10" r="1.5" />
          <circle cx="11" cy="14" r="1.5" />
        </svg>
      </div>
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={participant.avatarUrl} />
          <AvatarFallback>{initials(participant.name)}</AvatarFallback>
        </Avatar>
        <span className={cn("absolute -right-0 -bottom-0 h-2.5 w-2.5 rounded-full ring-2 ring-card", statusColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{participant.name}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{participant.status}</Badge>
          <Badge variant="outline" className="text-[10px]">{participant.level}</Badge>
        </div>
      </div>
    </div>
  );
};

export default DraggablePill;
