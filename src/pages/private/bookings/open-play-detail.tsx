/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { urls } from "@/routes";
import { cn } from "@/lib/utils";
import CourtMatchmakingCard from "@/components/features/open-play/components/court-matching-card";
import DroppablePanel from "@/components/features/open-play/components/draggable-panel";
import DraggablePill from "@/components/features/open-play/components/draggable-pill";
import { SAMPLE_SESSIONS } from "@/components/features/open-play/data/sample-sessions";
import type { OpenPlaySession, Participant, Court, ParticipantStatus, Match } from "@/components/features/open-play/types";
import { buildBalancedTeams, initials } from "@/components/features/open-play/utils";

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-white border text-xs">
    {children}
  </span>
);

const OpenPlayDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation() as { state?: { session?: OpenPlaySession } };
  const [tab, setTab] = useState<"details" | "game">("game");

  const stateSession = location.state?.session as OpenPlaySession | undefined;
  const sessionById = useMemo(
    () => stateSession ?? SAMPLE_SESSIONS.find((s) => s.id === id),
    [stateSession, id]
  );
  const [participants, setParticipants] = useState<Participant[]>(
    () => (sessionById?.participants ?? []) as Participant[]
  );

  const [courts, setCourts] = useState<Court[]>([
    { id: "court-1", name: "Court 1", capacity: 4, status: "Open" },
  ]);

  const [courtTeams, setCourtTeams] = useState<
    Record<string, { A: Participant[]; B: Participant[] }>
  >({ "court-1": { A: [], B: [] } });

  const [matches, setMatches] = useState<Match[]>([]);
  const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});

  const inAnyTeam = useMemo(
    () => new Set(Object.values(courtTeams).flatMap((t) => [...t.A, ...t.B]).map((p) => p.id)),
    [courtTeams]
  );

  const readyList = useMemo(
    () => participants.filter((p) => p.status === "Ready" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const restingList = useMemo(
    () => participants.filter((p) => p.status === "Resting" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );
  const reserveList = useMemo(
    () => participants.filter((p) => p.status === "Reserve" && !inAnyTeam.has(p.id)),
    [participants, inAnyTeam]
  );

  const session = useMemo<OpenPlaySession | null>(() => {
    if (sessionById) return { ...sessionById, participants };
    return null;
  }, [sessionById, participants]);

  function updateStatus(participantId: string, status: ParticipantStatus) {
    setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, status } : p)));
  }

  function removeFromAllTeams(participantId: string) {
    setCourtTeams((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([cid, t]) => [
          cid,
          { A: t.A.filter((p) => p.id !== participantId), B: t.B.filter((p) => p.id !== participantId) },
        ])
      )
    );
  }

  function moveToCourtTeam(courtId: string, teamKey: "A" | "B", participant: Participant) {
    setCourtTeams((prev) => {
      const next: typeof prev = JSON.parse(JSON.stringify(prev));
      if (!next[courtId]) next[courtId] = { A: [], B: [] };
      for (const k of Object.keys(next) as (keyof typeof next)[]) {
        next[k].A = next[k].A.filter((p) => p.id !== participant.id);
        next[k].B = next[k].B.filter((p) => p.id !== participant.id);
      }
      const perTeam = Math.floor((courts.find((c) => c.id === courtId)?.capacity ?? 4) / 2);
      if (next[courtId][teamKey].length >= perTeam) return prev;
      next[courtId][teamKey].push({ ...participant, status: "In-Game" });
      return next;
    });
    updateStatus(participant.id, "In-Game");
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const participant = (active.data.current as any)?.participant as Participant;
    if (!participant) return;

    const overId = String(over.id);

    if (overId === "ready") {
      removeFromAllTeams(participant.id);
      updateStatus(participant.id, "Ready");
      return;
    }
    if (overId === "resting") {
      removeFromAllTeams(participant.id);
      updateStatus(participant.id, "Resting");
      return;
    }
    if (overId === "reserve") {
      removeFromAllTeams(participant.id);
      updateStatus(participant.id, "Reserve");
      return;
    }

    const [courtId, teamKey] = overId.split(":");
    if (courtId && (teamKey === "A" || teamKey === "B")) {
      moveToCourtTeam(courtId, teamKey as "A" | "B", participant);
    }
  }

  /* Controls */

  function addCourt() {
    const idx = courts.length + 1;
    const id = `court-${idx}`;
    setCourts((prev) => [...prev, { id, name: `Court ${idx}`, capacity: 4, status: "Open" }]);
    setCourtTeams((prev) => ({ ...prev, [id]: { A: [], B: [] } }));
  }

  function renameCourt(courtId: string) {
    const newName = window.prompt(
      "Rename court",
      courts.find((c) => c.id === courtId)?.name ?? "Court"
    );
    if (!newName) return;
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, name: newName } : c)));
  }

  function toggleCourtOpen(courtId: string) {
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, status: c.status === "Closed" ? "Open" : "Closed" } : c))
    );
  }

  function startGame(courtId: string) {
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "In-Game" } : c)));
    const t = courtTeams[courtId];
    [...t.A, ...t.B].forEach((p) => updateStatus(p.id, "In-Game"));
  }

  function endGame(courtId: string) {
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, status: "Open" } : c)));
    const t = courtTeams[courtId];
    [...t.A, ...t.B].forEach((p) => updateStatus(p.id, "Resting"));
    setCourtTeams((prev) => ({ ...prev, [courtId]: { A: [], B: [] } }));
  }

  function randomPickBalanced() {
    const pool = [...readyList];
    const next = structuredClone(courtTeams) as typeof courtTeams;

    for (const court of courts) {
      if (court.status !== "Open") continue;
      const perTeam = Math.floor(court.capacity / 2);
      const need = perTeam * 2;
      if (pool.length < 2) break;

      const take = pool.splice(0, Math.min(need, pool.length));
      const { A, B } = buildBalancedTeams(take, perTeam);
      next[court.id] = { A, B };
      [...A, ...B].forEach((p) => updateStatus(p.id, "In-Game"));
    }
    setCourtTeams(next);
  }

  function matchMakeCourt(courtId: string) {
    const perTeam = Math.floor((courts.find((c) => c.id === courtId)?.capacity ?? 4) / 2);
    const need = perTeam * 2;
    const pool = [...readyList].slice(0, need);
    if (pool.length < 2) return;
    const { A, B } = buildBalancedTeams(pool, perTeam);
    setCourtTeams((prev) => ({ ...prev, [courtId]: { A, B } }));
    [...A, ...B].forEach((p) => updateStatus(p.id, "In-Game"));
  }

  function shuffleTeamsAll() {
    const assigned = Object.values(courtTeams).flatMap((t) => [...t.A, ...t.B]);
    const shuffled = [...assigned].sort(() => Math.random() - 0.5);
    const next = structuredClone(courtTeams) as typeof courtTeams;
    let idx = 0;
    for (const court of courts) {
      const perTeam = Math.floor(court.capacity / 2);
      next[court.id] = { A: [], B: [] };
      for (let i = 0; i < perTeam && idx < shuffled.length; i++) next[court.id].A.push(shuffled[idx++]);
      for (let i = 0; i < perTeam && idx < shuffled.length; i++) next[court.id].B.push(shuffled[idx++]);
    }
    setCourtTeams(next);
  }

  function confirmMatches() {
    const newMatches: Match[] = [];
    for (const court of courts) {
      const t = courtTeams[court.id] ?? { A: [], B: [] };
      if (t.A.length === 0 || t.B.length === 0) continue;
      newMatches.push({
        id: `${court.id}-${Date.now()}`,
        courtId: court.id,
        courtName: court.name,
        teamA: t.A,
        teamB: t.B,
        status: "Scheduled",
      });
    }
    setMatches(newMatches);
  }

  function setResult(matchId: string, winner: "A" | "B") {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, winner, status: "Completed", score: scoreEntry[matchId] } : m
      )
    );
  }

  if (!id || !session) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Session not found</h1>
            <p className="text-sm text-muted-foreground">The Open Play session you are looking for does not exist.</p>
          </div>
          <Button onClick={() => navigate(urls.openPlay)}>Back to Open Play</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <div>
          <h1 className="text-xl font-semibold">{session.title}</h1>
          <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-white px-3 py-2">{session.level.join(" / ")}</Badge>
            <Tag >{session.when}</Tag>
            <Tag >{session.location}</Tag>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-black" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-primary gap-2 border-b">
        <button
          onClick={() => setTab("details")}
          className={cn("h-10 px-8 text-sm -mb-px border-b-2 text-white",
            tab === "details" ? "border-primary text-white" : "border-transparent text-black hover:text-foreground")}
        >Details</button>
        <button
          onClick={() => setTab("game")}
          className={cn("h-10 px-8 text-sm -mb-px border-b-2",
            tab === "game" ? "border-primary text-white" : "border-transparent text-black hover:text-foreground")}
        >Game</button>
      </div>

      {tab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold">Session Info</p>
              <div className="mt-2 text-sm">
                <p><span className="text-muted-foreground">Rules:</span> {session.rules ?? "Standard club rules."}</p>
                <p><span className="text-muted-foreground">Format:</span> {session.format ?? "Open queue and court rotation."}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold mb-2">Participants</p>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9"><AvatarImage src={p.avatarUrl} /><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium truncate">{p.name}</span>
                      <Badge variant="outline">{p.level}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === "In-Game" ? "secondary" : p.status === "Ready" ? "success" : "outline"}>{p.status}</Badge>
                      {p.status !== "Ready" && (
                        <Button size="sm" variant="outline" onClick={() => { removeFromAllTeams(p.id); updateStatus(p.id, "Ready"); }}>Set Ready</Button>
                      )}
                      {p.status !== "Reserve" && (
                        <Button size="sm" variant="outline" onClick={() => { removeFromAllTeams(p.id); updateStatus(p.id, "Reserve"); }}>Reserve</Button>
                      )}
                    </div>
                  </div>
                ))}
                {participants.length === 0 && <p className="text-sm text-muted-foreground">No participants yet.</p>}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold">Stats</p>
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <p>Total: {participants.length}</p>
                <p>Ready: {participants.filter((p) => p.status === "Ready").length}</p>
                <p>In-Game: {participants.filter((p) => p.status === "In-Game").length}</p>
                <p>Resting: {participants.filter((p) => p.status === "Resting").length}</p>
                <p>Reserve: {participants.filter((p) => p.status === "Reserve").length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "game" && (
        <DndContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            {/* Queues */}
            <div className="space-y-3">
              <DroppablePanel id="ready" title="Ready" subtitle="Players ready to play">
                {readyList.map((p) => <DraggablePill key={p.id} participant={p} />)}
                {readyList.length === 0 && <p className="text-xs text-muted-foreground">No players ready</p>}
              </DroppablePanel>
              <DroppablePanel id="resting" title="Resting" subtitle="Players taking a break">
                {restingList.map((p) => <DraggablePill key={p.id} participant={p} />)}
                {restingList.length === 0 && <p className="text-xs text-muted-foreground">No players resting</p>}
              </DroppablePanel>
              <DroppablePanel id="reserve" title="Reserve" subtitle="Overflow or RSVP later">
                {reserveList.map((p) => <DraggablePill key={p.id} participant={p} />)}
                {reserveList.length === 0 && <p className="text-xs text-muted-foreground">No players in reserve</p>}
              </DroppablePanel>
            </div>

            {/* Courts */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={addCourt}>Add Court</Button>
                  <Button variant="outline" onClick={randomPickBalanced}>Random Pick (Balanced)</Button>
                  <Button variant="outline" onClick={shuffleTeamsAll}>Shuffle Teams</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={confirmMatches}>Confirm Match</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courts.map((c) => {
                  const teams = courtTeams[c.id] ?? { A: [], B: [] };
                  const perTeam = Math.floor(c.capacity / 2);
                  return (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center justify-end">
                        <Button size="sm" variant="outline" onClick={() => matchMakeCourt(c.id)}>
                          Matchmake This Court
                        </Button>
                      </div>
                      <CourtMatchmakingCard
                        court={c}
                        teamA={teams.A}
                        teamB={teams.B}
                        capacity={c.capacity}
                        onStart={() => startGame(c.id)}
                        onEnd={() => endGame(c.id)}
                        onRename={() => renameCourt(c.id)}
                        onToggleOpen={() => toggleCourtOpen(c.id)}
                      />
                      <p className="text-[11px] text-muted-foreground text-center">
                        Team size: {perTeam} • Drag players onto A/B or use “Matchmake This Court”
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Matches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Matches</p>
                  <span className="text-xs text-muted-foreground">{matches.length} scheduled</span>
                </div>
                {matches.length === 0 && (
                  <div className="rounded-md border p-3 text-xs text-muted-foreground">
                    No matches yet. Confirm matches to generate them from court assignments.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matches.map((m) => (
                    <div key={m.id} className="rounded-2xl border bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{m.courtName}</p>
                        <Badge variant={m.status === "Completed" ? "secondary" : "outline"}>{m.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-medium">Team A</p>
                          <p className="text-muted-foreground truncate">{m.teamA.map((p) => p.name).join(", ")}</p>
                        </div>
                        <div>
                          <p className="font-medium">Team B</p>
                          <p className="text-muted-foreground truncate">{m.teamB.map((p) => p.name).join(", ")}</p>
                        </div>
                      </div>
                      {m.status === "Scheduled" ? (
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            className="h-8 w-28"
                            placeholder="Score"
                            value={scoreEntry[m.id] ?? ""}
                            onChange={(e) => setScoreEntry((s) => ({ ...s, [m.id]: e.target.value }))}
                          />
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => setResult(m.id, "A")}>Set A Win</Button>
                            <Button size="sm" onClick={() => setResult(m.id, "B")}>Set B Win</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <p>
                            Winner: <span className="font-medium">
                              {m.winner === "A" ? m.teamA.map((p) => p.name).join(", ") : m.teamB.map((p) => p.name).join(", ")}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Loser: {m.winner === "A" ? m.teamB.map((p) => p.name).join(", ") : m.teamA.map((p) => p.name).join(", ")}
                            {m.score ? ` • Score: ${m.score}` : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default OpenPlayDetailPage;
