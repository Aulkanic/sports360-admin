/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import CustomDataTable from "@/components/custom-data-table";

// Cell Renderer Components
const CustomerCellRenderer = (params: any) => {
	return (
		<div className="py-1">
			<div className="font-medium text-sm mb-0.5">{params.data.name}</div>
			<div className="text-xs text-gray-600 mb-0.5">{params.data.email}</div>
			<div className="text-xs text-gray-500">{params.data.phone}</div>
		</div>
	);
};

const EventDetailsCellRenderer = (params: any) => {
	return (
		<div className="py-1">
			<div className="font-medium text-sm mb-0.5">{params.data.eventTitle}</div>
			<div className="text-xs text-gray-600 mb-0.5">📅 {params.data.when}</div>
			<div className="text-xs text-gray-600">📍 {params.data.location}</div>
		</div>
	);
};

const TypeCellRenderer = (params: any) => {
	const typeColors = {
		"Open Play": "bg-blue-100 text-blue-800 border-blue-200",
		"Tournament": "bg-orange-100 text-orange-800 border-orange-200",
		"Recurring": "bg-purple-100 text-purple-800 border-purple-200",
		"One-time": "bg-green-100 text-green-800 border-green-200",
		"Court Rental": "bg-pink-100 text-pink-800 border-pink-200"
	};
	
	const colorClass = typeColors[params.value as keyof typeof typeColors] || typeColors["One-time"];
	
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
			{params.value}
		</span>
	);
};

const StatusCellRenderer = (params: any) => {
	const statusConfig = {
		"Approved": { bg: "bg-green-100", color: "text-green-800", border: "border-green-200", icon: "✅" },
		"Pending": { bg: "bg-yellow-100", color: "text-yellow-800", border: "border-yellow-200", icon: "⏳" },
		"Rejected": { bg: "bg-red-100", color: "text-red-800", border: "border-red-200", icon: "❌" },
		"Cancelled": { bg: "bg-gray-100", color: "text-gray-800", border: "border-gray-200", icon: "🚫" },
		"Completed": { bg: "bg-blue-100", color: "text-blue-800", border: "border-blue-200", icon: "✅" }
	};
	
	const config = statusConfig[params.value as keyof typeof statusConfig] || statusConfig.Pending;
	
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${config.bg} ${config.color} ${config.border}`}>
			{config.icon} {params.value}
		</span>
	);
};

const PaymentStatusCellRenderer = (params: any) => {
	const paymentConfig = {
		"Paid": { bg: "bg-green-100", color: "text-green-800", border: "border-green-200", icon: "💰" },
		"Pending": { bg: "bg-yellow-100", color: "text-yellow-800", border: "border-yellow-200", icon: "⏳" },
		"Partial": { bg: "bg-orange-100", color: "text-orange-800", border: "border-orange-200", icon: "💳" },
		"Refunded": { bg: "bg-blue-100", color: "text-blue-800", border: "border-blue-200", icon: "↩️" },
		"Failed": { bg: "bg-red-100", color: "text-red-800", border: "border-red-200", icon: "❌" }
	};
	
	const config = paymentConfig[params.value as keyof typeof paymentConfig] || paymentConfig.Pending;
	
	return (
		<span className={`px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${config.bg} ${config.color} ${config.border}`}>
			{config.icon} {params.value}
		</span>
	);
};

const AmountCellRenderer = (params: any) => {
	const isFullyPaid = params.data.paidAmount >= params.data.amount;
	const isPartiallyPaid = params.data.paidAmount > 0 && params.data.paidAmount < params.data.amount;
	
	return (
		<div className="py-1">
			<div className="font-semibold text-sm text-gray-900">₱{params.data.amount.toFixed(2)}</div>
			{isFullyPaid ? (
				<div className="text-xs text-green-600 font-medium">✅ Paid in full</div>
			) : isPartiallyPaid ? (
				<div className="text-xs text-orange-600 font-medium">💳 Paid: ₱{params.data.paidAmount.toFixed(2)}</div>
			) : (
				<div className="text-xs text-red-600 font-medium">⏳ Payment pending</div>
			)}
		</div>
	);
};

const PaymentMethodCellRenderer = (params: any) => {
	const methodIcons = {
		"Credit Card": "💳",
		"Online Payment": "🌐",
		"Bank Transfer": "🏦",
		"Cash": "💵"
	};
	
	const icon = methodIcons[params.value as keyof typeof methodIcons] || "💳";
	
	return (
		<div className="flex items-center gap-1.5 py-1">
			<span className="text-sm">{icon}</span>
			<span className="text-xs text-gray-700">{params.value}</span>
		</div>
	);
};

const PlayersCellRenderer = (params: any) => {
	return (
		<div className="flex items-center gap-1.5 py-1">
			<span className="text-sm">👥</span>
			<span className="font-medium text-sm">{params.value}</span>
		</div>
	);
};

const ActionsCellRenderer = (params: any) => {
	const handleView = () => {
		console.log("View booking:", params.data.id);
		// TODO: Implement view booking modal
	};
	
	const handleEdit = () => {
		console.log("Edit booking:", params.data.id);
		// TODO: Implement edit booking modal
	};
	
	return (
		<div className="flex gap-1.5 py-1">
			<Button
				variant="outline"
				size="sm"
				onClick={handleView}
				className="h-7 px-2 text-xs"
			>
				👁️ View
			</Button>
			<Button
				size="sm"
				onClick={handleEdit}
				className="h-7 px-2 text-xs bg-[#FF5C00] hover:bg-[#e55100] text-white border-[#FF5C00]"
			>
				✏️ Edit
			</Button>
		</div>
	);
};

interface BookingItem {
	id: string;
	bookingRef: string;
	eventTitle: string;
	type: "One-time" | "Tournament" | "Recurring" | "Open Play" | "Court Rental";
	when: string;
	location: string;
	name: string;
	email: string;
	phone?: string;
	players: number;
	status: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";
	paymentStatus: "Pending" | "Paid" | "Partial" | "Refunded" | "Failed";
	paymentMethod?: "Cash" | "Credit Card" | "Bank Transfer" | "Online Payment";
	amount: number;
	paidAmount: number;
	currency: string;
	roster?: { id: string; name: string; status: "In-Game" | "Resting" }[];
	notice?: string;
	createdAt: string;
	updatedAt: string;
	adminNotes?: string;
}

const initial: BookingItem[] = [
	{ 
		id: "bk1", 
		bookingRef: "BK-2024-001", 
		eventTitle: "Pickleball Open Play", 
		type: "Open Play", 
		when: "2025-01-20 18:00", 
		location: "Court 1", 
		name: "Alice Johnson", 
		email: "alice.johnson@email.com", 
		phone: "+1-555-0123",
		players: 4, 
		status: "Pending", 
		paymentStatus: "Pending",
		paymentMethod: "Credit Card",
		amount: 25.00,
		paidAmount: 0.00,
		currency: "PHP",
		createdAt: "2024-01-15T10:30:00Z",
		updatedAt: "2024-01-15T10:30:00Z",
		adminNotes: "New player, first time booking"
	},
	{ 
		id: "bk2", 
		bookingRef: "BK-2024-002", 
		eventTitle: "Basketball Tournament", 
		type: "Tournament", 
		when: "2025-01-25 10:00", 
		location: "Court A", 
		name: "Marcus Thompson", 
		email: "marcus.thompson@email.com", 
		phone: "+1-555-0124",
		players: 12, 
		status: "Approved", 
		paymentStatus: "Paid",
		paymentMethod: "Online Payment",
		amount: 150.00,
		paidAmount: 150.00,
		currency: "PHP",
		createdAt: "2024-01-14T14:20:00Z",
		updatedAt: "2024-01-15T09:15:00Z",
		adminNotes: "Tournament registration confirmed"
	},
	{ 
		id: "bk3", 
		bookingRef: "BK-2024-003", 
		eventTitle: "Tennis Court Rental", 
		type: "Court Rental", 
		when: "2025-01-22 14:00", 
		location: "Court 3", 
		name: "Chris Parker", 
		email: "chris.parker@email.com", 
		phone: "+1-555-0125",
		players: 2, 
		status: "Pending", 
		paymentStatus: "Partial",
		paymentMethod: "Bank Transfer",
		amount: 80.00,
		paidAmount: 40.00,
		currency: "PHP",
		notice: "Customer requested 2-hour slot",
		createdAt: "2024-01-15T16:45:00Z",
		updatedAt: "2024-01-15T16:45:00Z",
		adminNotes: "Partial payment received, waiting for remainder"
	},
	{ 
		id: "bk4", 
		bookingRef: "BK-2024-004", 
		eventTitle: "Weekly Pickleball League", 
		type: "Recurring", 
		when: "2025-01-21 19:00", 
		location: "Court 2", 
		name: "Sarah Wilson", 
		email: "sarah.wilson@email.com", 
		phone: "+1-555-0126",
		players: 8, 
		status: "Approved", 
		paymentStatus: "Paid",
		paymentMethod: "Cash",
		amount: 60.00,
		paidAmount: 60.00,
		currency: "PHP",
		createdAt: "2024-01-13T11:20:00Z",
		updatedAt: "2024-01-14T08:30:00Z",
		adminNotes: "Weekly league session"
	},
	{ 
		id: "bk5", 
		bookingRef: "BK-2024-005", 
		eventTitle: "Tennis Skills Clinic", 
		type: "One-time", 
		when: "2025-01-23 16:00", 
		location: "Court 4", 
		name: "Mike Davis", 
		email: "mike.davis@email.com", 
		phone: "+1-555-0127",
		players: 12, 
		status: "Rejected", 
		paymentStatus: "Refunded",
		paymentMethod: "Credit Card",
		amount: 120.00,
		paidAmount: 0.00,
		currency: "PHP",
		createdAt: "2024-01-12T13:15:00Z",
		updatedAt: "2024-01-15T10:00:00Z",
		adminNotes: "Court unavailable due to maintenance"
	},
	{ 
		id: "bk6", 
		bookingRef: "BK-2024-006", 
		eventTitle: "Badminton Doubles", 
		type: "Open Play", 
		when: "2025-01-24 20:00", 
		location: "Court 5", 
		name: "Jennifer Lee", 
		email: "jennifer.lee@email.com", 
		phone: "+1-555-0128",
		players: 4, 
		status: "Approved", 
		paymentStatus: "Paid",
		paymentMethod: "Online Payment",
		amount: 30.00,
		paidAmount: 30.00,
		currency: "PHP",
		createdAt: "2024-01-16T09:15:00Z",
		updatedAt: "2024-01-16T09:15:00Z",
		adminNotes: "Regular player, always on time"
	},
	{ 
		id: "bk7", 
		bookingRef: "BK-2024-007", 
		eventTitle: "Corporate Team Building", 
		type: "Court Rental", 
		when: "2025-01-26 12:00", 
		location: "Court 1 & 2", 
		name: "David Rodriguez", 
		email: "david.rodriguez@company.com", 
		phone: "+1-555-0129",
		players: 16, 
		status: "Approved", 
		paymentStatus: "Paid",
		paymentMethod: "Bank Transfer",
		amount: 200.00,
		paidAmount: 200.00,
		currency: "PHP",
		createdAt: "2024-01-10T14:30:00Z",
		updatedAt: "2024-01-15T11:20:00Z",
		adminNotes: "Corporate event, requires setup"
	},
	{ 
		id: "bk8", 
		bookingRef: "BK-2024-008", 
		eventTitle: "Youth Tennis Training", 
		type: "One-time", 
		when: "2025-01-27 15:00", 
		location: "Court 3", 
		name: "Lisa Chen", 
		email: "lisa.chen@email.com", 
		phone: "+1-555-0130",
		players: 8, 
		status: "Pending", 
		paymentStatus: "Pending",
		paymentMethod: "Credit Card",
		amount: 90.00,
		paidAmount: 0.00,
		currency: "PHP",
		createdAt: "2024-01-17T16:45:00Z",
		updatedAt: "2024-01-17T16:45:00Z",
		adminNotes: "Youth program, needs instructor approval"
	},
	{ 
		id: "bk9", 
		bookingRef: "BK-2024-009", 
		eventTitle: "Senior Pickleball", 
		type: "Recurring", 
		when: "2025-01-28 10:00", 
		location: "Court 4", 
		name: "Robert Brown", 
		email: "robert.brown@email.com", 
		phone: "+1-555-0131",
		players: 6, 
		status: "Approved", 
		paymentStatus: "Paid",
		paymentMethod: "Cash",
		amount: 45.00,
		paidAmount: 45.00,
		currency: "PHP",
		createdAt: "2024-01-08T12:00:00Z",
		updatedAt: "2024-01-14T10:30:00Z",
		adminNotes: "Senior group, weekly regulars"
	},
	{ 
		id: "bk10", 
		bookingRef: "BK-2024-010", 
		eventTitle: "Mixed Doubles Tournament", 
		type: "Tournament", 
		when: "2025-01-29 09:00", 
		location: "All Courts", 
		name: "Amanda Foster", 
		email: "amanda.foster@email.com", 
		phone: "+1-555-0132",
		players: 24, 
		status: "Approved", 
		paymentStatus: "Partial",
		paymentMethod: "Online Payment",
		amount: 300.00,
		paidAmount: 150.00,
		currency: "PHP",
		createdAt: "2024-01-05T10:00:00Z",
		updatedAt: "2024-01-16T14:20:00Z",
		adminNotes: "Large tournament, final payment due next week"
	},
	{ 
		id: "bk11", 
		bookingRef: "BK-2024-011", 
		eventTitle: "Private Tennis Lesson", 
		type: "Court Rental", 
		when: "2025-01-30 17:00", 
		location: "Court 1", 
		name: "James Wilson", 
		email: "james.wilson@email.com", 
		phone: "+1-555-0133",
		players: 2, 
		status: "Completed", 
		paymentStatus: "Paid",
		paymentMethod: "Credit Card",
		amount: 75.00,
		paidAmount: 75.00,
		currency: "PHP",
		createdAt: "2024-01-18T13:15:00Z",
		updatedAt: "2024-01-19T17:30:00Z",
		adminNotes: "Private lesson completed successfully"
	},
	{ 
		id: "bk12", 
		bookingRef: "BK-2024-012", 
		eventTitle: "Badminton Open Play", 
		type: "Open Play", 
		when: "2025-01-31 19:30", 
		location: "Court 5", 
		name: "Maria Garcia", 
		email: "maria.garcia@email.com", 
		phone: "+1-555-0134",
		players: 6, 
		status: "Cancelled", 
		paymentStatus: "Refunded",
		paymentMethod: "Online Payment",
		amount: 35.00,
		paidAmount: 0.00,
		currency: "PHP",
		createdAt: "2024-01-19T11:20:00Z",
		updatedAt: "2024-01-20T08:45:00Z",
		adminNotes: "Customer cancelled due to illness, full refund processed"
	}
];

const BookingsAdminPage: React.FC = () => {
	const [items] = useState<BookingItem[]>(initial);
	const [loading, setLoading] = useState(false);

	// AG Grid column definitions
	const columnDefs = useMemo(() => [
		{
			headerName: "Booking Ref",
			field: "bookingRef",
			flex: 1,
			pinned: "left",
			cellStyle: { fontWeight: "bold", color: "#FF5C00" }
		},
		{
			headerName: "Customer",
			field: "name",
			flex: 1,
			cellRenderer: CustomerCellRenderer
		},
		{
			headerName: "Event Details",
			field: "eventTitle",
			flex: 1,
			cellRenderer: EventDetailsCellRenderer
		},
		{
			headerName: "Type",
			field: "type",
			flex: 1,
			cellRenderer: TypeCellRenderer
		},
		{
			headerName: "Status",
			field: "status",
			flex: 1,
			cellRenderer: StatusCellRenderer
		},
		{
			headerName: "Payment",
			field: "paymentStatus",
			flex: 1,
			cellRenderer: PaymentStatusCellRenderer
		},
		{
			headerName: "Amount",
			field: "amount",
			flex: 1,
			cellRenderer: AmountCellRenderer
		},
		{
			headerName: "Payment Method",
			field: "paymentMethod",
			flex: 1,
			cellRenderer: PaymentMethodCellRenderer
		},
		{
			headerName: "Players",
			field: "players",
			flex: 1,
			cellRenderer: PlayersCellRenderer
		},
		{
			headerName: "Actions",
			field: "actions",
			flex: 1,
			width: 200,
			pinned: "right",
			cellRenderer: ActionsCellRenderer
		}
	], []);




	// Calculate quick stats
	const stats = useMemo(() => {
		const total = items.length;
		const approved = items.filter(b => b.status === "Approved").length;
		const pending = items.filter(b => b.status === "Pending").length;
		const paid = items.filter(b => b.paymentStatus === "Paid").length;
		const totalRevenue = items.reduce((sum, b) => sum + b.paidAmount, 0);
		const pendingRevenue = items.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0);
		
		return { total, approved, pending, paid, totalRevenue, pendingRevenue };
	}, [items]);

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/20">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-foreground mb-2">📋 Manage Bookings</h1>
						<p className="text-muted-foreground">Comprehensive booking management and payment tracking</p>
					</div>
					<div className="flex items-center gap-3">
						<Button onClick={() => setLoading(!loading)} variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
							{loading ? "⏹️ Stop Loading" : "🔄 Test Loading"}
						</Button>
						<Button size="sm" className="bg-primary hover:bg-primary/90">
							➕ Add New Booking
						</Button>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg">
							<span className="text-primary text-lg">📊</span>
				</div>
						<div>
							<p className="text-xs text-muted-foreground">Total Bookings</p>
							<p className="text-lg font-bold text-foreground">{stats.total}</p>
			</div>
					</div>
			</div>

				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 rounded-lg">
							<span className="text-green-600 text-lg">✅</span>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Approved</p>
							<p className="text-lg font-bold text-green-600">{stats.approved}</p>
						</div>
							</div>
						</div>

				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-yellow-100 rounded-lg">
							<span className="text-yellow-600 text-lg">⏳</span>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Pending</p>
							<p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
						</div>
					</div>
				</div>
				
				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-lg">
							<span className="text-blue-600 text-lg">💰</span>
						</div>
									<div>
							<p className="text-xs text-muted-foreground">Paid</p>
							<p className="text-lg font-bold text-blue-600">{stats.paid}</p>
						</div>
					</div>
				</div>
				
				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-emerald-100 rounded-lg">
							<span className="text-emerald-600 text-lg">💵</span>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Revenue</p>
							<p className="text-lg font-bold text-emerald-600">₱{stats.totalRevenue.toFixed(0)}</p>
						</div>
					</div>
				</div>
				
				<div className="bg-card rounded-lg p-4 border border-border shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-orange-100 rounded-lg">
							<span className="text-orange-600 text-lg">⏰</span>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Pending</p>
							<p className="text-lg font-bold text-orange-600">₱{stats.pendingRevenue.toFixed(0)}</p>
						</div>
					</div>
								</div>
					</div>

			{/* AG Grid Table */}
			<div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
				<div className="p-4 border-b border-border bg-muted/20">
					<h3 className="text-lg font-semibold text-foreground">📋 All Bookings</h3>
					<p className="text-sm text-muted-foreground">Manage and track all customer bookings with payment details</p>
				</div>
				<CustomDataTable
					columnDefs={columnDefs}
					rowData={items}
					loading={loading}
					paginationPageSize={10}
					className="h-[600px]"
				/>
			</div>
		</div>
	);
};

export default BookingsAdminPage;