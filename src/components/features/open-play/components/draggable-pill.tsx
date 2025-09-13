import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useDraggable } from "@dnd-kit/core";
import React from "react";
import type { Participant } from "../types";
import { getStatusString } from "../types";
import { Trophy, Clock } from "lucide-react";

interface DraggablePillProps {
  participant: Participant;
  queuePosition?: number;
  showQueueInfo?: boolean;
}

const DraggablePill: React.FC<DraggablePillProps> = ({ 
  participant, 
  queuePosition, 
  showQueueInfo = false 
}) => {
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
      className="rounded-lg border relative bg-card p-3 flex items-center gap-3 hover:shadow-sm transition"
    >
      {/* Queue Position Badge */}
      {showQueueInfo && queuePosition && (
        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold absolute top-0 -left-2 transform -translate-y-1/2">
          {queuePosition}
        </div>
      )}
      
      <Avatar className="h-20 w-20 flex-shrink-0">
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
        
        {/* Games Played and Queue Info */}
        {showQueueInfo && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{participant.gamesPlayed ?? 0} games</span>
            </div>
            {participant.readyTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(participant.readyTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggablePill;
