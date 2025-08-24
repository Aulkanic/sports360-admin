import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { urls } from "@/routes";
import { Users, Dumbbell, Ticket, CalendarDays, Clock } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Calendar
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar";
import type { Event as RBCEvent } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  setHours,
  setMinutes,
} from "date-fns";
import { enUS } from "date-fns/locale/en-US";

// ---------- Types ----------
type EventType = "Event" | "Activity" | "Tournament";
type EventStatus = "Active" | "Upcoming" | "Completed";

type DashboardEvent = RBCEvent & {
  id: string;
  type: EventType;
  status: EventStatus;
  href?: string;
};

// ---------- Localizer ----------
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ---------- Component ----------
const SuperAdminDashboardPage: React.FC = () => {
  const metrics = useMemo(
    () => ({
      members: 202,
      sports: 12,
      plans: 5,
      events: 18,
      bookingsPending: 7,
    }),
    []
  );

  const recentEvents = [
    { id: "e1", name: "Weekly Tennis", date: "Today 6:00 PM", type: "Recurring", status: "Active" },
    { id: "e2", name: "Basketball 3v3", date: "Sat 10:00 AM", type: "Tournament", status: "Upcoming" },
  ];

  const recentBookings = [
    { id: "bk1", title: "Open Play", who: "Alice", when: "Today 7:00 PM", status: "Pending" },
    { id: "bk2", title: "Basketball Tournament", who: "Team X", when: "Sat 10:00 AM", status: "Approved" },
  ];

  const membersTrend = useMemo(
    () => [
      { month: "Jan", members: 120 },
      { month: "Feb", members: 140 },
      { month: "Mar", members: 155 },
      { month: "Apr", members: 170 },
      { month: "May", members: 188 },
      { month: "Jun", members: 202 },
    ],
    []
  );

  const bookingsBySport = [
    { sport: "Tennis", bookings: 42 },
    { sport: "Basketball", bookings: 58 },
    { sport: "Soccer", bookings: 36 },
    { sport: "Badminton", bookings: 24 },
  ];

  // ---------- Calendar dummy events ----------
  const calendarEvents = useMemo<DashboardEvent[]>(() => {
    const now = new Date();
    const day = (offset: number, hStart: number, mStart: number, hEnd: number, mEnd: number) => {
      const start = setMinutes(setHours(addDays(now, offset), hStart), mStart);
      const end = setMinutes(setHours(addDays(now, offset), hEnd), mEnd);
      return { start, end };
    };

    return [
      {
        id: "ev1",
        title: "Open Play – Tennis",
        ...day(0, 18, 0, 20, 0),
        type: "Activity",
        status: "Active",
        href: urls.events,
      },
      {
        id: "ev2",
        title: "Basketball 3v3 Qualifiers",
        ...day(2, 10, 0, 12, 0),
        type: "Tournament",
        status: "Upcoming",
        href: urls.events,
      },
      {
        id: "ev3",
        title: "Weekly Tennis (Recurring)",
        ...day(3, 18, 0, 20, 0),
        type: "Event",
        status: "Upcoming",
        href: urls.events,
      },
      {
        id: "ev4",
        title: "Badminton Social Night",
        ...day(5, 19, 30, 21, 0),
        type: "Activity",
        status: "Upcoming",
        href: urls.events,
      },
      {
        id: "ev5",
        title: "Tennis Ladder Finals",
        ...day(8, 14, 0, 17, 0),
        type: "Tournament",
        status: "Upcoming",
        href: urls.events,
      },
      {
        id: "ev6",
        title: "Coach Clinic: Footwork & Agility",
        ...day(-2, 16, 0, 17, 30),
        type: "Event",
        status: "Completed",
        href: urls.events,
      },
    ];
  }, []);

  // Coloring per type + status (kept inline styles to avoid CSS overrides)
  const eventPropGetter = (event: RBCEvent) => {
    const e = event as DashboardEvent;

    let bg = "rgba(234,88,12,.15)"; // default orange
    let border = "1px solid rgba(234,88,12,.35)";

    if (e.type === "Tournament") {
      bg = "rgba(59,130,246,.15)"; // blue
      border = "1px solid rgba(59,130,246,.35)";
    } else if (e.type === "Activity") {
      bg = "rgba(16,185,129,.15)"; // emerald
      border = "1px solid rgba(16,185,129,.35)";
    }

    let stripe = "inset 3px 0 0 0 rgba(148,163,184,.9)"; // slate
    if (e.status === "Active") stripe = "inset 3px 0 0 0 rgba(16,185,129,.9)";
    if (e.status === "Upcoming") stripe = "inset 3px 0 0 0 rgba(59,130,246,.9)";
    if (e.status === "Completed") stripe = "inset 3px 0 0 0 rgba(148,163,184,.9)";

    return {
      style: {
        backgroundColor: bg,
        border,
        boxShadow: stripe,
        color: "hsl(var(--foreground, 222.2 47.4% 11.2%))",
        borderRadius: 8,
      },
    };
  };

  // Simple event content component (TS-safe props)
  const EventContent: React.FC<{ event: RBCEvent }> = ({ event }) => {
    const e = event as DashboardEvent;
    const pill =
      e.type === "Tournament"
        ? "bg-blue-600"
        : e.type === "Activity"
        ? "bg-emerald-600"
        : "bg-orange-600";
    return (
      <div className="flex items-center gap-2 pr-1">
        <span className={`inline-block h-2 w-2 rounded-full ${pill}`} />
        <span className="font-medium">{e.title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

     {/* Summary Cards */}
<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  {[
    {
      key: "members",
      label: "Members",
      value: metrics.members,
      Icon: Users,
      accent: "bg-emerald-50 text-emerald-600 ring-emerald-200",
      ring: "from-emerald-400/40 to-emerald-500/40",
    },
    {
      key: "sports",
      label: "Sports",
      value: metrics.sports,
      Icon: Dumbbell,
      accent: "bg-sky-50 text-sky-600 ring-sky-200",
      ring: "from-sky-400/40 to-sky-500/40",
    },
    {
      key: "plans",
      label: "Plans",
      value: metrics.plans,
      Icon: Ticket,
      accent: "bg-violet-50 text-violet-600 ring-violet-200",
      ring: "from-violet-400/40 to-violet-500/40",
    },
    {
      key: "events",
      label: "Events",
      value: metrics.events,
      Icon: CalendarDays,
      accent: "bg-amber-50 text-amber-600 ring-amber-200",
      ring: "from-amber-400/40 to-amber-500/40",
    },
    {
      key: "bookingsPending",
      label: "Pending Bookings",
      value: metrics.bookingsPending,
      Icon: Clock,
      accent: "bg-rose-50 text-rose-600 ring-rose-200",
      ring: "from-rose-400/40 to-rose-500/40",
    },
  ].map(({ key, label, value, Icon, accent, ring }) => (
    <div key={key} className="group relative rounded-xl">
      {/* gradient ring */}
      <div className={`pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r ${ring} opacity-60`} />
      <div className="relative rounded-xl bg-card border p-4 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ring-1 ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
          {/* subtle “live” dot for attention */}
          {key === "bookingsPending" && value > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  ))}
</div>


      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-lg bg-card border">
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="text-sm font-semibold">Members Growth</h2>
            <Badge variant="outline">Last 6 months</Badge>
          </div>
          <div className="p-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membersTrend} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="members" stroke="#16a34a" strokeWidth={2} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg bg-card border">
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="text-sm font-semibold">Bookings by Sport</h2>
            <Badge variant="outline">This month</Badge>
          </div>
          <div className="p-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsBySport} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sport" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg bg-card border">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold">Calendar</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600" /> Activity
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Tournament
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-600" /> Event
            </span>
          </div>
        </div>
        <div className="p-3">
          <div className="h-[720px] rounded-md overflow-hidden border bg-background">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              views={["month", "week", "day", "agenda"]}
              defaultView={"month"}
              popup
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              eventPropGetter={eventPropGetter}
              components={{
                event: (props: { event: RBCEvent }) => <EventContent event={props.event} />,
              }}
              onSelectEvent={(ev: RBCEvent) => {
                const e = ev as DashboardEvent;
                if (e.href) window.open(e.href, "_blank");
              }}
              tooltipAccessor={(ev: RBCEvent) => {
                const e = ev as DashboardEvent;
                return `${e.title} • ${e.type} • ${e.status}`;
              }}
              dayLayoutAlgorithm="no-overlap"
            />
          </div>
        </div>
      </div>

      {/* Recent & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg bg-card border">
            <div className="flex items-center justify-between p-3 border-b">
              <h2 className="text-sm font-semibold">Recent Events</h2>
              <Button asChild size="sm" variant="outline">
                <Link to={urls.events}>View All</Link>
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {recentEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-muted-foreground">
                      {e.date} • {e.type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      e.status === "Active" ? "success" : e.status === "Upcoming" ? "warning" : "muted"
                    }
                  >
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-card border">
            <div className="flex items-center justify-between p-3 border-b">
              <h2 className="text-sm font-semibold">Recent Bookings</h2>
              <Button asChild size="sm" variant="outline">
                <Link to={urls.bookingsAdmin}>Manage</Link>
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.title}</p>
                    <p className="text-muted-foreground">
                      {b.who} • {b.when}
                    </p>
                  </div>
                  <Badge
                    variant={
                      b.status === "Approved" ? "success" : b.status === "Pending" ? "warning" : "muted"
                    }
                  >
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Button asChild>
          <Link to={urls.members}>Go to Members</Link>
        </Button>
        <Button asChild>
          <Link to={urls.sports}>Manage Sports</Link>
        </Button>
        <Button asChild>
          <Link to={urls.plans}>Membership Plans</Link>
        </Button>
        <Button asChild>
          <Link to={urls.events}>Events &amp; Calendar</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
