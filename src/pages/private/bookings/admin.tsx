/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { urls } from "@/routes";
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
	const [activeTab, setActiveTab] = useState<"open-play" | "tournament">("open-play");

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
										<Link to={urls.openPlay}>Manage Matches</Link>
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
		</div>
	);
};

export default BookingsAdminPage;