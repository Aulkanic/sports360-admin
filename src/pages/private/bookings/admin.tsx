import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PlayerStatusPanel, { type PlayerItem } from "@/components/player-status-panel";
import { CalendarDays, MapPin, Users, Mail } from "lucide-react";

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

const typeAccent = (t: BookingItem["type"]) =>
	t === "Open Play" ? "emerald" : t === "Tournament" ? "blue" : t === "Recurring" ? "violet" : "slate";

const statusVariant = (s: BookingItem["status"]) => (s === "Approved" ? "success" : s === "Pending" ? "warning" : "destructive");

const BookingsAdminPage: React.FC = () => {
	const [items, setItems] = useState<BookingItem[]>(initial);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<"All" | BookingItem["status"]>("All");
	const [typeFilter, setTypeFilter] = useState<"All" | BookingItem["type"]>("All");
	const [openRosterId, setOpenRosterId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		return items.filter((b) => {
			if (status !== "All" && b.status !== status) return false;
			if (typeFilter !== "All" && b.type !== typeFilter) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				if (![b.eventTitle, b.name, b.email, b.location, b.type, b.status].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [items, status, typeFilter, query]);

	const stats = useMemo(() => {
		const total = filtered.length;
		const approved = filtered.filter((b) => b.status === "Approved").length;
		const pending = filtered.filter((b) => b.status === "Pending").length;
		const rejected = filtered.filter((b) => b.status === "Rejected").length;
		return { total, approved, pending, rejected };
	}, [filtered]);

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
						<option value="All">All Status</option>
						<option value="Pending">Pending</option>
						<option value="Approved">Approved</option>
						<option value="Rejected">Rejected</option>
					</select>
				</div>
			</div>

			{/* Type Tabs */}
			<div className="flex flex-wrap items-center gap-2">
				{(["All", "Open Play", "Tournament", "Recurring", "One-time"] as const).map((t) => (
					<button
						key={t}
						onClick={() => setTypeFilter(t as any)}
						className={`h-8 px-3 rounded-md border text-sm transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
					>
						{t}
					</button>
				))}
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Total</p>
					<p className="text-lg font-semibold">{stats.total}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Approved</p>
					<p className="text-lg font-semibold text-emerald-600">{stats.approved}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Pending</p>
					<p className="text-lg font-semibold text-amber-600">{stats.pending}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Rejected</p>
					<p className="text-lg font-semibold text-rose-600">{stats.rejected}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
				{filtered.map((b) => {
					const accent = typeAccent(b.type);
					return (
						<div key={b.id} className={`relative rounded-xl border bg-card p-3 flex flex-col gap-3 overflow-hidden`}> 
							{/* Colored stripe */}
							<div className={`absolute inset-y-0 left-0 w-1 bg-${accent}-500`} />
							{b.notice && (
								<div className="rounded-md border p-2 text-xs bg-muted/30">{b.notice}</div>
							)}
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="text-sm font-semibold">{b.eventTitle}</p>
									<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<Badge variant="outline">{b.type}</Badge>
										<span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {b.when}</span>
										<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.location}</span>
										<span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.players} players</span>
									</div>
									<div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {b.name} • {b.email}</div>
								</div>
								<Badge variant={statusVariant(b.status)}>{b.status}</Badge>
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
					);
				})}
			</div>

			{filtered.length === 0 && (
				<div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">No bookings found. Adjust filters or search.</div>
			)}
		</div>
	);
};

export default BookingsAdminPage;