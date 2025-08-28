import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { Participant } from "../types";

const MatchDraggablePill: React.FC<{ participant: Participant }> = ({
  participant,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `p-${participant.id}`,
      data: { participant },
    });

  const style = {
    opacity: isDragging ? 0.65 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="border relative h-full m-0 flex-1 transition"
    >
      <img src={participant.avatarUrl ?? "https://tse3.mm.bing.net/th/id/OIP.Cgu701azNx8XXf5cSrAnyAHaHa?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"} />
      
    </div>
  );
};

export default MatchDraggablePill;
