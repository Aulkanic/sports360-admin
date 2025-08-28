/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface BookingItem {
	id: string;
	eventTitle: string;
	type: "One-time" | "Tournament" | "Recurring" | "Open Play" | "Court Rental";
	when: string;
	location: string;
	name: string;
	email: string;
	players: number;
	status: "Pending" | "Approved" | "Rejected";
	roster?: { id: string; name: string; status: "In-Game" | "Resting" }[];
	notice?: string;
}

type OpenPlayParticipant = { id: string; name: string; avatar: string; status: "In-Game" | "Resting" };
type OpenPlayMatch = { id: string; court: string; players: string[]; status: "Scheduled" | "Live" | "Completed"; score?: string };
type OpenPlaySession = { id: string; title: string; when: string; location: string; level: Array<"Beginner" | "Intermediate" | "Advanced">; participants: OpenPlayParticipant[]; matches: OpenPlayMatch[] };

type TournamentTeam = { id: string; name: string; captain: string };
type TournamentMatch = { id: string; round: string; teamA: string; teamB: string; score?: string; status: "Scheduled" | "Live" | "Completed" };
type TournamentStandings = { team: string; wins: number; losses: number; points: number };
type TournamentAdmin = { id: string; title: string; dateRange: string; format: "Single Elimination" | "Round Robin"; categories: Array<"Singles" | "Doubles" | "Mixed">; entry: "Free" | "$" | "$$"; location: string; details: string; teams: TournamentTeam[]; standings: TournamentStandings[]; matches: TournamentMatch[]; playoffs: string[] };

const initial: BookingItem[] = [
	{ id: "bk1", eventTitle: "Open Play", type: "Open Play", when: "2025-08-25 18:00", location: "Court 1", name: "Alice", email: "alice@example.com", players: 2, status: "Pending", roster: [ { id: "p1", name: "Alice", status: "Resting" }, { id: "p2", name: "Bob", status: "In-Game" } ] },
	{ id: "bk2", eventTitle: "Basketball Tournament", type: "Tournament", when: "2025-08-30 10:00", location: "Court A", name: "Team X", email: "x@example.com", players: 5, status: "Approved", roster: [ { id: "p3", name: "Team X - John", status: "In-Game" }, { id: "p4", name: "Team X - Max", status: "Resting" } ] },
	{ id: "bk3", eventTitle: "Court Rental", type: "Court Rental", when: "2025-09-02 14:00", location: "Court 3", name: "Chris Parker", email: "chris@example.com", players: 4, status: "Pending", notice: "Customer requested 2-hour slot" },
];

// helpers removed (not used in admin cards now)

const BookingsAdminPage: React.FC = () => {
	const [items] = useState<BookingItem[]>(initial);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<"All" | BookingItem["status"]>("All");
	const [activeTab, setActiveTab] = useState<"open-play" | "tournament" | "recurring" | "one-time" | "court-rental">("open-play");

	// Recurring filters
	const [recurrenceType, setRecurrenceType] = useState("All");
	const [recDate, setRecDate] = useState<string>("");
	const [recVenue, setRecVenue] = useState("All");
	const [recStatus, setRecStatus] = useState("All");

	// One-time filters
	const [otDate, setOtDate] = useState<string>("");
	const [otVenue, setOtVenue] = useState("All");
	const [otSport, setOtSport] = useState("All");
	const [otStatus, setOtStatus] = useState("All");

	// Court rental filters
	const [courtType, setCourtType] = useState<"Tennis" | "Pickleball" | "Badminton">("Pickleball");
	const [courtDate, setCourtDate] = useState<string>(new Date().toISOString().slice(0,10));
	const [selectedBooking, setSelectedBooking] = useState<null | {
		id: string; ref: string; datetime: string; courtType: string; court: string; renter: string; userId: string; duration: string; total: string; status: "Confirmed" | "Pending" | "Cancelled";
	}>(null);

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

	const stats = useMemo(() => {
		const total = filtered.length;
		const approved = filtered.filter((b) => b.status === "Approved").length;
		const pending = filtered.filter((b) => b.status === "Pending").length;
		const rejected = filtered.filter((b) => b.status === "Rejected").length;
		const byType: Record<BookingItem["type"], number> = {
			"Open Play": 0,
			"Tournament": 0,
			"Recurring": 0,
			"One-time": 0,
			"Court Rental": 0,
		};
		filtered.forEach((b) => { byType[b.type]++; });
		return { total, approved, pending, rejected, byType } as const;
	}, [filtered]);

	// Dummy Open Play data
	const openPlaySessions: OpenPlaySession[] = useMemo(() => ([
		{
			id: "op-1",
			title: "Pickleball Open Play",
			when: "Fri • 7:00–9:00 PM",
			location: "Court A",
			level: ["Beginner", "Intermediate"],
			participants: [
				{ id: "u1", name: "Alice", avatar: "https://i.pravatar.cc/80?img=1", status: "In-Game" },
				{ id: "u2", name: "Bob", avatar: "https://i.pravatar.cc/80?img=2", status: "Resting" },
				{ id: "u3", name: "Chris", avatar: "https://i.pravatar.cc/80?img=3", status: "Resting" },
				{ id: "u4", name: "Dana", avatar: "https://i.pravatar.cc/80?img=4", status: "In-Game" },
			],
			matches: [
				{ id: "m1", court: "Court A", players: ["Alice", "Dana", "Bob", "Chris"], status: "Live", score: "11-9" },
				{ id: "m2", court: "Court B", players: ["Eve", "Frank", "Gina", "Hank"], status: "Scheduled" },
			],
		},
		{
			id: "op-2",
			title: "Tennis Rally Night",
			when: "Sat • 9:00–11:00 AM",
			location: "Court 3",
			level: ["Intermediate", "Advanced"],
			participants: [
				{ id: "u5", name: "Ivy", avatar: "https://i.pravatar.cc/80?img=5", status: "In-Game" },
				{ id: "u6", name: "Jack", avatar: "https://i.pravatar.cc/80?img=6", status: "Resting" },
				{ id: "u7", name: "Ken", avatar: "https://i.pravatar.cc/80?img=7", status: "Resting" },
			],
			matches: [
				{ id: "m3", court: "Court 3", players: ["Ivy", "Jack"], status: "Scheduled" },
			],
		},
	]), []);

	// Dummy Tournament data
	const tournaments: TournamentAdmin[] = useMemo(() => ([
		{
			id: "t-1",
			title: "City Championship 3v3",
			dateRange: "Aug 28 – Sep 1",
			format: "Single Elimination",
			categories: ["Singles", "Doubles"],
			entry: "$",
			location: "Court A & B",
			details: "Annual city-wide tournament with qualifiers and finals.",
			teams: [
				{ id: "tm1", name: "Falcons", captain: "Alex" },
				{ id: "tm2", name: "Wolves", captain: "Sam" },
				{ id: "tm3", name: "Tigers", captain: "Kim" },
			],
			standings: [
				{ team: "Falcons", wins: 3, losses: 0, points: 9 },
				{ team: "Wolves", wins: 2, losses: 1, points: 6 },
				{ team: "Tigers", wins: 1, losses: 2, points: 3 },
			],
			matches: [
				{ id: "mt1", round: "Group", teamA: "Falcons", teamB: "Tigers", score: "21-15", status: "Completed" },
				{ id: "mt2", round: "Group", teamA: "Wolves", teamB: "Tigers", score: "21-18", status: "Completed" },
				{ id: "mt3", round: "Semifinal", teamA: "Falcons", teamB: "Wolves", status: "Scheduled" },
			],
			playoffs: ["Semifinal: Falcons vs Wolves", "Final: Winner SF vs TBD"],
		},
		{
			id: "t-2",
			title: "Autumn Round Robin",
			dateRange: "Sep 15 – Sep 17",
			format: "Round Robin",
			categories: ["Mixed"],
			entry: "Free",
			location: "Court C",
			details: "Friendly round robin series over a weekend.",
			teams: [ { id: "tm4", name: "Aces", captain: "Ben" }, { id: "tm5", name: "Spins", captain: "Lee" } ],
			standings: [ { team: "Aces", wins: 1, losses: 0, points: 3 }, { team: "Spins", wins: 0, losses: 1, points: 0 } ],
			matches: [ { id: "mt4", round: "Round 1", teamA: "Aces", teamB: "Spins", score: "15-10", status: "Completed" } ],
			playoffs: ["Top 2 to finals"],
		},
	]), []);

	// Dummy Recurring Series
	type RecurrenceOcc = { id: string; date: string; time: string; status: "Scheduled" | "Cancelled" };
	type RecurringSeries = { id: string; title: string; pattern: string; range: string; time: string; venue: string; capacity: number; status: "Active" | "Paused" | "Ended"; occurrences: RecurrenceOcc[] };
	const recurringSeries: RecurringSeries[] = useMemo(() => ([
		{ id: "rs1", title: "Weekly Pickleball Mondays", pattern: "Every Monday", range: "Sep 2 – Nov 25", time: "7:00–9:00 PM", venue: "Court B", capacity: 16, status: "Active", occurrences: [
			{ id: "o1", date: "Sep 2", time: "7:00 PM", status: "Scheduled" },
			{ id: "o2", date: "Sep 9", time: "7:00 PM", status: "Scheduled" },
		] },
		{ id: "rs2", title: "Biweekly Tennis Drills", pattern: "Every 2 weeks", range: "Sep 10 – Dec 19", time: "6:00–8:00 PM", venue: "Court 2", capacity: 12, status: "Paused", occurrences: [
			{ id: "o3", date: "Sep 10", time: "6:00 PM", status: "Scheduled" },
		] },
	]), []);

	// Dummy One-Time events
	type OneTimeAdmin = { id: string; title: string; when: string; location: string; price: "Free" | "$" | "$$"; registered: number; status: "Upcoming" | "Completed" | "Cancelled" };
	const oneTimes: OneTimeAdmin[] = useMemo(() => ([
		{ id: "ot1", title: "Pickleball Skills Clinic", when: "Sun, Sep 8 • 10:00 AM", location: "Court C", price: "$", registered: 10, status: "Upcoming" },
		{ id: "ot2", title: "Holiday Badminton Bash", when: "Dec 20 • 6:30 PM", location: "Court A", price: "Free", registered: 24, status: "Upcoming" },
		{ id: "ot3", title: "Summer Tennis Showdown", when: "Jul 1 • 5:00 PM", location: "Court 4", price: "$$", registered: 32, status: "Completed" },
	]), []);

	// Dummy Court rentals
	type CourtSlot = { time: string; available: boolean; bookedRef?: string; renter?: string };
	type CourtDay = { id: string; courtType: "Tennis" | "Pickleball" | "Badminton"; court: string; date: string; slots: CourtSlot[] };
	const courtDays: CourtDay[] = useMemo(() => ([
		{ id: "cd1", courtType: "Pickleball", court: "Court 1", date: courtDate, slots: [
			{ time: "08:00", available: true }, { time: "09:00", available: false, bookedRef: "BR-1001", renter: "Chris" }, { time: "10:00", available: true },
		] },
		{ id: "cd2", courtType: "Pickleball", court: "Court 2", date: courtDate, slots: [
			{ time: "08:00", available: false, bookedRef: "BR-1002", renter: "Alice" }, { time: "09:00", available: true }, { time: "10:00", available: true },
		] },
		{ id: "cd3", courtType: "Tennis", court: "Court 4", date: courtDate, slots: [
			{ time: "08:00", available: true }, { time: "09:00", available: true }, { time: "10:00", available: false, bookedRef: "BR-2001", renter: "Ben" },
		] },
	]), [courtDate]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Manage Bookings</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-72" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
						<option value="All">All Status</option>
						<option value="Pending">Pending</option>
						<option value="Approved">Approved</option>
						<option value="Rejected">Rejected</option>
					</select>
				</div>
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

			{/* Breakdown by Type */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				{(([
					{ label: "Open Play", key: "Open Play" },
					{ label: "Tournament", key: "Tournament" },
					{ label: "Recurring", key: "Recurring" },
					{ label: "One-time", key: "One-time" },
					{ label: "Court Rental", key: "Court Rental" },
				]) as const).map(({ label, key }) => (
					<div key={key} className="rounded-lg bg-card p-3 border">
						<p className="text-xs text-muted-foreground">{label}</p>
						<p className="text-lg font-semibold">{stats.byType[key]}</p>
					</div>
				))}
			</div>

			{/* Admin Tabs */}
			<div className="flex items-center gap-2 border-b">
				<button onClick={() => setActiveTab("open-play")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${activeTab === "open-play" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Open Play</button>
				<button onClick={() => setActiveTab("tournament")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${activeTab === "tournament" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Tournament</button>
				<button onClick={() => setActiveTab("recurring")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${activeTab === "recurring" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Recurring</button>
				<button onClick={() => setActiveTab("one-time")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${activeTab === "one-time" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>One-Time</button>
				<button onClick={() => setActiveTab("court-rental")} className={`h-10 px-3 text-sm -mb-px border-b-2 ${activeTab === "court-rental" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Court Rental</button>
			</div>

			{activeTab === "open-play" && (
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
					{openPlaySessions.map((s) => (
						<div key={s.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-semibold">{s.title}</p>
									<div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
										<Badge variant="outline">{s.level.join(" / ")}</Badge>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><CalendarDays className="h-3.5 w-3.5" /> {s.when}</span>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><MapPin className="h-3.5 w-3.5" /> {s.location}</span>
									</div>
								</div>
								<Badge>Open Play</Badge>
							</div>
							<div>
								<p className="text-xs font-semibold mb-2">Participants</p>
								<div className="flex -space-x-2">
									{s.participants.slice(0,6).map((p) => (
										<Avatar key={p.id} className="h-7 w-7 ring-2 ring-background border">
											<AvatarImage src={p.avatar} />
										</Avatar>
									))}
								</div>
								<p className="text-xs text-muted-foreground mt-1">{s.participants.length} total</p>
							</div>
							<div>
								<p className="text-xs font-semibold mb-2">Matches</p>
								<div className="space-y-1">
									{s.matches.map((m) => (
										<div key={m.id} className="text-xs rounded-md border p-2 flex items-center justify-between">
											<span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {m.court}</span>
											<span className="truncate">{m.players.join(" • ")}</span>
											<span className="inline-flex items-center gap-2">
												<Badge variant={m.status === "Completed" ? "secondary" : m.status === "Live" ? "success" : "outline"}>{m.status}</Badge>
												{m.score && <span className="font-medium">{m.score}</span>}
											</span>
										</div>
									))}
								</div>
								<div className="mt-2 flex items-center gap-2">
									<Button size="sm" asChild>
										<Link to={`/open-play/${s.id}`}>Manage Matches</Link>
									</Button>
									<Button size="sm" variant="outline">View All</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{activeTab === "tournament" && (
				<div className="space-y-4">
					{tournaments.map((t) => (
						<div key={t.id} className="rounded-xl border bg-card p-4 space-y-3">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-semibold inline-flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-600" /> {t.title}</p>
									<div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
										<Badge variant="outline">{t.format}</Badge>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{t.dateRange}</span>
										<Badge variant="secondary">{t.categories.join(" / ")}</Badge>
										<Badge variant={t.entry === "Free" ? "success" : "secondary"}>{t.entry}</Badge>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"><MapPin className="h-3.5 w-3.5" /> {t.location}</span>
									</div>
								</div>
							</div>

						{/* Teams Registered */}
						<div>
							<p className="text-xs font-semibold mb-2">Teams Registered ({t.teams.length})</p>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
								{t.teams.map((team) => (
									<div key={team.id} className="rounded-md border p-2 text-xs">
										<p className="font-medium">{team.name}</p>
										<p className="text-muted-foreground">Captain: {team.captain}</p>
									</div>
								))}
							</div>
						</div>

						{/* Standings */}
						<div>
							<p className="text-xs font-semibold mb-2">Standings</p>
							<div className="rounded-md border overflow-hidden">
								<div className="grid grid-cols-4 bg-muted/40 text-xs font-medium p-2">
									<span>Team</span><span>W</span><span>L</span><span>Pts</span>
								</div>
								{t.standings.map((s) => (
									<div key={s.team} className="grid grid-cols-4 text-xs p-2 border-t">
										<span>{s.team}</span><span>{s.wins}</span><span>{s.losses}</span><span>{s.points}</span>
									</div>
								))}
							</div>
						</div>

						{/* Matches */}
						<div>
							<p className="text-xs font-semibold mb-2">Matches</p>
							<div className="space-y-1">
								{t.matches.map((m) => (
									<div key={m.id} className="text-xs rounded-md border p-2 flex items-center justify-between">
										<span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> {m.round}</span>
										<span className="truncate">{m.teamA} vs {m.teamB}</span>
										<span className="inline-flex items-center gap-2">
											<Badge variant={m.status === "Completed" ? "secondary" : m.status === "Live" ? "success" : "outline"}>{m.status}</Badge>
											{m.score && <span className="font-medium">{m.score}</span>}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Playoffs */}
						<div>
							<p className="text-xs font-semibold mb-2">Playoffs</p>
							<ul className="list-disc pl-5 text-xs space-y-1">
								{t.playoffs.map((p, i) => (<li key={i}>{p}</li>))}
							</ul>
						</div>

						{/* Details */}
						<div className="text-xs text-muted-foreground">{t.details}</div>
					</div>
					))}
				</div>
			)}

			{activeTab === "recurring" && (
				<div className="space-y-4">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
						<div className="text-sm text-muted-foreground">Manage recurring sessions</div>
						<div className="flex items-center gap-2">
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
								<option>All</option><option>Weekly</option><option>Biweekly</option><option>Monthly</option>
							</select>
							<input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={recDate} onChange={(e) => setRecDate(e.target.value)} />
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={recVenue} onChange={(e) => setRecVenue(e.target.value)}>
								<option>All</option><option>Court A</option><option>Court B</option><option>Court 2</option>
							</select>
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={recStatus} onChange={(e) => setRecStatus(e.target.value)}>
								<option>All</option><option>Active</option><option>Paused</option><option>Ended</option>
							</select>
							<Button>Add Recurring Session</Button>
						</div>
					</div>

					<div className="space-y-3">
						{recurringSeries.map((r) => (
							<div key={r.id} className="rounded-xl border bg-card p-3">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold">{r.title}</p>
										<div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
											<Badge variant="outline">{r.pattern}</Badge>
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{r.range}</span>
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{r.time}</span>
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border">{r.venue}</span>
											<Badge variant="secondary">Cap {r.capacity}/session</Badge>
										</div>
									</div>
									<Badge variant={r.status === "Active" ? "success" : r.status === "Paused" ? "warning" : "destructive"}>{r.status}</Badge>
								</div>
							<div className="mt-3 flex items-center gap-2 text-xs">
								<Button size="sm" variant="outline">Edit Series</Button>
								<Button size="sm">Manage Single Instance</Button>
								<Button size="sm" variant="outline">Cancel Series</Button>
							</div>
							<div className="mt-3 rounded-md border">
								<div className="grid grid-cols-3 bg-muted/40 text-xs font-medium p-2"><span>Date</span><span>Time</span><span>Status</span></div>
								{r.occurrences.map((o) => (
									<div key={o.id} className="grid grid-cols-3 text-xs p-2 border-t items-center">
										<span>{o.date}</span><span>{o.time}</span>
										<span className="flex items-center gap-2">
											<Badge variant={o.status === "Cancelled" ? "destructive" : "secondary"}>{o.status}</Badge>
											<Button size="sm" variant="outline">Modify</Button>
											<Button size="sm" variant="outline">Cancel</Button>
										</span>
									</div>
								))}
							</div>
						</div>
						))}
					</div>
				</div>
			)}

			{activeTab === "one-time" && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<div className="text-sm text-muted-foreground">Manage one-time events</div>
						<div className="flex items-center gap-2">
							<input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={otDate} onChange={(e) => setOtDate(e.target.value)} />
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={otVenue} onChange={(e) => setOtVenue(e.target.value)}>
								<option>All Venues</option><option>Court A</option><option>Court C</option>
							</select>
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={otSport} onChange={(e) => setOtSport(e.target.value)}>
								<option>All Sports</option><option>Pickleball</option><option>Tennis</option><option>Badminton</option>
							</select>
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={otStatus} onChange={(e) => setOtStatus(e.target.value)}>
								<option>All Status</option><option>Upcoming</option><option>Completed</option><option>Cancelled</option>
							</select>
							<Button>Create One-Time Event</Button>
						</div>
					</div>

					<div className="rounded-xl border overflow-hidden">
						<div className="grid grid-cols-7 bg-muted/40 text-xs font-medium p-2">
							<span>Title</span><span>Date & Time</span><span>Location</span><span>Price</span><span>Registered</span><span>Status</span><span>Actions</span>
						</div>
						{oneTimes.map((e) => (
							<div key={e.id} className="grid grid-cols-7 text-xs p-2 border-t items-center">
								<span className="font-medium">{e.title}</span>
								<span>{e.when}</span>
								<span>{e.location}</span>
								<span><Badge variant={e.price === "Free" ? "success" : "secondary"}>{e.price}</Badge></span>
								<span>{e.registered}</span>
								<span><Badge variant={e.status === "Upcoming" ? "secondary" : e.status === "Completed" ? "outline" : "destructive"}>{e.status}</Badge></span>
								<span className="flex items-center gap-2">
									<Button size="sm" variant="outline">Edit</Button>
									<Button size="sm">View Registrations</Button>
									<Button size="sm" variant="outline">Cancel</Button>
									<Button size="sm" variant="outline">Duplicate</Button>
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{activeTab === "court-rental" && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<div className="text-sm text-muted-foreground">Court availability and bookings</div>
						<div className="flex items-center gap-2">
							<select className="h-9 rounded-md border bg-background px-3 text-sm" value={courtType} onChange={(e) => setCourtType(e.target.value as any)}>
								<option>Pickleball</option><option>Tennis</option><option>Badminton</option>
							</select>
							<input type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={courtDate} onChange={(e) => setCourtDate(e.target.value)} />
							<Button>Add Court Rental</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{courtDays.filter(d => d.courtType === courtType).map((d) => (
							<div key={d.id} className="rounded-xl border bg-card p-3 space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold">{d.court} • {d.courtType}</p>
									<span className="text-xs text-muted-foreground">{d.date}</span>
								</div>
								<div className="grid grid-cols-3 gap-2">
									{d.slots.map((s) => (
										<button key={s.time} onClick={() => s.available ? setSelectedBooking({ id: d.id, ref: s.bookedRef ?? "BR-NEW", datetime: `${d.date} ${s.time}`, courtType: d.courtType, court: d.court, renter: s.renter ?? "-", userId: s.renter ? "U123" : "-", duration: "1h", total: s.renter ? "$15" : "$0", status: s.renter ? "Confirmed" : "Pending" }) : undefined} disabled={!s.available} className={`h-9 rounded-md border text-sm ${s.available ? "bg-background hover:bg-muted" : "bg-muted/50 text-muted-foreground cursor-not-allowed"}`}>
											{s.time}
										</button>
									))}
								</div>
							</div>
						))}
					</div>

					{selectedBooking && (
						<div className="rounded-xl border bg-card p-3">
							<p className="text-sm font-semibold">Booking Details</p>
							<div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
								<span>Ref: {selectedBooking.ref}</span>
								<span>Date & Time: {selectedBooking.datetime}</span>
								<span>Court: {selectedBooking.courtType} • {selectedBooking.court}</span>
								<span>Renter: {selectedBooking.renter}</span>
								<span>User ID: {selectedBooking.userId}</span>
								<span>Duration: {selectedBooking.duration}</span>
								<span>Total: {selectedBooking.total}</span>
								<span>Status: <Badge variant={selectedBooking.status === "Confirmed" ? "success" : selectedBooking.status === "Pending" ? "warning" : "destructive"}>{selectedBooking.status}</Badge></span>
							</div>
							<div className="mt-2 flex items-center gap-2">
								<Button size="sm" variant="outline">Edit</Button>
								<Button size="sm" variant="outline">Reassign Court</Button>
								<Button size="sm" variant="outline">Cancel</Button>
								<Button size="sm">Mark Paid</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default BookingsAdminPage;