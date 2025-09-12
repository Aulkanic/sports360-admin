/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { Participant } from "../types";

const MatchDraggablePill: React.FC<{ participant: Participant }> = ({ participant }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `p-${participant.id}`,
    data: { participant },
  });

  const style = {
    opacity: isDragging ? 0.7 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative m-0 flex-1 flex h-full bg-white/10 backdrop-blur-[1px] border border-white/20 rounded-lg overflow-hidden"
    >
      <img
        className="h-24 w-24 object-cover"
        src={
          participant.avatar ??
          "/default_avatar.png"
        }
        alt={`${participant.user?.personalInfo?.firstName} ${participant.user?.personalInfo?.lastName}`}
      />

      {/* bottom overlay */}
      <div className=" w-full bottom-0 px-2 py-1 bg-gradient-to-t from-black/70 via-black/25 to-transparent">
        <p className="text-white text-md font-semibold truncate">{participant.user?.personalInfo?.firstName} {participant.user?.personalInfo?.lastName}</p>
        {!!(participant as any).level && (
          <p className="text-white/80 text-[10px] leading-none truncate">
            {participant.skillLevel ?? 'No Skill'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchDraggablePill;
