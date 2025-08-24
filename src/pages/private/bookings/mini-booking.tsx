import React from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildMonthGrid(month: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1) {
  const firstOfMonth = startOfMonth(month);
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn }); // Mon-start
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)); // 6 rows
}

type MiniMonthProps = {
  value: Date;
  onChange: (d: Date) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
};

export const MiniMonth: React.FC<MiniMonthProps> = ({
  value,
  onChange,
  weekStartsOn = 1,
  className,
}) => {
  const [month, setMonth] = React.useState<Date>(startOfMonth(value));
  React.useEffect(() => setMonth(startOfMonth(value)), [value]);

  const days: Date[] = buildMonthGrid(month, weekStartsOn);
  const today = new Date();

  const dow = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(new Date(), { weekStartsOn }), i), "EEEEE")
  ); // Mo Tu We ...

  return (
    <div className={`rounded-lg border p-3 ${className ?? ""}`}>
      {/* Caption + nav */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{format(month, "LLLL yyyy")}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Previous month"
            type="button"
          >
            <ChevronLeft className="h-4 w-4 mx-auto" />
          </button>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Next month"
            type="button"
          >
            <ChevronRight className="h-4 w-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-[11px] text-muted-foreground mb-1">
        {dow.map((d) => (
          <div key={d} className="text-center font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 6x7 grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const outside = !isSameMonth(d, month);
          const selected = isSameDay(d, value);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onChange(d)}
              type="button"
              className={[
                "h-8 w-8 rounded-md inline-flex items-center justify-center text-sm transition",
                selected
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "hover:bg-muted",
                outside ? "text-muted-foreground/40" : "",
                !selected && isToday ? "ring-1 ring-orange-500/60" : "",
              ].join(" ")}
              aria-label={format(d, "PPPP")}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};
