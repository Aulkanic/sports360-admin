/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveOverlay from "@/components/responsive-overlay";
import PlayerStatusPanel, { type PlayerItem } from "@/components/player-status-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type LevelTag = "Beginner" | "Intermediate" | "Advanced";

type OpenPlaySession = {
  id: string;
  title: string;
  when: string;
  location: string;
  level: LevelTag[];
  participants: (PlayerItem & {
    avatar?: string;
    initials?: string;
    level?: LevelTag;
  })[];
};

const ppl = {
  alice: { name: "Alice Johnson", avatar: "https://static.vecteezy.com/system/resources/previews/016/295/960/non_2x/portrait-of-young-athletic-man-with-a-crossed-arms-photo.jpg", initials: "AJ", level: "Intermediate" as LevelTag },
  bob:   { name: "Bob Smith",     avatar: "https://i.pravatar.cc/100?img=2", initials: "BS", level: "Beginner" as LevelTag },
  carol: { name: "Carol Davis",   avatar: "https://i.pravatar.cc/100?img=3", initials: "CD", level: "Advanced" as LevelTag },
  david: { name: "David Lee",     avatar: "https://i.pravatar.cc/100?img=4", initials: "DL", level: "Intermediate" as LevelTag },
  ivy:   { name: "Ivy Turner",    avatar: "https://i.pravatar.cc/100?img=5", initials: "IT", level: "Beginner" as LevelTag },
  jack:  { name: "Jack Miller",   avatar: "https://i.pravatar.cc/100?img=6", initials: "JM", level: "Advanced" as LevelTag },
  kate:  { name: "Kate Alvarez",  avatar: "https://i.pravatar.cc/100?img=7", initials: "KA", level: "Intermediate" as LevelTag },
  liam:  { name: "Liam Chen",     avatar: "https://i.pravatar.cc/100?img=8", initials: "LC", level: "Intermediate" as LevelTag },
  mia:   { name: "Mia Patel",     avatar: "https://i.pravatar.cc/100?img=9", initials: "MP", level: "Beginner" as LevelTag },
  noah:  { name: "Noah Garcia",   avatar: "https://i.pravatar.cc/100?img=10", initials: "NG", level: "Advanced" as LevelTag },
  owen:  { name: "Owen Brooks",   avatar: "https://i.pravatar.cc/100?img=11", initials: "OB", level: "Intermediate" as LevelTag },
  pia:   { name: "Pia Ramos",     avatar: "https://i.pravatar.cc/100?img=12", initials: "PR", level: "Advanced" as LevelTag },
};

const initialSessions: OpenPlaySession[] = [
  {
    id: "op-1",
    title: "Pickleball Open Play",
    when: "Fri • 7:00–9:00 PM",
    location: "Court A",
    level: ["Beginner", "Intermediate"],
    participants: [
      { id: "u1", name: ppl.alice.name, status: "Resting", avatar: ppl.alice.avatar, initials: ppl.alice.initials, level: ppl.alice.level },
      { id: "u2", name: ppl.bob.name,   status: "Resting", avatar: ppl.bob.avatar,   initials: ppl.bob.initials,   level: ppl.bob.level },
      { id: "u3", name: ppl.carol.name, status: "Resting", avatar: ppl.carol.avatar, initials: ppl.carol.initials, level: ppl.carol.level },
      { id: "u4", name: ppl.david.name, status: "Resting", avatar: ppl.david.avatar, initials: ppl.david.initials, level: ppl.david.level },
      { id: "u5", name: ppl.kate.name,  status: "Resting", avatar: ppl.kate.avatar,  initials: ppl.kate.initials,  level: ppl.kate.level },
      { id: "u6", name: ppl.liam.name,  status: "Resting", avatar: ppl.liam.avatar,  initials: ppl.liam.initials,  level: ppl.liam.level },
    ],
  },
  {
    id: "op-2",
    title: "Tennis Rally Night",
    when: "Sat • 9:00–11:00 AM",
    location: "Court 3",
    level: ["Intermediate", "Advanced"],
    participants: [
      { id: "u7",  name: ppl.ivy.name,  status: "Resting", avatar: ppl.ivy.avatar,  initials: ppl.ivy.initials,  level: ppl.ivy.level },
      { id: "u8",  name: ppl.jack.name, status: "Resting", avatar: ppl.jack.avatar, initials: ppl.jack.initials, level: ppl.jack.level },
      { id: "u9",  name: ppl.mia.name,  status: "Resting", avatar: ppl.mia.avatar,  initials: ppl.mia.initials,  level: ppl.mia.level },
      { id: "u10", name: ppl.noah.name, status: "Resting", avatar: ppl.noah.avatar, initials: ppl.noah.initials, level: ppl.noah.level },
    ],
  },
  {
    id: "op-3",
    title: "Badminton Open Court",
    when: "Sun • 2:00–5:00 PM",
    location: "Hall B",
    level: ["Beginner", "Intermediate", "Advanced"],
    participants: [
      { id: "u11", name: ppl.owen.name, status: "Resting", avatar: ppl.owen.avatar, initials: ppl.owen.initials, level: ppl.owen.level },
      { id: "u12", name: ppl.pia.name,  status: "Resting", avatar: ppl.pia.avatar,  initials: ppl.pia.initials,  level: ppl.pia.level },
      { id: "u13", name: "Guest 1",     status: "Resting", avatar: "https://i.pravatar.cc/100?img=13", initials: "G1", level: "Beginner" },
      { id: "u14", name: "Guest 2",     status: "Resting", avatar: "https://i.pravatar.cc/100?img=14", initials: "G2", level: "Intermediate" },
      { id: "u15", name: "Guest 3",     status: "Resting", avatar: "https://i.pravatar.cc/100?img=15", initials: "G3", level: "Advanced" },
    ],
  },
];

const levelColor: Record<LevelTag, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

function AvatarsStrip({
  people,
  max = 3,
  size = 28,
}: {
  people: { avatar?: string; initials?: string; name: string }[];
  max?: number;
  size?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((p, i) => (
        <Avatar
          key={i}
          className="ring-2 ring-white shadow-sm"
          style={{ width: size, height: size }}
        >
          <AvatarImage src={p.avatar} alt={p.name} />
          <AvatarFallback className="text-[10px]">{p.initials ?? "?"}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="grid place-items-center rounded-full bg-muted text-muted-foreground ring-2 ring-white shadow-sm text-[10px] font-medium"
          style={{ width: size, height: size }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

const OpenPlayPage: React.FC = () => {
  const [sessions, setSessions] = useState<OpenPlaySession[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSessions[0]?.id ?? null
  );
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    levels: { Beginner: true, Intermediate: false, Advanced: false },
  });

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantsSessionId, setParticipantsSessionId] = useState<string | null>(null);

  function openParticipants(sessionId: string) {
    setParticipantsSessionId(sessionId);
    setParticipantsOpen(true);
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const levels = Object.entries(createForm.levels)
      .filter(([, v]) => v)
      .map(([k]) => k as LevelTag);
    if (!createForm.title.trim() || !createForm.date || !createForm.time || !createForm.location.trim() || levels.length === 0)
      return;

    const newSession: OpenPlaySession = {
      id: `op-${Date.now()}`,
      title: createForm.title.trim(),
      when: `${createForm.date} • ${createForm.time}`,
      location: createForm.location.trim(),
      level: levels,
      participants: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCreateOpen(false);
    setCreateForm({
      title: "",
      date: "",
      time: "",
      location: "",
      levels: { Beginner: true, Intermediate: false, Advanced: false },
    });
    setSelectedSessionId((id) => id ?? newSession.id);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Open Play</h1>
          <p className="text-sm text-muted-foreground">
            Create sessions and manage participants. Click a card to manage matches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)} className="shadow-sm">Create Open Play</Button>
        </div>
      </div>

      {/* Sessions grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {sessions.map((s) => {
          const topLevels = Array.from(new Set(s.participants.map((p) => p.level).filter(Boolean))) as LevelTag[];
          return (
            <div
              key={s.id}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all",
                "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40",
                selectedSessionId === s.id ? "ring-2 ring-primary/70" : ""
              )}
              onClick={() => navigate(`/open-play/${s.id}`, { state: { session: s } })}
              role="button"
            >
              {/* subtle gradient accent */}
              <div className="pointer-events-none absolute inset-x-0 -top-20 h-36 translate-y-0 bg-gradient-to-b from-primary/10 to-transparent" />

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{s.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5">{s.when}</span>
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5">{s.location}</span>
                    <Badge variant="outline" className="ml-1">{s.level.join(" / ")}</Badge>
                  </div>
                </div>
                <Badge className="whitespace-nowrap">Open Play</Badge>
              </div>

              {/* participants strip */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AvatarsStrip
                    people={s.participants.map((p) => ({ avatar: (p as any).avatar, initials: (p as any).initials, name: p.name }))}
                    max={3}
                    size={28}
                  />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{s.participants.length} / 10</span>{" "}
                    participants
                  </div>
                </div>
                {/* top skill signal (optional) */}
                {topLevels.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {topLevels.slice(0, 2).map((lvl) => (
                      <span
                        key={lvl}
                        className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                          levelColor[lvl]
                        )}
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:translate-y-[-1px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    openParticipants(s.id);
                  }}
                >
                  Participants
                </Button>
                <Button
                  size="sm"
                  className="hover:translate-y-[-1px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/open-play/${s.id}`, { state: { session: s } });
                  }}
                >
                  Manage
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Open Play overlay */}
      <ResponsiveOverlay
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Open Play"
        ariaLabel="Create Open Play"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="open-play-create-form">Create</Button>
          </div>
        }
      >
        <form id="open-play-create-form" onSubmit={handleCreateSubmit} className="space-y-3">
          <label className="space-y-1 block">
            <span className="text-sm">Title</span>
            <Input
              value={createForm.title}
              onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Pickleball Open Play"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 block">
              <span className="text-sm">Date</span>
              <Input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))}
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm">Time</span>
              <Input
                type="time"
                value={createForm.time}
                onChange={(e) => setCreateForm((p) => ({ ...p, time: e.target.value }))}
              />
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-sm">Court Location</span>
            <Input
              value={createForm.location}
              onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g., Court A"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm">Max Players</span>
            <Input
              value={createForm.location}
              onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
              
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm">Price</span>
            <Input
              value={createForm.location}
              onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
              
            />
          </label>
          <div className="space-y-1">
            <span className="text-sm">Levels</span>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {(["Beginner", "Intermediate", "Advanced"] as LevelTag[]).map((lvl) => (
                <label key={lvl} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(createForm.levels as any)[lvl]}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        levels: { ...p.levels, [lvl]: e.target.checked },
                      }))
                    }
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </ResponsiveOverlay>

      {/* Participants overlay */}
      <PlayerStatusPanel
        open={participantsOpen}
        onOpenChange={setParticipantsOpen}
        title="Participants"
        players={sessions.find((s) => s.id === participantsSessionId)?.participants ?? []}
        adminMode
        onToggleStatus={(playerId, to) => {
          if (!participantsSessionId) return;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === participantsSessionId
                ? {
                    ...s,
                    participants: s.participants.map((p) =>
                      p.id === playerId ? { ...p, status: to } : p
                    ),
                  }
                : s
            )
          );
        }}
        notice="Players shown here have joined this Open Play session."
      />
    </div>
  );
};

export default OpenPlayPage;
