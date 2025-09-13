import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { Participant } from "../types";
import { getStatusString } from "../types";

const DraggablePill: React.FC<{ participant: Participant }> = ({ participant }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `p-${participant.id}`,
    data: { participant },
  });

  const style = {
    opacity: isDragging ? 0.65 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as React.CSSProperties;
  console.log('draggable pill', participant);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-lg border bg-card p-3 flex items-center gap-3 hover:shadow-sm transition"
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={participant.avatar || '/default_avatar.png'} />
      </Avatar>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{participant?.name}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {getStatusString(participant.playerStatus?.description ?? participant.status)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {participant.skillLevel ?? participant.level ?? 'No Skill'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default DraggablePill;
