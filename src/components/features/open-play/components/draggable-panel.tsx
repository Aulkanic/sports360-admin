import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const DroppablePanel: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ id, title, subtitle, actions, footer, children }) => {
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
      <div className="space-y-2 min-h-[120px]" aria-live="polite">
        {itemsCount > 0 ? (
          children
        ) : (
          <div className={cn(
            "grid place-items-center rounded-md border p-3 text-xs text-muted-foreground",
            isOver ? "border-primary/40 text-foreground" : "border-dashed"
          )}>
            {isOver ? "Release to add" : "Drag players here"}
          </div>
        )}
      </div>
      {footer}
    </div>
  );
};

export default DroppablePanel;
