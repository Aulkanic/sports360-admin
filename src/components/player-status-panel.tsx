import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
					</div>
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