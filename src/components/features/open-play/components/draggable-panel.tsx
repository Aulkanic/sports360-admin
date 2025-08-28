import React, { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppablePanelProps {
  id: string;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children?: ReactNode;
  childrenClassName?: string; 
}

const DroppablePanel: React.FC<DroppablePanelProps> = ({
  id,
  title,
  subtitle,
  footer,
  children,
  childrenClassName = "grid grid-cols-2", 
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  const itemsCount = React.Children.toArray(children).length;

  return (
    <div
      ref={setNodeRef}
      aria-label={title}
      role="list"
      className={cn(
        "relative rounded-xl border p-3 bg-card shadow-sm transition",
        itemsCount === 0 ? "border-dashed" : "",
        isOver ? "bg-muted/40 ring-2 ring-primary/40" : ""
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-none flex items-center gap-2">
            <span>{title}</span>
            <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-muted px-1 text-[11px] text-muted-foreground">
              {itemsCount}
            </span>
          </p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className={cn("space-y-2 gap-3 min-h-[120px] cursor-pointer", childrenClassName)}>
        {children ?? (
          <p className="text-xs text-muted-foreground">Drag players here</p>
        )}
      </div>

      {footer}
    </div>
  );
};

export default DroppablePanel;
