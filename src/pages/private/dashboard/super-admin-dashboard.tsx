import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { urls } from "@/routes";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";

const SuperAdminDashboardPage: React.FC  = () => {
	const metrics = useMemo(() => ({
		members: 202,
		sports: 12,
		plans: 5,
		events: 18,
		bookingsPending: 7,
	}), []);

	const recentEvents = [
		{ id: "e1", name: "Weekly Tennis", date: "Today 6:00 PM", type: "Recurring", status: "Active" },
		{ id: "e2", name: "Basketball 3v3", date: "Sat 10:00 AM", type: "Tournament", status: "Upcoming" },
	];

	const recentBookings = [
		{ id: "bk1", title: "Open Play", who: "Alice", when: "Today 7:00 PM", status: "Pending" },
		{ id: "bk2", title: "Basketball Tournament", who: "Team X", when: "Sat 10:00 AM", status: "Approved" },
	];

	const membersTrend = useMemo(() => ([
		{ month: "Jan", members: 120 },
		{ month: "Feb", members: 140 },
		{ month: "Mar", members: 155 },
		{ month: "Apr", members: 170 },
		{ month: "May", members: 188 },
		{ month: "Jun", members: 202 },
	]), []);

	const bookingsBySport = [
		{ sport: "Tennis", bookings: 42 },
		{ sport: "Basketball", bookings: 58 },
		{ sport: "Soccer", bookings: 36 },
		{ sport: "Badminton", bookings: 24 },
	];

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">Dashboard</h1>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				<div className="rounded-lg bg-card p-4 border">
					<p className="text-xs text-muted-foreground">Members</p>
					<p className="text-2xl font-bold">{metrics.members}</p>
				</div>
				<div className="rounded-lg bg-card p-4 border">
					<p className="text-xs text-muted-foreground">Sports</p>
					<p className="text-2xl font-bold">{metrics.sports}</p>
				</div>
				<div className="rounded-lg bg-card p-4 border">
					<p className="text-xs text-muted-foreground">Plans</p>
					<p className="text-2xl font-bold">{metrics.plans}</p>
				</div>
				<div className="rounded-lg bg-card p-4 border">
					<p className="text-xs text-muted-foreground">Events</p>
					<p className="text-2xl font-bold">{metrics.events}</p>
				</div>
				<div className="rounded-lg bg-card p-4 border">
					<p className="text-xs text-muted-foreground">Pending Bookings</p>
					<p className="text-2xl font-bold">{metrics.bookingsPending}</p>
				</div>
			</div>

			{/* Insights */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2 rounded-lg bg-card border">
					<div className="flex items-center justify-between p-3 border-b">
						<h2 className="text-sm font-semibold">Members Growth</h2>
						<Badge variant="outline">Last 6 months</Badge>
					</div>
					<div className="p-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={membersTrend} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
								<defs>
									<linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#22c55e" stopOpacity={0.35}/>
										<stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
								<XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false}/>
								<YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false}/>
								<Tooltip />
								<Area type="monotone" dataKey="members" stroke="#16a34a" strokeWidth={2} fill="url(#colorMembers)"/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="rounded-lg bg-card border">
					<div className="flex items-center justify-between p-3 border-b">
						<h2 className="text-sm font-semibold">Bookings by Sport</h2>
						<Badge variant="outline">This month</Badge>
					</div>
					<div className="p-3 h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={bookingsBySport} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
								<XAxis dataKey="sport" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false}/>
								<YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false}/>
								<Tooltip />
								<Legend />
								<Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Recent & Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2 space-y-4">
					<div className="rounded-lg bg-card border">
						<div className="flex items-center justify-between p-3 border-b">
							<h2 className="text-sm font-semibold">Recent Events</h2>
							<Button asChild size="sm" variant="outline"><Link to={urls.events}>View All</Link></Button>
						</div>
						<div className="p-3 space-y-2">
							{recentEvents.map((e) => (
								<div key={e.id} className="flex items-center justify-between text-sm">
									<div>
										<p className="font-medium">{e.name}</p>
										<p className="text-muted-foreground">{e.date} • {e.type}</p>
									</div>
									<Badge variant={e.status === "Active" ? "success" : e.status === "Upcoming" ? "warning" : "muted"}>{e.status}</Badge>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-lg bg-card border">
						<div className="flex items-center justify-between p-3 border-b">
							<h2 className="text-sm font-semibold">Recent Bookings</h2>
							<Button asChild size="sm" variant="outline"><Link to={urls.bookingsAdmin}>Manage</Link></Button>
						</div>
						<div className="p-3 space-y-2">
							{recentBookings.map((b) => (
								<div key={b.id} className="flex items-center justify-between text-sm">
									<div>
										<p className="font-medium">{b.title}</p>
										<p className="text-muted-foreground">{b.who} • {b.when}</p>
									</div>
									<Badge variant={b.status === "Approved" ? "success" : b.status === "Pending" ? "warning" : "muted"}>{b.status}</Badge>
								</div>
							))}
						</div>
					</div>
				</div>

			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
				<Button asChild><Link to={urls.members}>Go to Members</Link></Button>
				<Button asChild><Link to={urls.sports}>Manage Sports</Link></Button>
				<Button asChild><Link to={urls.plans}>Membership Plans</Link></Button>
				<Button asChild><Link to={urls.events}>Events & Calendar</Link></Button>
			</div>
		</div>
	);
}

export default SuperAdminDashboardPage;