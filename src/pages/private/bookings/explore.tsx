import React, { useMemo, useState } from "react";
import { CalendarRange, Clock, MapPin, Users, Trophy, Repeat as RepeatIcon, Ticket, Landmark } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Level = "Beginner" | "Intermediate" | "Advanced";

type OpenPlay = {
  id: string;
  title: string;
  when: string;
  location: string;
  level: Level[];
  joined: number;
  capacity: number;
  price: "Free" | "$" | "$$";
  organizer: { name: string; avatar: string };
};

type Tournament = {
  id: string;
  title: string;
  dateRange: string;
  format: "Single Elimination" | "Round Robin";
  categories: Array<"Singles" | "Doubles" | "Mixed">;
  entry: "Free" | "$" | "$$";
  registered: number;
  capacity: number;
};

type Recurring = {
  id: string;
  title: string;
  pattern: string;
  start: string;
  end: string;
  time: string;
  location: string;
  capacity: number;
  pricing: string; // per session / bundle
};

type OneTime = {
  id: string;
  title: string;
  when: string;
  location: string;
  description: string;
  price: "Free" | "$" | "$$";
  slots: number;
  organizer: string;
};

type CourtRental = {
  id: string;
  courtType: "Pickleball" | "Badminton" | "Tennis";
  courtName: string;
  date: string;
  times: Array<{ time: string; available: boolean; rate: string; capacity: number }>;
};

const OpenPlayTab: React.FC = () => {
  const [query, setQuery] = useState("");
  const list = useMemo<OpenPlay[]>(
    () => [
      { id: "op1", title: "Pickleball Social Night", when: "Fri 7:00 PM", location: "Court A", level: ["Beginner", "Intermediate"], joined: 12, capacity: 16, price: "Free", organizer: { name: "Alex", avatar: "https://i.pravatar.cc/80?img=12" } },
      { id: "op2", title: "Tennis Open Rally", when: "Sat 9:00 AM", location: "Court 3", level: ["Intermediate", "Advanced"], joined: 8, capacity: 12, price: "$", organizer: { name: "Sam", avatar: "https://i.pravatar.cc/80?img=22" } },
    ],
    []
  );
  const filtered = useMemo(() => list.filter(e => e.title.toLowerCase().includes(query.toLowerCase())), [list, query]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="h-8 w-8 rounded-md" />
          <div>
            <h2 className="text-xl font-semibold">Join Open Play</h2>
            <p className="text-sm text-muted-foreground">Play, meet, and have fun with the community</p>
          </div>
        </div>
        <Input className="w-64" placeholder="Search open play" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((e) => {
          const pct = Math.min(100, Math.round((e.joined / e.capacity) * 100));
          return (
            <div key={e.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{e.title}</p>
                  <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><Clock className="h-3.5 w-3.5" /> {e.when}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                    {e.level.map((l) => (<Badge key={l} variant="outline">{l}</Badge>))}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={e.price === "Free" ? "success" : "secondary"}>{e.price}</Badge>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: pct + "%" }} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {e.joined}/{e.capacity} joined</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <Avatar className="h-7 w-7"><AvatarImage src={e.organizer.avatar} /></Avatar>
                  <span className="text-xs">{e.organizer.name}</span>
                </div>
                <Button>Join Now</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TournamentTab: React.FC = () => {
  const list = useMemo<Tournament[]>(() => ([
    { id: "t1", title: "City Championship 3v3", dateRange: "Aug 28 – Sep 1", format: "Single Elimination", categories: ["Singles", "Doubles"], entry: "$", registered: 24, capacity: 32 },
    { id: "t2", title: "Autumn Round Robin", dateRange: "Sep 15 – Sep 17", format: "Round Robin", categories: ["Mixed"], entry: "Free", registered: 12, capacity: 16 },
  ]), []);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-600" />
        <div>
          <h2 className="text-xl font-semibold">Tournaments</h2>
          <p className="text-sm text-muted-foreground">Compete for glory and prizes</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow transition">
            <p className="text-sm font-semibold">{t.title}</p>
            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><CalendarRange className="h-3.5 w-3.5" /> {t.dateRange}</span>
              <Badge variant="outline">{t.format}</Badge>
              {t.categories.map((c) => (<Badge key={c} variant="secondary">{c}</Badge>))}
              <Badge variant={t.entry === "Free" ? "success" : "secondary"}>{t.entry}</Badge>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><Users className="h-3.5 w-3.5" /> {t.registered}/{t.capacity}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button>Register</Button>
              <Button variant="outline">View Bracket</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecurringTab: React.FC = () => {
  const list = useMemo<Recurring[]>(() => ([
    { id: "r1", title: "Weekly Pickleball Mondays", pattern: "Every Monday", start: "Sep 2", end: "Nov 25", time: "7:00–9:00 PM", location: "Court B", capacity: 16, pricing: "$ per session" },
    { id: "r2", title: "Biweekly Tennis Drills", pattern: "Every 2 weeks", start: "Sep 10", end: "Dec 19", time: "6:00–8:00 PM", location: "Court 2", capacity: 12, pricing: "Bundle available" },
  ]), []);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RepeatIcon className="h-6 w-6 text-sky-600" />
        <div>
          <h2 className="text-xl font-semibold">Recurring Sessions</h2>
          <p className="text-sm text-muted-foreground">Join weekly or repeated sessions</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow transition">
            <p className="text-sm font-semibold">{s.title}</p>
            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <Badge variant="outline">{s.pattern}</Badge>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><CalendarRange className="h-3.5 w-3.5" /> {s.start} – {s.end}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><Clock className="h-3.5 w-3.5" /> {s.time}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><MapPin className="h-3.5 w-3.5" /> {s.location}</span>
              <Badge variant="secondary">Capacity {s.capacity}</Badge>
              <Badge variant="outline">{s.pricing}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button>Join One Session</Button>
              <Button variant="outline">Join All Sessions</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OneTimeTab: React.FC = () => {
  const list = useMemo<OneTime[]>(() => ([
    { id: "o1", title: "Pickleball Skills Clinic", when: "Sun, Sep 8 • 10:00 AM", location: "Court C", description: "One-time intensive skills clinic with coach.", price: "$", slots: 10, organizer: "Coach Kim" },
    { id: "o2", title: "Holiday Badminton Bash", when: "Dec 20 • 6:30 PM", location: "Court A", description: "Festive games and prizes for all levels.", price: "Free", slots: 24, organizer: "Club Staff" },
  ]), []);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ticket className="h-6 w-6 text-rose-600" />
        <div>
          <h2 className="text-xl font-semibold">Special Events</h2>
          <p className="text-sm text-muted-foreground">Can’t-miss one-offs and pop-ups</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((e) => (
          <div key={e.id} className="rounded-xl border bg-card p-0 shadow-sm overflow-hidden hover:shadow transition">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b p-3">
              <p className="text-sm font-semibold">{e.title}</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><Clock className="h-3.5 w-3.5" /> {e.when}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                <Badge variant={e.price === "Free" ? "success" : "secondary"}>{e.price}</Badge>
                <Badge variant="outline">Slots {e.slots}</Badge>
              </div>
              <p className="mt-2 text-sm">{e.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Organizer: {e.organizer}</span>
                <Button>Register / Join</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CourtRentalTab: React.FC = () => {
  const [type, setType] = useState<CourtRental["courtType"]>("Pickleball");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const slots = useMemo<CourtRental[]>(() => ([
    { id: "c1", courtType: "Pickleball", courtName: "Court 1", date, times: [ { time: "08:00", available: true, rate: "$15/hr", capacity: 4 }, { time: "09:00", available: false, rate: "$15/hr", capacity: 4 }, { time: "10:00", available: true, rate: "$15/hr", capacity: 4 } ] },
    { id: "c2", courtType: "Pickleball", courtName: "Court 2", date, times: [ { time: "08:00", available: true, rate: "$15/hr", capacity: 4 }, { time: "09:00", available: true, rate: "$15/hr", capacity: 4 }, { time: "10:00", available: false, rate: "$15/hr", capacity: 4 } ] },
  ]), [date]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-emerald-600" />
        <div>
          <h2 className="text-xl font-semibold">Book a Court</h2>
          <p className="text-sm text-muted-foreground">Select a court, date, and time slot</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
          {(["Pickleball", "Badminton", "Tennis"] as const).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.filter((s) => s.courtType === type).map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold">{s.courtName}</p>
              </div>
              <span className="text-xs text-muted-foreground">Players per court: {s.times[0]?.capacity ?? 4}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {s.times.map((t) => (
                <button key={t.time} disabled={!t.available} className={`h-9 rounded-md border text-sm ${t.available ? "bg-background hover:bg-muted" : "bg-muted/50 text-muted-foreground cursor-not-allowed"}`}>
                  {t.time}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs">Hourly Rate: {s.times[0]?.rate}</span>
              <Button>Book Now</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Tabs: React.FC<{ value: string; onValueChange: (v: string) => void; tabs: { key: string; label: string }[] }> = ({ value, onValueChange, tabs }) => {
  return (
    <div className="flex items-center gap-2 border-b">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onValueChange(t.key)}
          className={`h-10 px-3 text-sm -mb-px border-b-2 ${value === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

const BookingsExplorePage: React.FC = () => {
  const [tab, setTab] = useState("open-play");
  const tabs = [
    { key: "open-play", label: "Open Play" },
    { key: "tournament", label: "Tournament" },
    { key: "recurring", label: "Recurring" },
    { key: "one-time", label: "One-Time" },
    { key: "court-rental", label: "Court Rental" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Explore Activities</h1>
          <p className="text-sm text-muted-foreground">Find the right way to play</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} tabs={tabs} />

      {tab === "open-play" && <OpenPlayTab />}
      {tab === "tournament" && <TournamentTab />}
      {tab === "recurring" && <RecurringTab />}
      {tab === "one-time" && <OneTimeTab />}
      {tab === "court-rental" && <CourtRentalTab />}
    </div>
  );
};

export default BookingsExplorePage;

