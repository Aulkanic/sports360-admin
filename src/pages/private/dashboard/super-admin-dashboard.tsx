import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { urls } from "@/routes";

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