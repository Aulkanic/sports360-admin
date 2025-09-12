/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";

export interface PlayerItem {
	id: string;
	name: string;
	status: "In-Game" | "Resting" | "Ready" | "Waitlist" | "Reserve";
	avatar?: string;
	initials?: string;
	level?: string;
	paymentStatus?: string;
	paymentAmount?: string;
	notes?: string;
}

interface PlayerStatusPanelProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	title?: string;
	players: PlayerItem[];
	adminMode?: boolean;
	onToggleStatus?: (playerId: string, to: PlayerItem["status"]) => void;
	onRequestChange?: (playerId: string, to: PlayerItem["status"]) => void;
	notice?: string;
}

type MatchLane = { id: string; name: string; capacity: number };

const lanesInitial: MatchLane[] = [
	{ id: "lane-a", name: "Court A", capacity: 4 },
	{ id: "lane-b", name: "Court B", capacity: 4 },
];

const PlayerStatusPanel: React.FC<PlayerStatusPanelProps> = ({ open, onOpenChange, title = "Players", players, adminMode = false, onToggleStatus, onRequestChange, notice }) => {
	const [filter, setFilter] = useState("");
	const filtered = useMemo(() => players.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())), [players, filter]);

	const [showMatchmaking, setShowMatchmaking] = useState<boolean>(adminMode);
	const [lanePlayers, setLanePlayers] = useState<Record<string, PlayerItem[]>>({ "lane-a": [], "lane-b": [] });

	const benchPlayers = useMemo(() => {
		const assigned = new Set(Object.values(lanePlayers).flat().map((p) => p.id));
		return filtered.filter((p) => !assigned.has(p.id));
	}, [filtered, lanePlayers]);

	function moveToLane(laneId: string, player: PlayerItem) {
		setLanePlayers((prev) => {
			const cleaned: Record<string, PlayerItem[]> = Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((p) => p.id !== player.id)]));
			const curr = cleaned[laneId] ?? [];
			if (curr.length >= (lanesInitial.find((l) => l.id === laneId)?.capacity ?? 4)) return cleaned;
			return { ...cleaned, [laneId]: [...curr, player] };
		});
		onToggleStatus?.(player.id, "In-Game");
	}
	function moveToBench(player: PlayerItem) {
		setLanePlayers((prev) => Object.fromEntries(Object.entries(prev).map(([k, arr]) => [k, arr.filter((p) => p.id !== player.id)])));
		onToggleStatus?.(player.id, "Resting");
	}

	function onDragEnd(event: DragEndEvent) {
		const { over, active } = event;
		if (!over) return;
		const player = (active.data.current as any)?.player as PlayerItem;
		if (!player) return;
		if (over.id === "bench") return moveToBench(player);
		moveToLane(String(over.id), player);
	}

	const DraggablePlayer: React.FC<{ player: PlayerItem }> = ({ player }) => {
		const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `player-${player.id}`, data: { player } });
		const style = { opacity: isDragging ? 0.6 : 1, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined } as React.CSSProperties;
		return (
			<div ref={setNodeRef} style={style} {...listeners} {...attributes} className="flex items-center justify-between gap-2 rounded-md border p-2 bg-card">
				<span className="text-sm font-medium">{player.name}</span>
				<Badge variant={player.status === "In-Game" ? "success" : "muted"}>{player.status}</Badge>
			</div>
		);
	};

	const DroppableBox: React.FC<{ id: string; title: string; hint?: string; children?: React.ReactNode }> = ({ id, title, hint, children }) => {
		const { isOver, setNodeRef } = useDroppable({ id });
		return (
			<div ref={setNodeRef} className={`rounded-md border p-2 min-h-[96px] ${isOver ? "bg-muted/40" : "bg-card"}`}>
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold">{title}</p>
				</div>
				<div className="space-y-2">
					{children}
					{!children && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
				</div>
			</div>
		);
	};

	return (
		<ResponsiveOverlay open={open} onOpenChange={onOpenChange} title={title} ariaLabel={typeof title === 'string' ? title : 'Players'}>
			<div className="space-y-4">
					{notice && <div className="rounded-md border p-3 text-sm bg-muted/30">{notice}</div>}
					<div className="flex items-center gap-2">
						<Input placeholder="Search players" value={filter} onChange={(e) => setFilter(e.target.value)} />
						{adminMode && (
							<Button size="sm" variant="outline" onClick={() => setShowMatchmaking((v) => !v)}>
								{showMatchmaking ? "Hide Matchmaking" : "Matchmaking"}
							</Button>
						)}
					</div>

					{adminMode && showMatchmaking && (
						<DndContext onDragEnd={onDragEnd}>
							<div className="space-y-3">
								<DroppableBox id="bench" title="Bench">
									{benchPlayers.length > 0 ? benchPlayers.map((p) => <DraggablePlayer key={p.id} player={p} />) : <p className="text-xs text-muted-foreground">No players on bench</p>}
								</DroppableBox>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{lanesInitial.map((lane) => (
										<DroppableBox key={lane.id} id={lane.id} title={`${lane.name} (${(lanePlayers[lane.id] ?? []).length}/${lane.capacity})`} hint="Drop players here">
											{(lanePlayers[lane.id] ?? []).map((p) => (
												<DraggablePlayer key={p.id} player={p} />
											))}
										</DroppableBox>
									))}
								</div>
							</div>
						</DndContext>
					)}

					{/* Original list view */}
					<div className="space-y-3">
						{filtered.map((pl) => (
							<div key={pl.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">{pl.name}</span>
									<Badge variant={pl.status === "In-Game" ? "success" : "muted"}>{pl.status}</Badge>
								</div>
								<div className="flex items-center gap-2">
									{adminMode ? (
										<>
											{pl.status === "In-Game" ? (
												<Button size="sm" variant="outline" onClick={() => onToggleStatus?.(pl.id, "Resting")}>Set to Rest</Button>
											) : (
												<Button size="sm" onClick={() => onToggleStatus?.(pl.id, "In-Game")}>Set to In-Game</Button>
											)}
										</>
									) : (
										<>
											{pl.status === "In-Game" ? (
												<Button size="sm" variant="outline" onClick={() => onRequestChange?.(pl.id, "Resting")}>Request Rest</Button>
											) : (
												<Button size="sm" onClick={() => onRequestChange?.(pl.id, "In-Game")}>Request In-Game</Button>
											)}
										</>
									)}
								</div>
							</div>
						))}
						{filtered.length === 0 && (
							<p className="text-sm text-muted-foreground">No players found.</p>
						)}
					</div>
			</div>
		</ResponsiveOverlay>
	);
};

export default PlayerStatusPanel;