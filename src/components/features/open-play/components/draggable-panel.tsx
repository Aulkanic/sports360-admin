import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const DroppablePanel: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ id, title, subtitle, footer, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border p-3 bg-card shadow-sm transition",
        isOver ? "bg-muted/40 ring-1 ring-primary/30" : ""
      )}
    >
      <div className="mb-2">
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-2 min-h-[120px]">
        {children}
        {!children && <p className="text-xs text-muted-foreground">Drag players here</p>}
      </div>
      {footer}
    </div>
  );
};

export default DroppablePanel;
