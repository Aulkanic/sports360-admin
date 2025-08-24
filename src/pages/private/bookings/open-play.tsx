import React, { useMemo, useState } from "react";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Player = {
	id: string;
	name: string;
	team: string;
	avatarUrl?: string;
	status: "In-Game" | "Resting";
};

type Court = { id: string; name: string; capacity: number };

const courts: Court[] = [
	{ id: "court-a", name: "Court A", capacity: 4 },
	{ id: "court-b", name: "Court B", capacity: 4 },
];

const samplePlayers: Player[] = [
	{ id: "p1", name: "Alice Johnson", team: "Smashers", avatarUrl: "https://i.pravatar.cc/100?img=1", status: "Resting" },
	{ id: "p2", name: "Bob Smith", team: "Rally Kings", avatarUrl: "https://i.pravatar.cc/100?img=2", status: "Resting" },
	{ id: "p3", name: "Carol Davis", team: "Net Ninjas", avatarUrl: "https://i.pravatar.cc/100?img=3", status: "Resting" },
	{ id: "p4", name: "David Lee", team: "Drop Shot", avatarUrl: "https://i.pravatar.cc/100?img=4", status: "Resting" },
	{ id: "p5", name: "Erin Park", team: "Baseline", avatarUrl: "https://i.pravatar.cc/100?img=5", status: "Resting" },
	{ id: "p6", name: "Frank Zhang", team: "Spin Doctors", avatarUrl: "https://i.pravatar.cc/100?img=6", status: "Resting" },
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
	const [players, setPlayers] = useState<Player[]>(samplePlayers);
	const [courtPlayers, setCourtPlayers] = useState<Record<string, Player[]>>({ "court-a": [], "court-b": [] });

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
			// Update player to In-Game
			setPlayers((ps) => ps.map((p) => p.id === player.id ? { ...p, status: "In-Game" } : p));
			return { ...cleaned, [courtId]: [...curr, { ...player, status: "In-Game" }] };
		});
	}
	function moveToBench(player: Player) {
		setCourtPlayers((prev) => Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((x) => x.id !== player.id)])));
		setPlayers((ps) => ps.map((p) => p.id === player.id ? { ...p, status: "Resting" } : p));
	}

	function onDragEnd(e: DragEndEvent) {
		const { active, over } = e;
		if (!over) return;
		const player = (active.data.current as any)?.player as Player;
		if (!player) return;
		if (over.id === "bench") return moveToBench(player);
		moveToCourt(String(over.id), player);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Open Play Matchmaking</h1>
					<p className="text-sm text-muted-foreground">Drag and drop players into courts to set up matches</p>
				</div>
				<div className="flex items-center gap-2">
					<Input className="w-64" placeholder="Search players" value={query} onChange={(e) => setQuery(e.target.value)} />
					<Button variant="outline">Shuffle Teams</Button>
					<Button>Confirm Matches</Button>
				</div>
			</div>

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
		</div>
	);
};

export default OpenPlayPage;