import React, { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface MatchCardPanelProps {
  id: string;
  title: string;
  children?: ReactNode;
  childrenClassName?: string; 
}

const MatchCardPanel: React.FC<MatchCardPanelProps> = ({
  id,
  title,
  children,
  childrenClassName = "flex", 
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border bg-card transition",
        isOver ? "bg-muted/40 ring-1 ring-primary/30" : ""
      )}
    >
    

      <div className={cn("space-y-2 gap-3 min-h-[120px] cursor-pointer", childrenClassName)}>
        {children ?? (
          <p className="text-xs text-muted-foreground">Drag players here</p>
        )}
      </div>

      <div className="bg-black h-8 flex items-center justify-center">
        <p className="text-white text-center">{title}</p>
      </div>
    </div>
  );
};

export default MatchCardPanel;
