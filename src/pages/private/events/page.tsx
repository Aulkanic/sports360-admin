import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, dateFnsLocalizer, Views, type SlotInfo, type Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface ClubEvent {
	id: string;
	name: string;
	description: string;
	type: "Recurring" | "One-time" | "Tournament";
	status: "Active" | "Upcoming" | "Completed";
	location: string;
	maxParticipants: number;
	start: Date;
	end: Date;
	// Recurring
	recurring?: {
		frequency: "Daily" | "Weekly" | "Monthly";
		timeSlot?: string; // e.g., 18:00-20:00
	};
	// Tournament
	tournament?: {
		tournamentType: "Knockout" | "Round-robin" | "League";
		prizes?: string;
		participants?: string[];
		rounds?: number;
		matchSchedule?: string; // freeform notes
	};
}

const locales = {} as any;
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
	getDay,
	locales,
});

const initialEvents: ClubEvent[] = [
	{ id: "e1", name: "Weekly Tennis", description: "Club tennis night", type: "Recurring", status: "Active", location: "Court 2", maxParticipants: 16, start: new Date(), end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), recurring: { frequency: "Weekly", timeSlot: "18:00-20:00" } },
	{ id: "e2", name: "Basketball Tournament", description: "3v3 open tournament", type: "Tournament", status: "Upcoming", location: "Court A", maxParticipants: 24, start: new Date(), end: new Date(new Date().getTime() + 3 * 60 * 60 * 1000), tournament: { tournamentType: "Knockout", prizes: "Trophies + Vouchers", participants: ["Team A", "Team B"], rounds: 3, matchSchedule: "Quarter -> Semi -> Final" } },
];

const EventsPage: React.FC = () => {
	const [events, setEvents] = useState<ClubEvent[]>(initialEvents);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<"All" | ClubEvent["type"]>("All");
	const [status, setStatus] = useState<"All" | ClubEvent["status"]>("All");
	const [location, setLocation] = useState("");

	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<ClubEvent | null>(null);
	const [form, setForm] = useState<Omit<ClubEvent, "id">>({
		name: "",
		description: "",
		type: "One-time",
		status: "Upcoming",
		location: "",
		maxParticipants: 0,
		start: new Date(),
		end: new Date(new Date().getTime() + 60 * 60 * 1000),
		recurring: undefined,
		tournament: undefined,
	});
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		return events.filter((e) => {
			if (type !== "All" && e.type !== type) return false;
			if (status !== "All" && e.status !== status) return false;
			if (location && !e.location.toLowerCase().includes(location.toLowerCase())) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				if (![e.name, e.description, e.location, e.type, e.status].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [events, type, status, location, query]);

	function openCreate(slot?: SlotInfo) {
		setEditing(null);
		setForm({
			name: "",
			description: "",
			type: "One-time",
			status: "Upcoming",
			location: "",
			maxParticipants: 0,
			start: slot?.start ?? new Date(),
			end: slot?.end ?? new Date(new Date().getTime() + 60 * 60 * 1000),
			recurring: undefined,
			tournament: undefined,
		});
		setOpen(true);
	}

	function openEdit(ev: ClubEvent) {
		setEditing(ev);
		setForm({ ...ev, // shallow copy, fine for primitives and simple structures
			start: new Date(ev.start),
			end: new Date(ev.end),
		});
		setOpen(true);
	}

	function validate(): string | null {
		if (!form.name.trim()) return "Event name is required";
		if (!form.description.trim()) return "Description is required";
		if (!form.location.trim()) return "Location is required";
		if (isNaN(Number(form.maxParticipants)) || Number(form.maxParticipants) <= 0) return "Max participants must be a positive number";
		if (form.end <= form.start) return "End time must be after start time";
		if (form.type === "Recurring") {
			if (!form.recurring?.frequency) return "Recurring frequency is required";
		}
		if (form.type === "Tournament") {
			if (!form.tournament?.tournamentType) return "Tournament type is required";
			if (!form.tournament?.rounds || form.tournament?.rounds <= 0) return "Rounds must be a positive number";
		}
		return null;
	}

	function save(e: React.FormEvent) {
		e.preventDefault();
		const error = validate();
		if (error) return alert(error);
		if (editing) setEvents((prev) => prev.map((ev) => (ev.id === editing.id ? { id: editing.id, ...form } as ClubEvent : ev)));
		else setEvents((prev) => [{ id: `e${Date.now()}`, ...form } as ClubEvent, ...prev]);
		setOpen(false);
	}

	function remove(id: string) { setConfirmId(id); }
	function doDelete() { if (confirmId) setEvents((prev) => prev.filter((e) => e.id !== confirmId)); setConfirmId(null); }

	const rbcEvents: RBCEvent[] = useMemo(() => filtered.map((e) => ({ id: e.id, title: e.name, start: new Date(e.start), end: new Date(e.end), resource: e })), [filtered]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Events</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-64" placeholder="Search name, desc, location" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
						<option value="All">All Types</option>
						<option value="One-time">One-time</option>
						<option value="Recurring">Recurring</option>
						<option value="Tournament">Tournament</option>
					</select>
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
						<option value="All">All Status</option>
						<option value="Upcoming">Upcoming</option>
						<option value="Active">Active</option>
						<option value="Completed">Completed</option>
					</select>
					<Input className="w-full md:w-48" placeholder="Filter location" value={location} onChange={(e) => setLocation(e.target.value)} />
					<Button onClick={() => openCreate()}>Add New Event</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 rounded-xl border bg-card p-2">
					<Calendar
						localizer={localizer}
						events={rbcEvents}
						startAccessor="start"
						endAccessor="end"
						style={{ height: 520 }}
						selectable
						popup
						onSelectSlot={(slot: SlotInfo) => openCreate(slot)}
						onSelectEvent={(event: RBCEvent) => openEdit((event as any).resource as ClubEvent)}
						views={[Views.MONTH, Views.WEEK, Views.DAY]}
					/>
				</div>
				<div className="space-y-2">
					{filtered.map((e) => (
						<div key={e.id} className="rounded-lg border bg-card p-3 flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold">{e.name}</h3>
									<p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
								</div>
								<Badge variant={e.status === "Active" ? "success" : e.status === "Upcoming" ? "warning" : "muted"}>{e.status}</Badge>
							</div>
							<p className="text-xs text-muted-foreground">{format(e.start, "PP p")} • {e.location} • {e.type}</p>
							<div className="flex items-center gap-2">
								<Button size="sm" onClick={() => openEdit(e)}>Edit</Button>
								<Button size="sm" variant="destructive" onClick={() => remove(e.id)}>Delete</Button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Add/Edit Event Sheet */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit Event" : "Add Event"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={save} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Event Name</span>
								<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Description</span>
								<textarea className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Event Type</span>
								<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ClubEvent["type"], recurring: e.target.value === "Recurring" ? { frequency: "Weekly" } : undefined, tournament: e.target.value === "Tournament" ? { tournamentType: "Knockout", rounds: 1 } : undefined }))}>
									<option value="One-time">One-time</option>
									<option value="Recurring">Recurring</option>
									<option value="Tournament">Tournament</option>
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ClubEvent["status"] }))}>
									<option value="Upcoming">Upcoming</option>
									<option value="Active">Active</option>
									<option value="Completed">Completed</option>
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Location</span>
								<Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Max Participants</span>
								<Input type="number" min={1} value={form.maxParticipants} onChange={(e) => setForm((p) => ({ ...p, maxParticipants: Number(e.target.value) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Start</span>
								<Input type="datetime-local" value={format(form.start, "yyyy-MM-dd'T'HH:mm")} onChange={(e) => setForm((p) => ({ ...p, start: new Date(e.target.value) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">End</span>
								<Input type="datetime-local" value={format(form.end, "yyyy-MM-dd'T'HH:mm")} onChange={(e) => setForm((p) => ({ ...p, end: new Date(e.target.value) }))} required />
							</label>
						</div>

						{form.type === "Recurring" && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="space-y-1">
									<span className="text-sm">Frequency</span>
									<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.recurring?.frequency} onChange={(e) => setForm((p) => ({ ...p, recurring: { ...(p.recurring ?? { frequency: "Weekly" }), frequency: e.target.value as any } }))}>
										<option value="Daily">Daily</option>
										<option value="Weekly">Weekly</option>
										<option value="Monthly">Monthly</option>
									</select>
								</label>
								<label className="space-y-1">
									<span className="text-sm">Time Slot</span>
									<Input placeholder="e.g., 18:00-20:00" value={form.recurring?.timeSlot ?? ""} onChange={(e) => setForm((p) => ({ ...p, recurring: { ...(p.recurring ?? { frequency: "Weekly" }), timeSlot: e.target.value } }))} />
								</label>
							</div>
						)}

						{form.type === "Tournament" && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="space-y-1">
									<span className="text-sm">Tournament Type</span>
									<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.tournament?.tournamentType} onChange={(e) => setForm((p) => ({ ...p, tournament: { ...(p.tournament ?? { tournamentType: "Knockout", rounds: 1 }), tournamentType: e.target.value as any } }))}>
										<option value="Knockout">Knockout</option>
										<option value="Round-robin">Round-robin</option>
										<option value="League">League</option>
									</select>
								</label>
								<label className="space-y-1">
									<span className="text-sm">Rounds</span>
									<Input type="number" min={1} value={form.tournament?.rounds ?? 1} onChange={(e) => setForm((p) => ({ ...p, tournament: { ...(p.tournament ?? { tournamentType: "Knockout", rounds: 1 }), rounds: Number(e.target.value) } }))} />
								</label>
								<label className="space-y-1 md:col-span-2">
									<span className="text-sm">Prizes</span>
									<Input placeholder="Describe prizes" value={form.tournament?.prizes ?? ""} onChange={(e) => setForm((p) => ({ ...p, tournament: { ...(p.tournament ?? { tournamentType: "Knockout", rounds: 1 }), prizes: e.target.value } }))} />
								</label>
								<label className="space-y-1 md:col-span-2">
									<span className="text-sm">Match Schedule Notes</span>
									<textarea className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm" value={form.tournament?.matchSchedule ?? ""} onChange={(e) => setForm((p) => ({ ...p, tournament: { ...(p.tournament ?? { tournamentType: "Knockout", rounds: 1 }), matchSchedule: e.target.value } }))} />
								</label>
								<label className="space-y-1 md:col-span-2">
									<span className="text-sm">Participants (comma-separated)</span>
									<Input placeholder="Team A, Team B, ..." value={(form.tournament?.participants ?? []).join(", ")} onChange={(e) => setForm((p) => ({ ...p, tournament: { ...(p.tournament ?? { tournamentType: "Knockout", rounds: 1 }), participants: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } }))} />
								</label>
							</div>
						)}

						<SheetFooter>
							<div className="flex gap-2">
								<Button type="submit">Save</Button>
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation */}
			{confirmId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-card rounded-lg border w-full max-w-sm p-4 space-y-3">
						<h3 className="text-base font-semibold">Delete Event</h3>
						<p className="text-sm text-muted-foreground">Are you sure you want to delete this event?</p>
						<div className="flex items-center justify-end gap-2">
							<Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
							<Button variant="destructive" onClick={doDelete}>Delete</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EventsPage;