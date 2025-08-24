/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import {
  Calendar as RBCalendar,
  dateFnsLocalizer,
  Views,
  type Event as RBCEvent,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { DayPicker } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import PlayerStatusPanel, {
  type PlayerItem,
} from "@/components/player-status-panel";
import "react-day-picker/dist/style.css";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Filter,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { MiniMonth } from "./mini-booking";

// ---------------- Types & data ----------------
interface BookingEvent {
  id: string;
  title: string;
  description: string;
  type: "One-time" | "Tournament" | "Recurring" | "Open Play";
  location: string;
  available: number;
  start: Date;
  end: Date;
  players?: PlayerItem[];
}

const locales = {} as any;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const initial: BookingEvent[] = [
  {
    id: "b1",
    title: "Meeting With Team Dev",
    description: "Sprint sync",
    type: "Recurring",
    location: "Room A",
    available: 8,
    start: addDays(new Date(), 0),
    end: addDays(new Date(), 0),
    players: [{ id: "u1", name: "Alice", status: "In-Game" }],
  },
  {
    id: "b2",
    title: "Design System",
    description: "UI kit review",
    type: "Open Play",
    location: "Room B",
    available: 4,
    start: addDays(new Date(), 1),
    end: addDays(new Date(), 1),
    players: [{ id: "u3", name: "Chris", status: "In-Game" }],
  },
  {
    id: "b3",
    title: "Data Update",
    description: "Ops window",
    type: "Tournament",
    location: "Ops",
    available: 12,
    start: addDays(new Date(), 3),
    end: addDays(new Date(), 3),
    players: [],
  },
  {
    id: "b4",
    title: "UI/UX Team Call",
    description: "Quarterly",
    type: "One-time",
    location: "Meet",
    available: 6,
    start: addDays(new Date(), 5),
    end: addDays(new Date(), 5),
  },
];

const colorForType: Record<BookingEvent["type"], string> = {
  "One-time": "#ef4444", // red
  Tournament: "#a78bfa", // violet (pale in UI)
  Recurring: "#f59e0b", // amber
  "Open Play": "#93c5fd", // light blue
};

const typePastel: Record<BookingEvent["type"], { bg: string; border: string }> =
  {
    "One-time": {
      bg: "rgba(239,68,68,.12)",
      border: "1px solid rgba(239,68,68,.35)",
    },
    Tournament: {
      bg: "rgba(167,139,250,.14)",
      border: "1px solid rgba(167,139,250,.40)",
    },
    Recurring: {
      bg: "rgba(245,158,11,.14)",
      border: "1px solid rgba(245,158,11,.40)",
    },
    "Open Play": {
      bg: "rgba(147,197,253,.24)",
      border: "1px solid rgba(147,197,253,.50)",
    },
  };

const allTypes: BookingEvent["type"][] = [
  "One-time",
  "Tournament",
  "Recurring",
  "Open Play",
];

// ---------------- Component ----------------
const BookingsCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<BookingEvent[]>(initial);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"All" | BookingEvent["type"]>("All");
  const [selected, setSelected] = useState<BookingEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", players: 1 });
  const [openPlayers, setOpenPlayers] = useState(false);
  const [notice, setNotice] = useState<string>("");

  const [typeFilters, setTypeFilters] = useState<
    Record<BookingEvent["type"], boolean>
  >({
    "One-time": true,
    Tournament: true,
    Recurring: true,
    "Open Play": true,
  });

  // control calendar date + view for toolbar + mini-month
  const [calDate, setCalDate] = useState<Date>(new Date());
  const [calView, setCalView] = useState<string>(Views.MONTH);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (type !== "All" && e.type !== type) return false;
      if (!typeFilters[e.type]) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          ![e.title, e.description, e.location, e.type].some((v) =>
            v.toLowerCase().includes(q)
          )
        )
          return false;
      }
      return true;
    });
  }, [events, type, typeFilters, query]);

  const rbcEvents: RBCEvent[] = useMemo(
    () =>
      filtered.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        resource: e,
      })),
    [filtered]
  );

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => e.start >= new Date())
        .sort((a, b) => +a.start - +b.start)
        .slice(0, 3),
    [events]
  );

  function openBooking(ev: BookingEvent) {
    setSelected(ev);
    setForm({ name: "", email: "", players: 1 });
    setOpen(true);
  }

  function saveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.players <= 0)
      return alert("Fill all required fields");
    alert(`Booked ${selected?.title} for ${form.name}`);
    setOpen(false);
  }

  function requestChange(playerId: string, to: PlayerItem["status"]) {
    if (!selected) return;
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== selected.id) return ev;
        return {
          ...ev,
          players: (ev.players ?? []).map((p) =>
            p.id === playerId ? { ...p, status: to } : p
          ),
        };
      })
    );
    setNotice(`Request sent: set to ${to}`);
  }

  // ---------- Custom Toolbar to match screenshot ----------
  const CustomToolbar: React.FC<any> = (props) => {
    const { label, onNavigate, onView, view, date } = props;
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border-b">
        {/* Left: nav */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold mr-2">Calendar</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onNavigate("TODAY")}
            className="gap-1"
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onNavigate("PREV")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onNavigate("NEXT")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold ml-2">{label}</span>
        </div>

        {/* Right: view tabs + date range + tools + create */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border bg-background p-0.5">
            {[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
              <button
                key={v}
                onClick={() => {
                  onView(v);
                  setCalView(v);
                }}
                className={`h-8 px-3 text-sm rounded-[6px] ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {v === Views.MONTH
                  ? "Month"
                  : v === Views.WEEK
                  ? "Week"
                  : "Day"}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Input
                className="h-8 pl-8 w-[210px]"
                defaultValue={`${format(date, "MM/dd/yyyy")} - ${format(
                  date,
                  "MM/dd/yyyy"
                )}`}
              />
              <CalendarDays className="absolute left-2 top-1.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Button size="icon" variant="outline" title="Reports">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" title="Filters">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </div>
    );
  };

  const EventContent: React.FC<{ event: RBCEvent }> = ({ event }) => {
    const data = (event as any).resource as BookingEvent;
    const dot = colorForType[data.type];
    return (
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: dot }}
        />
        <span className="text-xs font-medium truncate">{data.title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top search + type filter (kept minimal to match screenshot density) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            className="w-64"
            placeholder="Search events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="All">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar (left card) */}
        <aside className="rounded-xl border bg-card p-3 h-fit">
          {/* Mini month */}
        <MiniMonth value={calDate} onChange={(d) => setCalDate(d)} />


          {/* Categories */}
          <p className="text-sm font-semibold">Event</p>
          <p className="text-xs text-muted-foreground mb-2">
            Drag and drop your event or click in the calendar
          </p>
          <div className="space-y-2 mb-4">
            {allTypes.map((t) => (
              <label
                key={t}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: colorForType[t] }}
                  />
                  <span className="text-sm">{t}</span>
                </span>
                <input
                  type="checkbox"
                  checked={typeFilters[t]}
                  onChange={(e) =>
                    setTypeFilters((p) => ({ ...p, [t]: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
              </label>
            ))}
          </div>

          {/* Upcoming */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Upcoming Event</p>
              <span className="inline-flex h-5 items-center rounded-full bg-emerald-100 px-2 text-xs font-medium text-emerald-700">
                {events.length}
              </span>
            </div>
            <div className="space-y-2">
              {upcoming.map((e) => (
                <div key={e.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-1.5 rounded-full"
                      style={{ backgroundColor: colorForType[e.type] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(e.start, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo / upgrade */}
          <div className="mt-4 rounded-lg overflow-hidden border">
            <div className="p-4 bg-gradient-to-br from-orange-600 to-fuchsia-700 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center">
                  ⚠️
                </div>
                <p className="font-semibold">
                  Enjoy Unlimited Access on a small price monthly.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-white/90"
              >
                Upgrade Now →
              </Button>
            </div>
          </div>
        </aside>

        {/* Calendar (right card) */}
        <div className="lg:col-span-3 rounded-xl border bg-card relative">
          <RBCalendar
            localizer={localizer}
            events={rbcEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 720 }}
            popup
            components={{ toolbar: CustomToolbar, event: EventContent }}
            date={calDate}
            view={calView as any}
            onNavigate={(d: any) => setCalDate(d)}
            onView={(v: any) => setCalView(v)}
            onSelectEvent={(event: RBCEvent) =>
              openBooking((event as any).resource as BookingEvent)
            }
            eventPropGetter={(event: RBCEvent) => {
              const data = (event as any).resource as BookingEvent;
              const pastel = typePastel[data.type];
              return {
                style: {
                  backgroundColor: pastel.bg,
                  border: pastel.border,
                  color: "inherit",
                  borderRadius: 8,
                },
              };
            }}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          />
        </div>
      </div>

      {/* Booking sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Book Event</SheetTitle>
          </SheetHeader>
          <form onSubmit={saveBooking} className="p-4 space-y-4">
            {selected && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">{selected.title}</p>
                <p className="text-muted-foreground">
                  {format(selected.start, "PP")} • {selected.location}
                </p>
                <p className="text-muted-foreground">
                  Available: {selected.available}
                </p>
              </div>
            )}
            <label className="space-y-1 block">
              <span className="text-sm">Name</span>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm">Email</span>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm">Players</span>
              <Input
                type="number"
                min={1}
                value={form.players}
                onChange={(e) =>
                  setForm((p) => ({ ...p, players: Number(e.target.value) }))
                }
                required
              />
            </label>
            <SheetFooter>
              <div className="flex gap-2">
                <Button type="submit">Confirm Booking</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <PlayerStatusPanel
        open={openPlayers}
        onOpenChange={setOpenPlayers}
        title={`Players${selected ? ` • ${selected.title}` : ""}`}
        players={selected?.players ?? []}
        notice={notice}
        onRequestChange={(pid, to) => requestChange(pid, to)}
      />
    </div>
  );
};

export default BookingsCalendarPage;
