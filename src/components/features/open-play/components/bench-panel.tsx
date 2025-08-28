import React, { type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

const slats =
  `repeating-linear-gradient(
      0deg,
      rgba(255,255,255,0.06) 0px,
      rgba(255,255,255,0.06) 18px,
      rgba(255,255,255,0.12) 18px,
      rgba(255,255,255,0.12) 20px
   )`;

const rail = `linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))`;

const BenchPanel: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children?: ReactNode;
}> = ({ id, title, subtitle, footer, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border p-0 overflow-hidden shadow-sm transition",
        "bg-[#0f172a]/60", // slate-900 with opacity
        isOver && "ring-1 ring-primary/30"
      )}
      style={{
        backgroundImage: `${slats}, ${rail}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "100% 100%, 100% 10px",
        backgroundRepeat: "repeat, no-repeat",
        backgroundPosition: "center, top",
      }}
    >
      <div className="px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white/90">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-white/60">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="px-2 pb-2">
        <div className="grid grid-cols-1 gap-2 min-h-[140px]">
          {children ?? (
            <p className="text-xs text-white/60 px-2 py-3">Drag players here</p>
          )}
        </div>
      </div>

      {footer}
    </div>
  );
};

export default BenchPanel;
