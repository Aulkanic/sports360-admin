import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CustomDataTable from "@/components/custom-data-table";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface EquipmentItem {
	id: string;
	name: string;
	category: string;
	quantity: number;
	price: number;
	condition: "Good" | "Needs Repair" | "Broken";
	rented: number;
	lastRentedDate?: Date;
	available: number;
}

const initialEquipments: EquipmentItem[] = [
	{ id: "eq1", name: "Pickleball Racket", category: "Racket", quantity: 10, price: 50, condition: "Good", rented: 2, lastRentedDate: new Date(), available: 8 },
	{ id: "eq2", name: "Basketball", category: "Ball", quantity: 20, price: 20, condition: "Good", rented: 5, lastRentedDate: new Date(), available: 15 },
	{ id: "eq3", name: "Tennis Net", category: "Net", quantity: 3, price: 100, condition: "Needs Repair", rented: 0, available: 3 },
];

const conditionVariant = (c: EquipmentItem["condition"]) => c === "Good" ? "success" : c === "Needs Repair" ? "warning" : "destructive" as const;

const EquipmentPage: React.FC = () => {
	const [items, setItems] = useState<EquipmentItem[]>(initialEquipments);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState<string>("All");
	const [condition, setCondition] = useState<"All" | EquipmentItem["condition"]>("All");
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<EquipmentItem | null>(null);
	const [form, setForm] = useState<Omit<EquipmentItem, "id">>({ name: "", category: "Racket", quantity: 1, price: 0, condition: "Good", rented: 0, available: 1 });
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		return items.filter((i) => {
			if (category !== "All" && i.category !== category) return false;
			if (condition !== "All" && i.condition !== condition) return false;
			if (query.trim()) {
				const q = query.toLowerCase();
				if (![i.name, i.category, i.condition].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [items, category, condition, query]);

	const stats = useMemo(() => {
		const totalItems = filtered.reduce((sum, i) => sum + i.quantity, 0);
		const totalAvailable = filtered.reduce((sum, i) => sum + i.available, 0);
		const totalRented = filtered.reduce((sum, i) => sum + i.rented, 0);
		const needsRepair = filtered.filter((i) => i.condition !== "Good").length;
		return { totalItems, totalAvailable, totalRented, needsRepair };
	}, [filtered]);

	function openCreate() {
		setEditing(null);
		setForm({ name: "", category: "Racket", quantity: 1, price: 0, condition: "Good", rented: 0, available: 1 });
		setOpen(true);
	}
	function openEdit(i: EquipmentItem) {
		setEditing(i);
		setForm({ name: i.name, category: i.category, quantity: i.quantity, price: i.price, condition: i.condition, rented: i.rented, available: i.available });
		setOpen(true);
	}
	function save(e: React.FormEvent) {
		e.preventDefault();
		if (!form.name.trim()) return alert("Name is required");
		if (form.quantity < 0 || form.price < 0) return alert("Quantity/Price must be valid");
		if (form.rented > form.quantity) return alert("Rented cannot exceed total quantity");
		const available = Math.max(0, form.quantity - form.rented);
		if (editing) setItems((prev) => prev.map((x) => x.id === editing.id ? { ...editing, ...form, available } : x));
		else setItems((prev) => [{ id: `eq${Date.now()}`, ...form, available }, ...prev]);
		setOpen(false);
	}
	function remove(id: string) { setConfirmId(id); }
	function doDelete() { if (confirmId) setItems((p) => p.filter((i) => i.id !== confirmId)); setConfirmId(null); }

	function rentOne(id: string) {
		setItems((prev) => prev.map((i) => {
			if (i.id !== id) return i;
			if (i.available <= 0) return i;
			const rented = i.rented + 1;
			const available = i.quantity - rented;
			return { ...i, rented, available, lastRentedDate: new Date() };
		}));
	}
	function returnOne(id: string) {
		setItems((prev) => prev.map((i) => {
			if (i.id !== id) return i;
			if (i.rented <= 0) return i;
			const rented = i.rented - 1;
			const available = i.quantity - rented;
			return { ...i, rented, available };
		}));
	}

	const categories = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category)))], [items]);

	const columns = useMemo<ColDef[]>(() => {
		const actionsCol: ColDef = {
			headerName: "Actions",
			field: "actions",
			pinned: "right",
			minWidth: 220,
			cellRenderer: (p: ICellRendererParams<EquipmentItem>) => (
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => rentOne(p.data!.id)} disabled={(p.data!.available ?? 0) <= 0}>Rent</Button>
					<Button size="sm" variant="outline" onClick={() => returnOne(p.data!.id)} disabled={(p.data!.rented ?? 0) <= 0}>Return</Button>
					<Button size="sm" variant="outline" onClick={() => openEdit(p.data!)}>Edit</Button>
					<Button size="sm" variant="destructive" onClick={() => remove(p.data!.id)}>Delete</Button>
				</div>
			),
			sortable: false,
			filter: false,
			suppressHeaderMenuButton: true,
		};
		return [
			{ field: "name", headerName: "Name", flex: 1, minWidth: 160 },
			{ field: "category", headerName: "Category", minWidth: 120 },
			{ field: "condition", headerName: "Condition", minWidth: 140, cellRenderer: (p: ICellRendererParams<EquipmentItem>) => <Badge variant={conditionVariant(p.value)}>{p.value}</Badge> },
			{ field: "price", headerName: "Price (₱)", minWidth: 120, valueFormatter: (p) => `₱${Number(p.value).toFixed(2)}` },
			{ field: "quantity", headerName: "Qty", minWidth: 90 },
			{ field: "rented", headerName: "Rented", minWidth: 100 },
			{ field: "available", headerName: "Available", minWidth: 110 },
			{ field: "lastRentedDate", headerName: "Last Rented", minWidth: 150, valueGetter: (p) => p.data?.lastRentedDate ? new Date(p.data.lastRentedDate).toLocaleDateString() : "-" },
			actionsCol,
		];
	}, [items]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Equipment</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-72" placeholder="Search by name, category, condition" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
						{categories.map((c) => (<option key={c} value={c}>{c}</option>))}
					</select>
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={condition} onChange={(e) => setCondition(e.target.value as any)}>
						<option value="All">All Conditions</option>
						<option value="Good">Good</option>
						<option value="Needs Repair">Needs Repair</option>
						<option value="Broken">Broken</option>
					</select>
					<Button onClick={openCreate}>Add Equipment</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Total Items</p>
					<p className="text-lg font-semibold">{stats.totalItems}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Available</p>
					<p className="text-lg font-semibold text-green-600">{stats.totalAvailable}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Rented</p>
					<p className="text-lg font-semibold text-amber-600">{stats.totalRented}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Needs Attention</p>
					<p className="text-lg font-semibold text-red-600">{stats.needsRepair}</p>
				</div>
			</div>

			<CustomDataTable
				columnDefs={columns}
				rowData={filtered}
				paginationPageSize={10}
				className="rounded-lg"
			/>

			{/* Create/Edit Sheet */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit Equipment" : "Add Equipment"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={save} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Name</span>
								<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Category</span>
								<Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Quantity</span>
								<Input type="number" min={0} value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value), available: Math.max(0, Number(e.target.value) - p.rented) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Price (₱)</span>
								<Input type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Condition</span>
								<select className="h-9 rounded-md border bg-background px-3 text-sm" value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value as EquipmentItem["condition"] }))}>
									<option value="Good">Good</option>
									<option value="Needs Repair">Needs Repair</option>
									<option value="Broken">Broken</option>
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Rented</span>
								<Input type="number" min={0} value={form.rented} onChange={(e) => setForm((p) => ({ ...p, rented: Number(e.target.value), available: Math.max(0, p.quantity - Number(e.target.value)) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Available</span>
								<Input type="number" min={0} value={form.available} onChange={(e) => setForm((p) => ({ ...p, available: Number(e.target.value) }))} required />
							</label>
						</div>
						<SheetFooter>
							<div className="flex items-center justify-end gap-2">
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
								<Button type="submit">Save</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation */}
			{confirmId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-card rounded-lg border w-full max-w-sm p-4 space-y-3">
						<h3 className="text-base font-semibold">Delete Equipment</h3>
						<p className="text-sm text-muted-foreground">Are you sure you want to delete this equipment?</p>
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

export default EquipmentPage;