import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import React, { type ReactNode } from "react";

interface MatchCardPanelProps {
  id: string;
  title: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

const MatchCardPanel: React.FC<MatchCardPanelProps> = ({ id, title, children, className, disabled = false }) => {
  const { isOver, setNodeRef } = useDroppable({ 
    id: disabled ? `disabled-${id}` : id,
    disabled: disabled 
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border bg-[#645A57] transition overflow-hidden",
        isOver ? "bg-muted/40 ring-1 ring-primary/30" : "",
        className
      )}
    >
      {/* increased min height so images are taller */}
      <div className="flex h-full min-h-[200px] gap-2 ">
        {children ?? (
          <div className="grid place-items-center w-full">
            <p className="text-xs text-muted-foreground">Drag players here</p>
          </div>
        )}
      </div>

      <div className="bg-black h-8 flex items-center justify-center">
        <p className="text-white text-center">{title}</p>
      </div>
    </div>
  );
};

export default MatchCardPanel;
