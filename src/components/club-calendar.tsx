import React from "react";
import { Calendar as RBCalendar, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	CalendarDays,
	Filter,
	BarChart3,
	Plus,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

// Booking-style toolbar used across pages
const BookingToolbar: React.FC<any> = (props) => {
	const { label, onNavigate, onView, view, date } = props;
	return (
		<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border-b">
			<div className="flex items-center gap-2">
				<h2 className="text-base font-semibold mr-2">Calendar</h2>
				<Button size="sm" variant="secondary" onClick={() => onNavigate("TODAY")} className="gap-1">
					<CalendarDays className="h-4 w-4" />
					Today
				</Button>
				<Button size="icon" variant="outline" onClick={() => onNavigate("PREV")}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button size="icon" variant="outline" onClick={() => onNavigate("NEXT")}>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<span className="text-sm font-semibold ml-2">{label}</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="inline-flex rounded-md border bg-background p-0.5">
					{[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
						<button
							key={v}
							onClick={() => onView(v)}
							className={`h-8 px-3 text-sm rounded-[6px] ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
						>
							{v === Views.MONTH ? "Month" : v === Views.WEEK ? "Week" : "Day"}
						</button>
					))}
				</div>

				<div className="hidden md:flex items-center gap-2">
					<div className="relative">
						<Input
							className="h-8 pl-8 w-[210px]"
							defaultValue={date ? `${new Date(date).toLocaleDateString()} - ${new Date(date).toLocaleDateString()}` : ""}
						/>
						<CalendarDays className="absolute left-2 top-1.5 h-5 w-5 text-muted-foreground" />
					</div>
					<Button size="icon" variant="outline" title="Reports">
						<BarChart3 className="h-4 w-4" />
					</Button>
					<Button size="icon" variant="outline" title="Filters">
						<Filter className="h-4 w-4" />
					</Button>
				</div>

				{(props as any).onCreate && (
					<Button className="bg-orange-500 hover:bg-orange-600" onClick={(props as any).onCreate}>
						<Plus className="h-4 w-4 mr-1" />
						Create
					</Button>
				)}
			</div>
		</div>
	);
};

export type ClubCalendarProps = React.ComponentProps<typeof RBCalendar> & {
	className?: string;
	onCreate?: () => void;
};

const ClubCalendar: React.FC<ClubCalendarProps> = ({ components, style, className, ...rest }) => {
	const mergedComponents = { ...components, toolbar: BookingToolbar } as any;
	return (
		<div className={className ?? ""}>
			<RBCalendar
				components={mergedComponents}
				style={{ height: 720, ...(style ?? {}) }}
				{...rest}
			/>
		</div>
	);
};

export default ClubCalendar;