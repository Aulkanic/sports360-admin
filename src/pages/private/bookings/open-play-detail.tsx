/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { urls } from "@/routes";

type ParticipantStatus = "Ready" | "Resting" | "Reserve" | "In-Game";

type Participant = {
	id: string;
	name: string;
	level?: "Beginner" | "Intermediate" | "Advanced";
	status: ParticipantStatus;
	avatarUrl?: string;
};

type Court = {
	id: string;
	name: string;
	capacity: number;
	status: "Open" | "In-Game" | "Closed";
};

type Match = {
	id: string;
	courtId: string;
	courtName: string;
	teamA: Participant[];
	teamB: Participant[];
	status: "Scheduled" | "Completed";
	winner?: "A" | "B";
	score?: string;
};

type OpenPlaySession = {
	id: string;
	title: string;
	when: string;
	location: string;
	level: Array<"Beginner" | "Intermediate" | "Advanced">;
	rules?: string;
	format?: string;
	participants: Participant[];
};

const SAMPLE_SESSIONS: OpenPlaySession[] = [
	{
		id: "op-1",
		title: "Pickleball Open Play",
		when: "Fri • 7:00–9:00 PM",
		location: "Court A",
		level: ["Beginner", "Intermediate"],
		rules: "Games to 11, win by 2.",
		format: "Rolling queue, doubles preferred.",
		participants: [
			{ id: "u1", name: "Alice Johnson", status: "Ready" },
			{ id: "u2", name: "Bob Smith", status: "Resting" },
			{ id: "u3", name: "Carol Davis", status: "Reserve" },
			{ id: "u4", name: "David Lee", status: "Ready" },
		],
	},
	{
		id: "op-2",
		title: "Tennis Rally Night",
		when: "Sat • 9:00–11:00 AM",
		location: "Court 3",
		level: ["Intermediate", "Advanced"],
		rules: "First to 4 games, no-ad.",
		format: "Singles or doubles based on turnout.",
		participants: [
			{ id: "u5", name: "Ivy", status: "Ready" },
			{ id: "u6", name: "Jack", status: "Resting" },
		],
	},
];

const DraggablePill: React.FC<{ participant: Participant }> = ({ participant }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `p-${participant.id}`, data: { participant } });
	const style = { opacity: isDragging ? 0.6 : 1, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined } as React.CSSProperties;
	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes} className="rounded-lg border p-2 bg-card flex items-center gap-3">
			<Avatar className="h-8 w-8">
				<AvatarImage src={participant.avatarUrl} />
				<AvatarFallback>{participant.name.split(" ").map((s) => s[0]).slice(0,2).join("")}</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{participant.name}</p>
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="text-[10px]">{participant.status}</Badge>
				</div>
			</div>
		</div>
	);
};

const DroppablePanel: React.FC<{ id: string; title: string; subtitle?: string; footer?: React.ReactNode; children?: React.ReactNode }>
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

const OpenPlayDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const location = useLocation() as { state?: { session?: OpenPlaySession } };

	const [tab, setTab] = useState<"details" | "game">("details");

	// Prefer state from navigation when available
	const stateSession = location.state?.session as OpenPlaySession | undefined;
	const sessionById = useMemo(() => stateSession ?? SAMPLE_SESSIONS.find((s) => s.id === id), [stateSession, id]);

	const [participants, setParticipants] = useState<Participant[]>(() => (sessionById?.participants ?? []) as Participant[]);
	const [courts, setCourts] = useState<Court[]>([
		{ id: "court-a", name: "Court A", capacity: 4, status: "Open" },
	]);
	const [courtPlayers, setCourtPlayers] = useState<Record<string, Participant[]>>({ "court-a": [] });
	const [matches, setMatches] = useState<Match[]>([]);
	const [scoreEntry, setScoreEntry] = useState<Record<string, string>>({});

	const readyList = useMemo(() => participants.filter((p) => p.status === "Ready" && !Object.values(courtPlayers).flat().some((cp) => cp.id === p.id)), [participants, courtPlayers]);
	const restingList = useMemo(() => participants.filter((p) => p.status === "Resting" && !Object.values(courtPlayers).flat().some((cp) => cp.id === p.id)), [participants, courtPlayers]);
	const reserveList = useMemo(() => participants.filter((p) => p.status === "Reserve" && !Object.values(courtPlayers).flat().some((cp) => cp.id === p.id)), [participants, courtPlayers]);

	const session = useMemo<OpenPlaySession | null>(() => {
		if (sessionById) return { ...sessionById, participants };
		return null;
	}, [sessionById, participants]);

	function updateStatus(participantId: string, status: ParticipantStatus) {
		setParticipants((prev) => prev.map((p) => p.id === participantId ? { ...p, status } : p));
	}

	function removeFromCourts(participantId: string) {
		setCourtPlayers((prev) => Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((p) => p.id !== participantId)])));
	}

	function moveToCourt(courtId: string, participant: Participant) {
		setCourtPlayers((prev) => {
			const cleaned: Record<string, Participant[]> = Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((x) => x.id !== participant.id)]));
			const curr = cleaned[courtId] ?? [];
			const cap = courts.find((c) => c.id === courtId)?.capacity ?? 4;
			if (curr.length >= cap) return cleaned;
			updateStatus(participant.id, "In-Game");
			return { ...cleaned, [courtId]: [...curr, { ...participant, status: "In-Game" }] };
		});
	}

	function onDragEnd(e: DragEndEvent) {
		const { active, over } = e;
		if (!over) return;
		const participant = (active.data.current as any)?.participant as Participant;
		if (!participant) return;
		const overId = String(over.id);
		if (overId === "ready") { removeFromCourts(participant.id); updateStatus(participant.id, "Ready"); return; }
		if (overId === "resting") { removeFromCourts(participant.id); updateStatus(participant.id, "Resting"); return; }
		if (overId === "reserve") { removeFromCourts(participant.id); updateStatus(participant.id, "Reserve"); return; }
		moveToCourt(overId, participant);
	}

	function addCourt() {
		const idx = courts.length + 1;
		const id = `court-${idx}`;
		setCourts((prev) => [...prev, { id, name: `Court ${idx}`, capacity: 4, status: "Open" }]);
		setCourtPlayers((prev) => ({ ...prev, [id]: [] }));
	}

	function renameCourt(courtId: string) {
		const newName = window.prompt("Rename court", courts.find((c) => c.id === courtId)?.name ?? "Court");
		if (!newName) return;
		setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, name: newName } : c));
	}

	function toggleCourtOpen(courtId: string) {
		setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, status: c.status === "Closed" ? "Open" : "Closed" } : c));
	}

	function startGame(courtId: string) {
		setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, status: "In-Game" } : c));
		// mark players as In-Game
		const players = courtPlayers[courtId] ?? [];
		players.forEach((p) => updateStatus(p.id, "In-Game"));
	}

	function endGame(courtId: string) {
		setCourts((prev) => prev.map((c) => c.id === courtId ? { ...c, status: "Open" } : c));
		const players = courtPlayers[courtId] ?? [];
		players.forEach((p) => updateStatus(p.id, "Resting"));
	}

	function randomPick() {
		// move some Ready players into first courts with space
		const ready = [...readyList];
		const next = { ...courtPlayers } as Record<string, Participant[]>;
		courts.forEach((court) => {
			const cap = court.capacity;
			const curr = next[court.id] ?? [];
			while (curr.length < cap && ready.length > 0) {
				const idx = Math.floor(Math.random() * ready.length);
				const [picked] = ready.splice(idx, 1);
				curr.push({ ...picked, status: "In-Game" });
			}
			next[court.id] = curr;
		});
		// commit
		setCourtPlayers(next);
		ready.forEach((p) => updateStatus(p.id, "Ready"));
	}

	function shuffleTeams() {
		const assigned = Object.values(courtPlayers).flat();
		const shuffled = [...assigned].sort(() => Math.random() - 0.5);
		const next: Record<string, Participant[]> = {};
		let idx = 0;
		courts.forEach((c) => {
			next[c.id] = [];
			for (let i = 0; i < c.capacity && idx < shuffled.length; i++) {
				next[c.id].push({ ...shuffled[idx], status: "In-Game" });
				idx++;
			}
		});
		setCourtPlayers(next);
	}

	function confirmMatches() {
		const newMatches: Match[] = [];
		Object.entries(courtPlayers).forEach(([courtId, playersOnCourt]) => {
			if (!playersOnCourt || playersOnCourt.length < 2) return;
			let k = 0;
			while (k < playersOnCourt.length - 1) {
				const remaining = playersOnCourt.length - k;
				const take = remaining >= 4 ? 4 : 2;
				const chunk = playersOnCourt.slice(k, k + take);
				k += take;
				const half = Math.floor(chunk.length / 2);
				const teamA = chunk.slice(0, half);
				const teamB = chunk.slice(half);
				if (teamA.length === 0 || teamB.length === 0) continue;
				const courtName = courts.find((c) => c.id === courtId)?.name ?? courtId;
				newMatches.push({ id: `${courtId}-${Date.now()}-${newMatches.length + 1}`, courtId, courtName, teamA, teamB, status: "Scheduled" });
			}
		});
		setMatches(newMatches);
	}

	function setResult(matchId: string, winner: "A" | "B") {
		setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, winner, status: "Completed", score: scoreEntry[matchId] } : m));
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
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">{session.title}</h1>
					<div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
						<Badge variant="outline">{session.level.join(" / ")}</Badge>
						<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{session.when}</span>
						<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{session.location}</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-2 border-b">
				<button onClick={() => setTab("details")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${tab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Details</button>
				<button onClick={() => setTab("game")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${tab === "game" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Game</button>
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
											<Avatar className="h-7 w-7"><AvatarImage src={p.avatarUrl} /><AvatarFallback>{p.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
											<span className="text-sm font-medium truncate">{p.name}</span>
											<Badge variant="outline">{p.level ?? ""}</Badge>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={p.status === "In-Game" ? "success" : p.status === "Ready" ? "secondary" : "outline"}>{p.status}</Badge>
											{/* Actions */}
											{p.status !== "Ready" && <Button size="sm" variant="outline" onClick={() => { removeFromCourts(p.id); updateStatus(p.id, "Ready"); }}>Set Ready</Button>}
											{p.status !== "Reserve" && <Button size="sm" variant="outline" onClick={() => { removeFromCourts(p.id); updateStatus(p.id, "Reserve"); }}>Reserve</Button>}
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
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						{/* Left queues */}
						<div className="space-y-3">
							<DroppablePanel id="ready" title="Ready" subtitle="Players ready to play">
								{readyList.map((p) => (<DraggablePill key={p.id} participant={p} />))}
								{readyList.length === 0 && <p className="text-xs text-muted-foreground">No players ready</p>}
							</DroppablePanel>
							<DroppablePanel id="resting" title="Resting" subtitle="Players taking a break">
								{restingList.map((p) => (<DraggablePill key={p.id} participant={p} />))}
								{restingList.length === 0 && <p className="text-xs text-muted-foreground">No players resting</p>}
							</DroppablePanel>
							<DroppablePanel id="reserve" title="Reserve" subtitle="Overflow or RSVP later">
								{reserveList.map((p) => (<DraggablePill key={p.id} participant={p} />))}
								{reserveList.length === 0 && <p className="text-xs text-muted-foreground">No players in reserve</p>}
							</DroppablePanel>
						</div>

						{/* Right courts */}
						<div className="lg:col-span-2 space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Button variant="outline" onClick={addCourt}>Add Court</Button>
									<Button variant="outline" onClick={randomPick}>Random Pick</Button>
									<Button variant="outline" onClick={shuffleTeams}>Shuffle Teams</Button>
								</div>
								<div className="flex items-center gap-2">
									<Button onClick={confirmMatches}>Confirm Match</Button>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{courts.map((c) => (
									<DroppablePanel
										key={c.id}
										id={c.id}
										title={`${c.name}`}
										subtitle={`Status: ${c.status} • Players ${(courtPlayers[c.id] ?? []).length}/${c.capacity}`}
										footer={(
											<div className="mt-3 flex items-center gap-2">
												<Button size="sm" variant="outline" onClick={() => renameCourt(c.id)}>Rename Court</Button>
												<Button size="sm" variant="outline" onClick={() => toggleCourtOpen(c.id)}>{c.status === "Closed" ? "Reopen Court" : "Close Court"}</Button>
												<Button size="sm" variant="outline" onClick={() => endGame(c.id)}>End Game</Button>
												<Button size="sm" onClick={() => startGame(c.id)}>Start Game</Button>
											</div>
										)}
									>
										{(courtPlayers[c.id] ?? []).map((p) => (<DraggablePill key={p.id} participant={p} />))}
									</DroppablePanel>
								))}
							</div>

							{/* Matches */}
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
										<div key={m.id} className="rounded-xl border bg-card p-3 space-y-2">
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
													<div className="flex items-center gap-2">
														<Input className="h-8 w-28" placeholder="Score" value={scoreEntry[m.id] ?? ""} onChange={(e) => setScoreEntry((s) => ({ ...s, [m.id]: e.target.value }))} />
													</div>
													<div className="flex items-center gap-2">
														<Button size="sm" variant="outline" onClick={() => setResult(m.id, "A")}>Set A Win</Button>
														<Button size="sm" onClick={() => setResult(m.id, "B")}>Set B Win</Button>
													</div>
												</div>
											) : (
												<div className="text-xs">
													<p>
														Winner: <span className="font-medium">{m.winner === "A" ? m.teamA.map((p) => p.name).join(", ") : m.teamB.map((p) => p.name).join(", ")}</span>
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
