import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Participant } from "../types";
import { initials } from "../utils";

const DraggablePill: React.FC<{ participant: Participant }> = ({ participant }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `p-${participant.id}`,
    data: { participant },
  });

  const style = {
    opacity: isDragging ? 0.65 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-lg border bg-card p-2 flex items-center gap-3 hover:shadow-sm transition"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={participant.avatarUrl} />
        <AvatarFallback>{initials(participant.name)}</AvatarFallback>
      </Avatar>
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
