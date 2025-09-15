/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { X } from "lucide-react";
import type { Participant } from "../types";

interface MatchCardPlayerProps {
  participant: Participant;
  onRemove?: (participant: Participant) => void;
  showRemoveButton?: boolean;
  isDraggable?: boolean;
}

const MatchCardPlayer: React.FC<MatchCardPlayerProps> = ({ 
  participant, 
  onRemove, 
  showRemoveButton = false,
  isDraggable = false 
}) => {
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(participant);
    }
  };

  return (
    <div className={`relative m-0 flex-1 flex h-full bg-[#645A57] backdrop-blur-[1px] border border-white/20 rounded-lg overflow-hidden group ${isDraggable ? 'cursor-move' : ''}`}>
      <img
        className="h-24 w-24 object-cover"
        src={
          participant.avatar ??
          "/default_avatar.png"
        }
        alt={`${participant.user?.personalInfo?.firstName} ${participant.user?.personalInfo?.lastName}`}
      />

      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <button
          onClick={handleRemove}
          className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Remove player from match"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* bottom overlay */}
      <div className=" w-full bottom-0 px-2 py-1 bg-gradient-to-t from-black/70 via-black/25 to-transparent">
        <p className="text-white text-md font-semibold truncate">{participant.user?.personalInfo?.firstName} {participant.user?.personalInfo?.lastName}</p>
        {!!participant.level && (
          <p className="text-white/80 text-[10px] leading-none truncate">
            {participant.level ?? 'No Skill'}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchCardPlayer;
