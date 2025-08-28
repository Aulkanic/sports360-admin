/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ResponsiveOverlay from "@/components/responsive-overlay";
import PlayerStatusPanel, { type PlayerItem } from "@/components/player-status-panel";

type Player = {
	id: string;
	name: string;
	team: string;
	avatarUrl?: string;
	status: "In-Game" | "Resting";
	skill?: "Beginner" | "Intermediate" | "Advanced" | "Pro";
};

type Court = { id: string; name: string; capacity: number };

type Match = {
  id: string;
  courtId: string;
  courtName: string;
  teamA: Player[];
  teamB: Player[];
  status: "Scheduled" | "Live" | "Completed";
  winner?: "A" | "B";
  score?: string;
};

const courts: Court[] = [
	{ id: "court-a", name: "Court A", capacity: 4 },
	{ id: "court-b", name: "Court B", capacity: 4 },
];

// Sample players removed; participants come from selected session

type OpenPlaySession = {
	id: string;
	title: string;
	when: string;
	location: string;
	level: Array<"Beginner" | "Intermediate" | "Advanced">;
	participants: PlayerItem[];
};

const initialSessions: OpenPlaySession[] = [
	{
		id: "op-1",
		title: "Pickleball Open Play",
		when: "Fri • 7:00–9:00 PM",
		location: "Court A",
		level: ["Beginner", "Intermediate"],
		participants: [
			{ id: "u1", name: "Alice Johnson", status: "Resting", avatar: "https://i.pravatar.cc/100?img=1", skill: "Intermediate" },
			{ id: "u2", name: "Bob Smith", status: "Resting", avatar: "https://i.pravatar.cc/100?img=2", skill: "Beginner" },
			{ id: "u3", name: "Carol Davis", status: "Resting", avatar: "https://i.pravatar.cc/100?img=3", skill: "Advanced" },
			{ id: "u4", name: "David Lee", status: "Resting", avatar: "https://i.pravatar.cc/100?img=4", skill: "Intermediate" },
			{ id: "u5", name: "Emma Wilson", status: "Resting", avatar: "https://i.pravatar.cc/100?img=5", skill: "Beginner" },
			{ id: "u6", name: "Frank Harris", status: "Resting", avatar: "https://i.pravatar.cc/100?img=6", skill: "Intermediate" },
			{ id: "u7", name: "Grace Patel", status: "Resting", avatar: "https://i.pravatar.cc/100?img=7", skill: "Advanced" },
			{ id: "u8", name: "Henry Cooper", status: "Resting", avatar: "https://i.pravatar.cc/100?img=8", skill: "Intermediate" },
			{ id: "u9", name: "Isabella Ruiz", status: "Resting", avatar: "https://i.pravatar.cc/100?img=9", skill: "Beginner" },
			{ id: "u10", name: "Jackie Chen", status: "Resting", avatar: "https://i.pravatar.cc/100?img=10", skill: "Pro" },
			{ id: "u11", name: "Khalid Noor", status: "Resting", avatar: "https://i.pravatar.cc/100?img=11", skill: "Advanced" },
			{ id: "u12", name: "Lily Zhang", status: "Resting", avatar: "https://i.pravatar.cc/100?img=12", skill: "Intermediate" },
		],
	},
	{
		id: "op-2",
		title: "Tennis Rally Night",
		when: "Sat • 9:00–11:00 AM",
		location: "Court 3",
		level: ["Intermediate", "Advanced"],
		participants: [
			{ id: "t1", name: "Ivy Park", status: "Resting", avatar: "https://i.pravatar.cc/100?img=13", skill: "Advanced" },
			{ id: "t2", name: "Jordan Miles", status: "Resting", avatar: "https://i.pravatar.cc/100?img=14", skill: "Intermediate" },
			{ id: "t3", name: "Ken Adams", status: "Resting", avatar: "https://i.pravatar.cc/100?img=15", skill: "Advanced" },
			{ id: "t4", name: "Nina Gomez", status: "Resting", avatar: "https://i.pravatar.cc/100?img=16", skill: "Intermediate" },
		],
	},
];

const DraggablePlayer: React.FC<{ player: Player }> = ({ player }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `player-${player.id}`, data: { player } });
	const style = { opacity: isDragging ? 0.6 : 1, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined } as React.CSSProperties;
	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes} className="rounded-lg border p-2 bg-card flex items-center gap-3">
			<Avatar className="h-8 w-8">
				<AvatarImage src={player.avatarUrl} />
				<AvatarFallback>{player.name.split(" ").map((s) => s[0]).slice(0,2).join("")}</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{player.name}</p>
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="text-[10px]">{player.team}</Badge>
					{player.skill && <Badge variant="outline" className="text-[10px]">{player.skill}</Badge>}
					<Badge variant={player.status === "In-Game" ? "success" : "muted"} className="text-[10px]">{player.status}</Badge>
				</div>
			</div>
		</div>
	);
};

const DroppableZone: React.FC<{ id: string; title: string; subtitle?: string; footer?: React.ReactNode; children?: React.ReactNode }>
= ({ id, title, subtitle, footer, children }) => {
	const { isOver, setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={`rounded-xl border p-3 bg-card shadow-sm transition ${isOver ? "bg-muted/40" : ""}`}>
			<div className="mb-2">
				<p className="text-sm font-semibold">{title}</p>
				{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
			</div>
			<div className="space-y-2 min-h-[120px]">
				{children}
				{!children && (
					<p className="text-xs text-muted-foreground">Drag players here</p>
				)}
			</div>
			{footer}
		</div>
	);
};

const OpenPlayPage: React.FC = () => {
	const [query, setQuery] = useState("");
	const [sessions, setSessions] = useState<OpenPlaySession[]>(initialSessions);
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessions[0]?.id ?? null);
	const [courtPlayers, setCourtPlayers] = useState<Record<string, Player[]>>({ "court-a": [], "court-b": [] });
	const [matches, setMatches] = useState<Match[]>([]);
	const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});

	// Create Open Play overlay state
	const [createOpen, setCreateOpen] = useState(false);
	const [createForm, setCreateForm] = useState<{ title: string; date: string; time: string; location: string; levels: { Beginner: boolean; Intermediate: boolean; Advanced: boolean } }>(
		{ title: "", date: "", time: "", location: "", levels: { Beginner: true, Intermediate: false, Advanced: false } }
	);

	// Participants overlay state
	const [participantsOpen, setParticipantsOpen] = useState(false);
	const [participantsSessionId, setParticipantsSessionId] = useState<string | null>(null);

	const selectedSession = useMemo(() => sessions.find((s) => s.id === selectedSessionId) ?? null, [sessions, selectedSessionId]);
	const players: Player[] = useMemo(() => {
		if (!selectedSession) return [];
		return selectedSession.participants.map((p) => ({ id: p.id, name: p.name, team: "Open Play", status: p.status, avatarUrl: p.avatar, skill: p.skill }));
	}, [selectedSession]);

	const bench = useMemo(() => {
		const assigned = new Set(Object.values(courtPlayers).flat().map((p) => p.id));
		return players.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) && !assigned.has(p.id));
	}, [players, query, courtPlayers]);

	function moveToCourt(courtId: string, player: Player) {
		setCourtPlayers((prev) => {
			const cleaned: Record<string, Player[]> = Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((x) => x.id !== player.id)]));
			const curr = cleaned[courtId] ?? [];
			const cap = courts.find((c) => c.id === courtId)?.capacity ?? 4;
			if (curr.length >= cap) return cleaned;
			// Update participant status in selected session
			if (selectedSessionId) {
				setSessions((prev) => prev.map((s) => s.id === selectedSessionId ? { ...s, participants: s.participants.map((pp) => pp.id === player.id ? { ...pp, status: "In-Game" } : pp) } : s));
			}
			return { ...cleaned, [courtId]: [...curr, { ...player, status: "In-Game" }] };
		});
	}
	function moveToBench(player: Player) {
		setCourtPlayers((prev) => Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((x) => x.id !== player.id)])));
		if (selectedSessionId) {
			setSessions((prev) => prev.map((s) => s.id === selectedSessionId ? { ...s, participants: s.participants.map((pp) => pp.id === player.id ? { ...pp, status: "Resting" } : pp) } : s));
		}
	}

	function onDragEnd(e: DragEndEvent) {
		const { active, over } = e;
		if (!over) return;
		const player = (active.data.current as any)?.player as Player;
		if (!player) return;
		if (over.id === "bench") return moveToBench(player);
		moveToCourt(String(over.id), player);
	}

	function confirmMatches() {
		const newMatches: Match[] = [];
		Object.entries(courtPlayers).forEach(([courtId, playersOnCourt]) => {
			if (!playersOnCourt || playersOnCourt.length < 2) return;
			// chunk into groups of 4 when possible, else 2
			let idx = 0;
			while (idx < playersOnCourt.length - 1) {
				const remaining = playersOnCourt.length - idx;
				const take = remaining >= 4 ? 4 : 2;
				const chunk = playersOnCourt.slice(idx, idx + take);
				idx += take;
				const half = Math.floor(chunk.length / 2);
				const teamA = chunk.slice(0, half);
				const teamB = chunk.slice(half);
				if (teamA.length === 0 || teamB.length === 0) continue;
				const courtName = courts.find((c) => c.id === courtId)?.name ?? courtId;
				newMatches.push({
					id: `${courtId}-${Date.now()}-${newMatches.length + 1}`,
					courtId,
					courtName,
					teamA,
					teamB,
					status: "Scheduled",
				});
			}
		});
		setMatches(newMatches);
	}

	function setResult(matchId: string, winner: "A" | "B") {
		setMatches((prev) =>
			prev.map((m) =>
				m.id === matchId
					? { ...m, winner, status: "Completed", score: scoreEntry[matchId] }
					: m
			)
		);
	}

	function openParticipants(sessionId: string) {
		setParticipantsSessionId(sessionId);
		setParticipantsOpen(true);
	}

	function handleCreateSubmit(e: React.FormEvent) {
		e.preventDefault();
		const levels = Object.entries(createForm.levels).filter(([, v]) => v).map(([k]) => k as OpenPlaySession["level"][number]);
		if (!createForm.title.trim() || !createForm.date || !createForm.time || !createForm.location.trim() || levels.length === 0) return;
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
		setCreateForm({ title: "", date: "", time: "", location: "", levels: { Beginner: true, Intermediate: false, Advanced: false } });
		setSelectedSessionId((id) => id ?? newSession.id);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Open Play</h1>
					<p className="text-sm text-muted-foreground">Create sessions and manage participants. Select a session to manage matches.</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => setCreateOpen(true)}>Create Open Play</Button>
				</div>
			</div>

			{/* Sessions list */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
				{sessions.map((s) => (
					<div key={s.id} className={`rounded-xl border bg-card p-4 space-y-2 ${selectedSessionId === s.id ? "ring-2 ring-primary" : ""}`}>
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-semibold">{s.title}</p>
								<div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
									<Badge variant="outline">{s.level.join(" / ")}</Badge>
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{s.when}</span>
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{s.location}</span>
								</div>
							</div>
							<Badge>Open Play</Badge>
						</div>
						<div className="text-xs text-muted-foreground">Participants: <span className="font-medium text-foreground">{s.participants.length}</span></div>
						<div className="flex items-center gap-2">
							<Button size="sm" variant="outline" onClick={() => openParticipants(s.id)}>Participants</Button>
							<Button size="sm" onClick={() => setSelectedSessionId(s.id)}>Manage</Button>
						</div>
					</div>
				))}
			</div>

			{/* Featured athlete card */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-3 rounded-2xl border bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 p-4 text-white">
					<div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
						<div className="flex items-center gap-4">
							<Avatar className="h-16 w-16 ring-4 ring-white/40">
								<AvatarImage src="https://i.pravatar.cc/200?img=64" />
								<AvatarFallback>AP</AvatarFallback>
							</Avatar>
							<div>
								<p className="text-xl font-bold leading-tight">Featured Athlete: Alex Park</p>
								<p className="text-white/90 text-sm">Skill: Pro • Sport: Pickleball • Club Ranking #1</p>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3 w-full md:w-auto">
							<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
								<p className="text-2xl font-extrabold">72%</p>
								<p className="text-xs">Win Rate</p>
							</div>
							<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
								<p className="text-2xl font-extrabold">11-6</p>
								<p className="text-xs">Best Score</p>
							</div>
							<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
								<p className="text-2xl font-extrabold">28</p>
								<p className="text-xs">Matches</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Matchmaking header */}
			{selectedSession && (
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">Selected: <span className="font-semibold">{selectedSession.title}</span></p>
						<p className="text-xs text-muted-foreground">Drag and drop players into courts to set up matches</p>
					</div>
					<div className="flex items-center gap-2">
						<Input className="w-64" placeholder="Search players" value={query} onChange={(e) => setQuery(e.target.value)} />
						<Button variant="outline">Shuffle Teams</Button>
						<Button onClick={confirmMatches}>Confirm Matches</Button>
					</div>
				</div>
			)}

			{selectedSession && (
				<DndContext onDragEnd={onDragEnd}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-1 space-y-3">
							<DroppableZone id="bench" title="Bench" subtitle="Available players">
								{bench.length > 0 ? bench.map((p) => <DraggablePlayer key={p.id} player={p} />) : <p className="text-xs text-muted-foreground">No players on bench</p>}
							</DroppableZone>
							<div className="rounded-xl border p-3 bg-card">
								<p className="text-sm font-semibold">Tips</p>
								<ul className="text-xs text-muted-foreground list-disc pl-4 mt-1 space-y-1">
									<li>Drag from Bench into a court to set players In-Game</li>
									<li>Drag back to Bench to rest a player</li>
									<li>Each court supports up to 4 players</li>
								</ul>
							</div>
						</div>
						<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
							{courts.map((c) => (
								<DroppableZone key={c.id} id={c.id} title={`${c.name}`} subtitle={`Capacity ${ (courtPlayers[c.id] ?? []).length }/${c.capacity}`}>
									{(courtPlayers[c.id] ?? []).map((p) => <DraggablePlayer key={p.id} player={p} />)}
								</DroppableZone>
							))}
						</div>
					</div>
				</DndContext>
			)}

			{/* Matches section */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<p className="text-sm font-semibold">Matches</p>
					<span className="text-xs text-muted-foreground">{matches.length} scheduled</span>
				</div>
				{matches.length === 0 && (
					<div className="rounded-md border p-3 text-xs text-muted-foreground">No matches yet. Confirm matches to generate them from court assignments.</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{matches.map((m) => (
						<div key={m.id} className="rounded-2xl border bg-card overflow-hidden">
							{/* Sports-themed header */}
							<div className="bg-gradient-to-r from-orange-600 via-emerald-600 to-green-600 text-white px-4 py-2 flex items-center justify-between">
								<p className="text-sm font-semibold">{m.courtName}</p>
								<div className="flex items-center gap-2">
									<Badge variant={m.status === "Completed" ? "secondary" : "outline"}>{m.status}</Badge>
								</div>
							</div>
							{/* VS layout */}
							<div className="relative p-4 bg-[url('/pickleball-court-texture.svg')] bg-cover bg-center">
								<div className="grid grid-cols-2 gap-4 items-center">
									<div className="space-y-2">
										{m.teamA.map((p) => (
											<div key={p.id} className="flex items-center gap-2">
												<Avatar className="h-9 w-9">
													<AvatarImage src={p.avatarUrl} />
													<AvatarFallback>{p.name.split(" ").map((s)=>s[0]).slice(0,2).join("")}</AvatarFallback>
												</Avatar>
												<div className="min-w-0">
													<p className="text-sm font-medium truncate text-foreground">{p.name}</p>
													<div className="flex items-center gap-2">
														<Badge variant="secondary" className="text-[10px]">{p.team}</Badge>
														{p.skill && <Badge variant="outline" className="text-[10px]">{p.skill}</Badge>}
													</div>
												</div>
											</div>
										))}
									</div>
									<div className="flex items-center justify-center">
										<div className="h-full flex flex-col items-center justify-center">
											<span className="text-3xl font-extrabold text-foreground">VS</span>
										</div>
									</div>
									<div className="space-y-2">
										{m.teamB.map((p) => (
											<div key={p.id} className="flex items-center gap-2 justify-end">
												<div className="min-w-0 text-right">
													<p className="text-sm font-medium truncate text-foreground">{p.name}</p>
													<div className="flex items-center gap-2 justify-end">
														{p.skill && <Badge variant="outline" className="text-[10px]">{p.skill}</Badge>}
														<Badge variant="secondary" className="text-[10px]">{p.team}</Badge>
													</div>
												</div>
												<Avatar className="h-9 w-9">
													<AvatarImage src={p.avatarUrl} />
													<AvatarFallback>{p.name.split(" ").map((s)=>s[0]).slice(0,2).join("")}</AvatarFallback>
												</Avatar>
											</div>
										))}
									</div>
								</div>
							</div>
							{/* Controls */}
							<div className="p-3 border-t flex flex-wrap items-center justify-between gap-2">
								{m.status === "Scheduled" && (
									<div className="flex items-center gap-2">
										<Input className="h-8 w-28" placeholder="Score" value={scoreEntry[m.id] ?? ""} onChange={(e) => setScoreEntry((s) => ({ ...s, [m.id]: e.target.value }))} />
										<Button size="sm" variant="outline" onClick={() => setMatches((prev) => prev.map((x) => x.id === m.id ? { ...x, status: "Live" } : x))}>Start</Button>
									</div>
								)}
								{m.status === "Live" && (
									<div className="flex items-center gap-2">
										<Button size="sm" variant="outline" onClick={() => setResult(m.id, "A")}>Team A Win</Button>
										<Button size="sm" onClick={() => setResult(m.id, "B")}>Team B Win</Button>
									</div>
								)}
								{m.status === "Completed" && (
									<div className="text-xs">
										<p>
											Winner: <span className="font-medium">{m.winner === "A" ? m.teamA.map((p) => p.name).join(", ") : m.teamB.map((p) => p.name).join(", ")}</span>
										</p>
										<p className="text-muted-foreground">{m.score ? `Score: ${m.score}` : "No score"}</p>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Create Open Play overlay */}
			<ResponsiveOverlay
				open={createOpen}
				onOpenChange={setCreateOpen}
				title="Create Open Play"
				ariaLabel="Create Open Play"
				footer={(
					<div className="flex items-center justify-end gap-2">
						<Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
						<Button type="submit" form="open-play-create-form">Create</Button>
					</div>
				)}
			>
				<form id="open-play-create-form" onSubmit={handleCreateSubmit} className="space-y-3">
					<label className="space-y-1 block">
						<span className="text-sm">Title</span>
						<Input value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Pickleball Open Play" />
					</label>
					<div className="grid grid-cols-2 gap-3">
						<label className="space-y-1 block">
							<span className="text-sm">Date</span>
							<Input type="date" value={createForm.date} onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))} />
						</label>
						<label className="space-y-1 block">
							<span className="text-sm">Time</span>
							<Input type="time" value={createForm.time} onChange={(e) => setCreateForm((p) => ({ ...p, time: e.target.value }))} />
						</label>
					</div>
					<label className="space-y-1 block">
						<span className="text-sm">Location</span>
						<Input value={createForm.location} onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g., Court A" />
					</label>
					<div className="space-y-1">
						<span className="text-sm">Levels</span>
						<div className="flex items-center gap-3 text-sm">
							<label className="inline-flex items-center gap-2">
								<input type="checkbox" checked={createForm.levels.Beginner} onChange={(e) => setCreateForm((p) => ({ ...p, levels: { ...p.levels, Beginner: e.target.checked } }))} />
								<span>Beginner</span>
							</label>
							<label className="inline-flex items-center gap-2">
								<input type="checkbox" checked={createForm.levels.Intermediate} onChange={(e) => setCreateForm((p) => ({ ...p, levels: { ...p.levels, Intermediate: e.target.checked } }))} />
								<span>Intermediate</span>
							</label>
							<label className="inline-flex items-center gap-2">
								<input type="checkbox" checked={createForm.levels.Advanced} onChange={(e) => setCreateForm((p) => ({ ...p, levels: { ...p.levels, Advanced: e.target.checked } }))} />
								<span>Advanced</span>
							</label>
						</div>
					</div>
				</form>
			</ResponsiveOverlay>

			{/* Participants overlay */}
			<PlayerStatusPanel
				open={participantsOpen}
				onOpenChange={setParticipantsOpen}
				title="Participants"
				players={(sessions.find((s) => s.id === participantsSessionId)?.participants ?? [])}
				adminMode
				onToggleStatus={(playerId, to) => {
					if (!participantsSessionId) return;
					setSessions((prev) => prev.map((s) => s.id === participantsSessionId ? { ...s, participants: s.participants.map((p) => p.id === playerId ? { ...p, status: to } : p) } : s));
				}}
				notice="Players shown here have joined this Open Play session."
			/>

		</div>
	);
};

export default OpenPlayPage;