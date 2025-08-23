import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PlayerStatusPanel, { type PlayerItem } from "@/components/player-status-panel";

interface BookingItem {
	id: string;
	eventTitle: string;
	type: "One-time" | "Tournament" | "Recurring" | "Open Play";
	when: string;
	location: string;
	name: string;
	email: string;
	players: number;
	status: "Pending" | "Approved" | "Rejected";
	roster?: PlayerItem[];
	notice?: string;
}

const initial: BookingItem[] = [
	{ id: "bk1", eventTitle: "Open Play", type: "Open Play", when: "2025-08-25 18:00", location: "Court 1", name: "Alice", email: "alice@example.com", players: 2, status: "Pending", roster: [ { id: "p1", name: "Alice", status: "Resting" }, { id: "p2", name: "Bob", status: "In-Game" } ] },
	{ id: "bk2", eventTitle: "Basketball Tournament", type: "Tournament", when: "2025-08-30 10:00", location: "Court A", name: "Team X", email: "x@example.com", players: 5, status: "Approved", roster: [ { id: "p3", name: "Team X - John", status: "In-Game" }, { id: "p4", name: "Team X - Max", status: "Resting" } ] },
];

const BookingsAdminPage: React.FC = () => {
	const [items, setItems] = useState<BookingItem[]>(initial);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<"All" | BookingItem["status"]>("All");
	const [openRosterId, setOpenRosterId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		return items.filter((b) => {
			if (status !== "All" && b.status !== status) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				if (![b.eventTitle, b.name, b.email, b.location, b.type, b.status].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [items, status, query]);

	function setState(id: string, s: BookingItem["status"]) {
		setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status: s, notice: s === "Approved" ? undefined : b.notice } : b)));
	}

	function togglePlayerStatus(bookingId: string, playerId: string, to: PlayerItem["status"]) {
		setItems((prev) => prev.map((b) => {
			if (b.id !== bookingId) return b;
			const roster = (b.roster ?? []).map((p) => p.id === playerId ? { ...p, status: to } : p);
			return { ...b, roster, notice: `Player status updated: ${roster.find(p=>p.id===playerId)?.name} → ${to}` };
		}));
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Manage Bookings</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-72" placeholder="Search bookings" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
						<option value="All">All</option>
						<option value="Pending">Pending</option>
						<option value="Approved">Approved</option>
						<option value="Rejected">Rejected</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
				{filtered.map((b) => (
					<div key={b.id} className="rounded-lg border bg-card p-3 flex flex-col gap-2">
						{b.notice && (
							<div className="rounded-md border p-2 text-xs bg-muted/30">{b.notice}</div>
						)}
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold">{b.eventTitle}</p>
								<p className="text-xs text-muted-foreground">{b.type} • {b.when} • {b.location}</p>
								<p className="text-xs text-muted-foreground">{b.name} • {b.email} • {b.players} players</p>
							</div>
							<Badge variant={b.status === "Approved" ? "success" : b.status === "Pending" ? "warning" : "destructive"}>{b.status}</Badge>
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" onClick={() => setOpenRosterId(b.id)}>Players</Button>
							<Button size="sm" onClick={() => setState(b.id, "Approved")}>Approve</Button>
							<Button size="sm" variant="outline" onClick={() => setState(b.id, "Rejected")}>Reject</Button>
						</div>

						<PlayerStatusPanel
							open={openRosterId === b.id}
							onOpenChange={(v) => !v && setOpenRosterId(null)}
							title={`Players • ${b.eventTitle}`}
							players={b.roster ?? []}
							adminMode
							notice={b.notice}
							onToggleStatus={(pid, to) => togglePlayerStatus(b.id, pid, to)}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default BookingsAdminPage;