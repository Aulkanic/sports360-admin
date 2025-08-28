/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from "react";
import { Calendar as RBC, dateFnsLocalizer, Views, type Event as RBCEvent } from "react-big-calendar";
import { addDays, addHours, format, getDay, parse, startOfWeek } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as CalendarIcon, Plus, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResponsiveOverlay from "@/components/responsive-overlay";

// Colors
const COLORS = {
	green: "#10B981",
	amber: "#F59E0B",
	red: "#EF4444",
	cyan: "#06B6D4",
	pink: "#EC4899",
	indigo: "#6366F1",
} as const;

const CATEGORIES = [
	{ key: "team", name: "Team Events", color: COLORS.green },
	{ key: "work", name: "Work", color: COLORS.amber },
	{ key: "external", name: "External", color: COLORS.red },
	{ key: "projects", name: "Projects", color: COLORS.cyan },
	{ key: "apps", name: "Applications", color: COLORS.pink },
	{ key: "design", name: "Design", color: COLORS.indigo },
] as const;

type CategoryKey = typeof CATEGORIES[number]["key"];

interface AppEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	category: CategoryKey;
}

const locales = {} as any;
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
	getDay,
	locales,
});

const initialEvents: AppEvent[] = [
	{ id: "e1", title: "Sprint Planning", start: new Date(), end: addHours(new Date(), 2), category: "work" },
	{ id: "e2", title: "Design Sync", start: addDays(new Date(), 1), end: addHours(addDays(new Date(), 1), 1), category: "design" },
	{ id: "e3", title: "External Review", start: addDays(new Date(), 2), end: addHours(addDays(new Date(), 2), 1), category: "external" },
];

const pillStyleFor = (colorHex: string) => ({
	backgroundColor: `${colorHex}26`,
	border: `1px solid ${colorHex}59`,
	color: "inherit",
	borderRadius: 9999,
});

const CalendarDashboardPage: React.FC = () => {
	const [events] = useState<AppEvent[]>(initialEvents);
	const [view, setView] = useState<string>(Views.MONTH);
	const [date, setDate] = useState<Date>(new Date());
	const [openCreate, setOpenCreate] = useState(false);
	const [filters, setFilters] = useState<Record<CategoryKey, boolean>>({
		team: true, work: true, external: true, projects: true, apps: true, design: true,
	});
	const rangeRef = useRef<HTMLInputElement>(null);

	const rbcEvents: RBCEvent[] = useMemo(() => (
		events
			.filter((e) => filters[e.category])
			.map((e) => ({ id: e.id, title: e.title, start: e.start, end: e.end, resource: e }))
	), [events, filters]);

	const Toolbar: React.FC<any> = (props) => {
		const { label, onNavigate, onView, view: current } = props;
		return (
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
					<p className="text-sm text-muted-foreground">Manage your calendar</p>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={() => onNavigate("TODAY")}>Today</Button>
					<Button size="icon" variant="outline" onClick={() => onNavigate("PREV")}><ChevronLeft className="h-4 w-4" /></Button>
					<Button size="icon" variant="outline" onClick={() => onNavigate("NEXT")}><ChevronRight className="h-4 w-4" /></Button>
					<span className="min-w-[160px] text-sm font-medium text-center">{label}</span>
					<div className="flex rounded-md border overflow-hidden">
						{[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
							<button key={v} onClick={() => onView(v)} className={`h-8 px-3 text-sm ${current === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>{v[0] + v.slice(1).toLowerCase()}</button>
						))}
					</div>
					<Input ref={rangeRef} type="date" className="h-8 w-[160px]" onChange={(e) => setDate(new Date(e.target.value))} />
					<Button size="icon" variant="outline"><CalendarIcon className="h-4 w-4" /></Button>
					<Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button>
					<Button onClick={() => setOpenCreate(true)} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />Create</Button>
				</div>
			</div>
		);
	};

	const EventContent: React.FC<{ event: RBCEvent }> = ({ event }) => {
		const e = (event as any).resource as AppEvent;
		const cat = CATEGORIES.find((c) => c.key === e.category)!;
		return (
			<div className="px-2 py-0.5 text-xs font-medium truncate" style={pillStyleFor(cat.color)}>
				{e.title}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			{/* Top header and toolbar */}
			<Toolbar label={format(date, "LLLL yyyy")} onNavigate={(action: string) => {
				const delta = action === "NEXT" ? 1 : action === "PREV" ? -1 : 0;
				if (action === "TODAY") setDate(new Date());
				else setDate(addDays(date, delta * (view === Views.MONTH ? 30 : view === Views.WEEK ? 7 : 1)));
			}} onView={(v: string) => setView(v)} view={view} />

			<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
				{/* Sidebar */}
				<div className="rounded-xl border bg-card p-3 shadow-sm hover:shadow transition">
					{/* Mini month picker (native for brevity) */}
					<div className="rounded-lg border p-2">
						<input type="month" className="w-full h-9 rounded-md border bg-background px-3 text-sm" onChange={(e) => setDate(new Date(e.target.value + "-01"))} />
					</div>
					<div className="mt-4">
						<p className="text-sm font-semibold">Event</p>
						<p className="text-xs text-muted-foreground">Drag and drop your event or click in the calendar</p>
					</div>
					<div className="mt-3 space-y-2">
						{CATEGORIES.map((c) => (
							<label key={c.key} className="flex items-center justify-between gap-2 cursor-pointer rounded-md px-2 py-1 border bg-background">
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
									<span className="text-sm">{c.name}</span>
								</span>
								<input type="checkbox" className="h-4 w-4" checked={filters[c.key]} onChange={(e) => setFilters((p) => ({ ...p, [c.key]: e.target.checked }))} />
							</label>
						))}
					</div>
					<div className="mt-4">
						<p className="text-sm font-semibold mb-2">Upcoming Event</p>
						<div className="space-y-2">
							{events.slice(0, 4).map((e) => {
								const cat = CATEGORIES.find((c) => c.key === e.category)!;
								return (
									<div key={e.id} className="rounded-md border bg-card p-2 flex items-center gap-2">
										<div className="h-8 w-1 rounded-full" style={{ backgroundColor: cat.color }} />
										<div className="flex-1">
											<p className="text-sm font-medium truncate">{e.title}</p>
											<p className="text-xs text-muted-foreground inline-flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />{format(e.start, "PP p")}</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
					<div className="mt-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4">
						<p className="text-sm font-semibold">Boost productivity</p>
						<p className="text-xs text-white/80">Get our Pro plan to unlock advanced scheduling</p>
						<div className="mt-2">
							<Button size="sm" className="bg-white text-gray-900 hover:bg-white/90">Upgrade</Button>
						</div>
					</div>
				</div>

				{/* Main Calendar */}
				<div className="rounded-xl border bg-card p-2 shadow-sm hover:shadow transition relative">
					<RBC
						localizer={localizer}
						events={rbcEvents}
						startAccessor="start"
						endAccessor="end"
						style={{ height: 720 }}
						view={view as any}
						onView={(v: string) => setView(v)}
						date={date}
						onNavigate={(d: Date) => setDate(d)}
						popup
						components={{ event: EventContent }}
						eventPropGetter={(event: RBCEvent) => {
							const data = (event as any).resource as AppEvent;
							const cat = CATEGORIES.find((c) => c.key === data.category)!;
							return { style: { ...pillStyleFor(cat.color) } };
						}}
					/>
					{/* Floating settings */}
					<button className="absolute top-1/2 -right-3 translate-x-full -translate-y-1/2 h-10 w-10 rounded-full shadow border bg-white inline-flex items-center justify-center">
						<Settings className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* Create overlay */}
			<ResponsiveOverlay
				open={openCreate}
				onOpenChange={setOpenCreate}
				title="Create Event"
				ariaLabel="Create Event"
				footer={(
					<div className="flex gap-2">
						<Button type="button" className="bg-orange-500 hover:bg-orange-600" form="cdp-create-form">Create</Button>
						<Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
					</div>
				)}
			>
				<form id="cdp-create-form" className="space-y-4">
					<label className="space-y-1 block">
						<span className="text-sm">Title</span>
						<Input placeholder="Event title" />
					</label>
				</form>
			</ResponsiveOverlay>
		</div>
	);
};

export default CalendarDashboardPage;