import React, { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface PlayerItem {
	id: string;
	name: string;
	status: "In-Game" | "Resting";
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

const PlayerStatusPanel: React.FC<PlayerStatusPanelProps> = ({ open, onOpenChange, title = "Players", players, adminMode = false, onToggleStatus, onRequestChange, notice }) => {
	const [filter, setFilter] = useState("");
	const filtered = players.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));

	// --- Open Play Matchmaking (drag & drop) ---
	const [showMatchmaking, setShowMatchmaking] = useState<boolean>(adminMode);
	type MatchLane = { id: string; name: string; capacity: number; players: PlayerItem[] };
	const [lanes, setLanes] = useState<MatchLane[]>([
		{ id: "lane-a", name: "Court A", capacity: 4, players: [] },
		{ id: "lane-b", name: "Court B", capacity: 4, players: [] },
	]);

	const assignedIds = new Set(lanes.flatMap((l) => l.players.map((p) => p.id)));
	const benchPlayers = filtered.filter((p) => !assignedIds.has(p.id));

	const handleDropToLane = (laneId: string, player: PlayerItem) => {
		setLanes((prev) => {
			// Remove from all lanes first
			const without = prev.map((l) => ({ ...l, players: l.players.filter((p) => p.id !== player.id) }));
			// Then add to target lane if capacity allows
			return without.map((l) =>
				l.id === laneId
					? (l.players.length < l.capacity ? { ...l, players: [...l.players, player] } : l)
					: l
			);
		});
		onToggleStatus?.(player.id, "In-Game");
	};

	const handleDropToBench = (player: PlayerItem) => {
		setLanes((prev) => prev.map((l) => ({ ...l, players: l.players.filter((p) => p.id !== player.id) })));
		onToggleStatus?.(player.id, "Resting");
	};

	const DraggablePlayer: React.FC<{ player: PlayerItem }> = ({ player }) => {
		const ref = useRef<HTMLDivElement>(null);
		const [, dragRef] = useDrag(() => ({ type: "PLAYER", item: { player } }), [player]);
		useEffect(() => { if (ref.current) dragRef(ref); }, [dragRef]);
		return (
			<div ref={ref} className="flex items-center justify-between gap-2 rounded-md border p-2 bg-card">
				<span className="text-sm font-medium">{player.name}</span>
				<Badge variant={player.status === "In-Game" ? "success" : "muted"}>{player.status}</Badge>
			</div>
		);
	};

	const DropLane: React.FC<{ lane: MatchLane }> = ({ lane }) => {
		const ref = useRef<HTMLDivElement>(null);
		const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
			accept: "PLAYER",
			drop: (item: { player: PlayerItem }) => handleDropToLane(lane.id, item.player),
			canDrop: (item: { player: PlayerItem }) => !lane.players.find((p) => p.id === item.player.id) || true, // allow moving across lanes
			collect: (monitor) => ({ canDrop: monitor.canDrop(), isOver: monitor.isOver() }),
		}), [lane]);
		useEffect(() => { if (ref.current) dropRef(ref); }, [dropRef]);
		return (
			<div ref={ref} className={`rounded-md border p-2 min-h-[96px] ${isOver && canDrop ? "bg-muted/40" : "bg-card"}`}>
				<div className="flex items-center justify-between mb-2">
					<p className="text-sm font-semibold">{lane.name}</p>
					<p className="text-xs text-muted-foreground">{lane.players.length}/{lane.capacity}</p>
				</div>
				<div className="space-y-2">
					{lane.players.map((p) => (
						<div key={p.id} className="flex items-center justify-between gap-2 rounded-md border p-2 bg-background">
							<div className="flex-1">
								<DraggablePlayer player={p} />
							</div>
							<Button size="sm" variant="outline" onClick={() => handleDropToBench(p)}>Remove</Button>
						</div>
					))}
					{lane.players.length === 0 && (
						<p className="text-xs text-muted-foreground">Drop players here</p>
					)}
				</div>
			</div>
		);
	};

	const BenchDrop: React.FC = () => {
		const ref = useRef<HTMLDivElement>(null);
		const [{ isOver }, dropRef] = useDrop(() => ({
			accept: "PLAYER",
			drop: (item: { player: PlayerItem }) => handleDropToBench(item.player),
			collect: (monitor) => ({ isOver: monitor.isOver() }),
		}), []);
		useEffect(() => { if (ref.current) dropRef(ref); }, [dropRef]);
		return (
			<div ref={ref} className={`rounded-md border p-2 ${isOver ? "bg-muted/40" : "bg-card"}`}>
				<p className="text-sm font-semibold mb-2">Bench</p>
				<div className="space-y-2">
					{benchPlayers.map((p) => (
						<DraggablePlayer key={p.id} player={p} />
					))}
					{benchPlayers.length === 0 && (
						<p className="text-xs text-muted-foreground">No players on bench</p>
					)}
				</div>
			</div>
		);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle>{title}</SheetTitle>
				</SheetHeader>
				<div className="p-4 space-y-4">
					{notice && (
						<div className="rounded-md border p-3 text-sm bg-muted/30">{notice}</div>
					)}
					<div className="flex items-center gap-2">
						<Input placeholder="Search players" value={filter} onChange={(e) => setFilter(e.target.value)} />
						{adminMode && (
							<Button size="sm" variant="outline" onClick={() => setShowMatchmaking((v) => !v)}>
								{showMatchmaking ? "Hide Matchmaking" : "Matchmaking"}
							</Button>
						)}
					</div>

					{adminMode && showMatchmaking && (
						<DndProvider backend={HTML5Backend}>
							<div className="space-y-3">
								<BenchDrop />
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{lanes.map((l) => (
										<DropLane key={l.id} lane={l} />
									))}
								</div>
							</div>
						</DndProvider>
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
			</SheetContent>
		</Sheet>
	);
};

export default PlayerStatusPanel;