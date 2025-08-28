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
      className="relative m-0 flex-1 flex h-full"
    >
      <img
        className="h-24 w-24 object-fill"
        src={
          participant.avatar ??
          "https://tse3.mm.bing.net/th/id/OIP.Cgu701azNx8XXf5cSrAnyAHaHa?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"
        }
        alt={participant.name}
      />

      {/* bottom overlay */}
      <div className="w-full inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/70 via-black/25 to-transparent">
        <p className="text-white text-xs font-semibold truncate">{participant.name}</p>
        {!!(participant as any).level && (
          <p className="text-white/80 text-[10px] leading-none truncate">
            {(participant as any).level}
          </p>
        )}
      </div>

      {/* subtle inner ring */}
    </div>
  );
};

export default MatchDraggablePill;
