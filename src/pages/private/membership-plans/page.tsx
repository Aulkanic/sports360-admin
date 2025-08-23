import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import CustomDataTable from "@/components/custom-data-table";
import type { ColDef, GridOptions } from "ag-grid-community";

interface PlanRow {
	id: string;
	name: string;
	durationMonths: number;
	price: number;
	status: "Active" | "Inactive";
}

const initialPlans: PlanRow[] = [
	{ id: "p1", name: "Monthly", durationMonths: 1, price: 49, status: "Active" },
	{ id: "p2", name: "Quarterly", durationMonths: 3, price: 129, status: "Active" },
	{ id: "p3", name: "Annual", durationMonths: 12, price: 449, status: "Inactive" },
];

const baseColumns: ColDef[] = [
	{ field: "name", headerName: "Name", flex: 1, minWidth: 160 },
	{ field: "durationMonths", headerName: "Duration (mo)", minWidth: 140 },
	{ field: "price", headerName: "Price ($)", minWidth: 120, valueFormatter: (p) => `$${p.value}` },
	{ field: "status", headerName: "Status", minWidth: 120 },
];

const gridBase: GridOptions = {
	defaultColDef: { sortable: true, filter: true, resizable: true, floatingFilter: true },
	rowSelection: "single",
	animateRows: true,
};

const MembershipPlansPage: React.FC = () => {
	const [rows, setRows] = useState<PlanRow[]>(initialPlans);
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<PlanRow | null>(null);
	const [form, setForm] = useState<Omit<PlanRow, "id">>({ name: "", durationMonths: 1, price: 0, status: "Active" });

	const stats = useMemo(() => {
		const total = rows.length;
		const active = rows.filter((p) => p.status === "Active").length;
		const inactive = rows.filter((p) => p.status === "Inactive").length;
		return { total, active, inactive };
	}, [rows]);

	const filteredRows = useMemo(() => {
		if (!query.trim()) return rows;
		const q = query.toLowerCase();
		return rows.filter((r) => [r.name, String(r.durationMonths), String(r.price), r.status].some((v) => v.toLowerCase().includes(q)));
	}, [rows, query]);

	function handleAdd() {
		setEditing(null);
		setForm({ name: "", durationMonths: 1, price: 0, status: "Active" });
		setOpen(true);
	}

	function handleEditOpen(row: PlanRow) {
		setEditing(row);
		setForm({ name: row.name, durationMonths: row.durationMonths, price: row.price, status: row.status });
		setOpen(true);
	}

	function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (editing) {
			setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
		} else {
			setRows((prev) => [{ id: `p${Date.now()}`, ...form }, ...prev]);
		}
		setOpen(false);
	}

	const columns: ColDef[] = useMemo(() => {
		const actionsCol: ColDef = {
			headerName: "Actions",
			field: "actions",
			pinned: "right",
			minWidth: 140,
			cellRenderer: (p: any) => (
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => handleEditOpen(p.data as PlanRow)}>Edit</Button>
				</div>
			),
			sortable: false,
			filter: false,
			suppressHeaderMenuButton: true,
		};
		return [...baseColumns, actionsCol];
	}, []);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Membership Plans</h1>
				<div className="flex items-center gap-2">
					<Input className="w-72" placeholder="Search plans" value={query} onChange={(e) => setQuery(e.target.value)} />
					<Button onClick={handleAdd}>Add Plan</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Total</p>
					<p className="text-lg font-semibold">{stats.total}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Active</p>
					<p className="text-lg font-semibold text-green-600">{stats.active}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Inactive</p>
					<p className="text-lg font-semibold text-gray-500">{stats.inactive}</p>
				</div>
			</div>

			<CustomDataTable
				columnDefs={columns}
				rowData={filteredRows}
				paginationPageSize={10}
				gridOptions={gridBase}
				className="rounded-lg"
				loading={false}
			/>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit Plan" : "Add Plan"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={handleSave} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Name</span>
								<Input name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Duration (months)</span>
								<Input
									type="number"
									name="durationMonths"
									value={form.durationMonths}
									onChange={(e) => setForm((p) => ({ ...p, durationMonths: Number(e.target.value) }))}
									min={1}
									required
								/>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Price ($)</span>
								<Input
									type="number"
									name="price"
									value={form.price}
									onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
									min={0}
									required
								/>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<Input name="status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PlanRow["status"] }))} />
							</label>
						</div>
						<SheetFooter>
							<div className="flex gap-2">
								<Button type="submit">Save</Button>
								<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default MembershipPlansPage;