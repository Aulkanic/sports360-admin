import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, type Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface BookingEvent {
	id: string;
	title: string;
	description: string;
	type: "One-time" | "Tournament" | "Recurring" | "Open Play";
	location: string;
	available: number;
	start: Date;
	end: Date;
}

const locales = {} as any;
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales });

const initial: BookingEvent[] = [
	{ id: "b1", title: "Open Play", description: "Casual badminton", type: "Open Play", location: "Court 1", available: 8, start: new Date(), end: new Date(new Date().getTime() + 60*60*1000) },
	{ id: "b2", title: "Tennis One-time", description: "Evening session", type: "One-time", location: "Court 2", available: 4, start: new Date(), end: new Date(new Date().getTime() + 90*60*1000) },
	{ id: "b3", title: "Basketball Tournament", description: "3v3", type: "Tournament", location: "Court A", available: 12, start: new Date(), end: new Date(new Date().getTime() + 2*60*60*1000) },
];

const colorForType: Record<BookingEvent["type"], string> = {
	"One-time": "#3b82f6",
	"Tournament": "#22c55e",
	"Recurring": "#f59e0b",
	"Open Play": "#8b5cf6",
};

const BookingsCalendarPage: React.FC = () => {
	const [events] = useState<BookingEvent[]>(initial);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<"All" | BookingEvent["type"]>("All");
	const [selected, setSelected] = useState<BookingEvent | null>(null);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ name: "", email: "", players: 1 });

	const filtered = useMemo(() => {
		return events.filter((e) => {
			if (type !== "All" && e.type !== type) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				if (![e.title, e.description, e.location, e.type].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [events, type, query]);

	const rbcEvents: RBCEvent[] = useMemo(() => filtered.map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end, resource: e })), [filtered]);

	function openBooking(ev: BookingEvent) {
		setSelected(ev);
		setForm({ name: "", email: "", players: 1 });
		setOpen(true);
	}

	function saveBooking(e: React.FormEvent) {
		e.preventDefault();
		if (!form.name.trim() || !form.email.trim() || form.players <= 0) return alert("Fill all required fields");
		alert(`Booked ${selected?.title} for ${form.name}`);
		setOpen(false);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Bookings</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-64" placeholder="Search events" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
						<option value="All">All Types</option>
						<option value="One-time">One-time</option>
						<option value="Recurring">Recurring</option>
						<option value="Tournament">Tournament</option>
						<option value="Open Play">Open Play</option>
					</select>
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
						popup
						onSelectEvent={(event: RBCEvent) => openBooking((event as any).resource as BookingEvent)}
						eventPropGetter={(event: RBCEvent) => ({ style: { backgroundColor: colorForType[((event as any).resource as BookingEvent).type] } })}
						views={[Views.MONTH, Views.WEEK, Views.DAY]}
					/>
				</div>
				<div className="space-y-2">
					{filtered.map((e) => (
						<div key={e.id} className="rounded-lg border bg-card p-3 flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold">{e.title}</h3>
									<p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
								</div>
								<Badge variant="muted">{e.available} spots</Badge>
							</div>
							<p className="text-xs text-muted-foreground">{format(e.start, "PP p")} • {e.location} • {e.type}</p>
							<Button size="sm" onClick={() => openBooking(e)}>Book</Button>
						</div>
					))}
				</div>
			</div>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-md">
					<SheetHeader>
						<SheetTitle>Book Event</SheetTitle>
					</SheetHeader>
					<form onSubmit={saveBooking} className="p-4 space-y-4">
						{selected && (
							<div className="rounded-md border p-3 text-sm">
								<p className="font-medium">{selected.title}</p>
								<p className="text-muted-foreground">{format(selected.start, "PP p")} • {selected.location}</p>
								<p className="text-muted-foreground">Available: {selected.available}</p>
							</div>
						)}
						<label className="space-y-1 block">
							<span className="text-sm">Name</span>
							<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
						</label>
						<label className="space-y-1 block">
							<span className="text-sm">Email</span>
							<Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
						</label>
						<label className="space-y-1 block">
							<span className="text-sm">Players</span>
							<Input type="number" min={1} value={form.players} onChange={(e) => setForm((p) => ({ ...p, players: Number(e.target.value) }))} required />
						</label>
						<SheetFooter>
							<div className="flex gap-2">
								<Button type="submit">Confirm Booking</Button>
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default BookingsCalendarPage;