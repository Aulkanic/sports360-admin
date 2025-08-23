import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PlanRow {
	id: string;
	name: string;
	description: string;
	duration: "Monthly" | "Yearly";
	price: number;
	status: "Active" | "Inactive";
	members?: number;
}

const initialPlans: PlanRow[] = [
	{ id: "p1", name: "Basic", description: "Access to gym and pool", duration: "Monthly", price: 29, status: "Active", members: 124 },
	{ id: "p2", name: "Premium", description: "Gym, pool, classes included", duration: "Monthly", price: 59, status: "Active", members: 78 },
	{ id: "p3", name: "Annual", description: "All-inclusive annual plan", duration: "Yearly", price: 499, status: "Inactive", members: 22 },
];

const pageSizeDefault = 6;

const MembershipPlansPage: React.FC = () => {
	const [plans, setPlans] = useState<PlanRow[]>(initialPlans);
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<PlanRow | null>(null);
	const [form, setForm] = useState<Omit<PlanRow, "id">>({ name: "", description: "", duration: "Monthly", price: 0, status: "Active", members: 0 });
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(pageSizeDefault);

	const filtered = useMemo(() => {
		if (!query.trim()) return plans;
		const q = query.toLowerCase();
		return plans.filter((p) => [p.name, p.description, p.duration, p.status].some((v) => v.toLowerCase().includes(q)));
	}, [plans, query]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page, pageSize]);

	const stats = useMemo(() => {
		const total = plans.length;
		const active = plans.filter((p) => p.status === "Active").length;
		const inactive = plans.filter((p) => p.status === "Inactive").length;
		return { total, active, inactive };
	}, [plans]);

	function openCreate() {
		setEditing(null);
		setForm({ name: "", description: "", duration: "Monthly", price: 0, status: "Active", members: 0 });
		setOpen(true);
	}

	function openEdit(plan: PlanRow) {
		setEditing(plan);
		setForm({ name: plan.name, description: plan.description, duration: plan.duration, price: plan.price, status: plan.status, members: plan.members ?? 0 });
		setOpen(true);
	}

	function validateForm(): string | null {
		if (!form.name.trim()) return "Plan name is required";
		if (!form.description.trim()) return "Description is required";
		if (isNaN(Number(form.price)) || Number(form.price) < 0) return "Price must be a valid number";
		if (form.duration !== "Monthly" && form.duration !== "Yearly") return "Duration must be Monthly or Yearly";
		if (form.status !== "Active" && form.status !== "Inactive") return "Status must be Active or Inactive";
		return null;
	}

	function handleSave(e: React.FormEvent) {
		e.preventDefault();
		const error = validateForm();
		if (error) {
			alert(error);
			return;
		}
		if (editing) {
			setPlans((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
		} else {
			setPlans((prev) => [{ id: `p${Date.now()}`, ...form }, ...prev]);
		}
		setOpen(false);
	}

	function confirmDelete(id: string) {
		setConfirmId(id);
	}

	function doDelete() {
		if (confirmId) setPlans((prev) => prev.filter((p) => p.id !== confirmId));
		setConfirmId(null);
	}

	return (
		<div className="space-y-4">
			{/* Header: Search + Stats */}
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Membership Plans</h1>
				<div className="flex items-center gap-2">
					<Input className="w-72" placeholder="Search by name, description, status" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
					<Button onClick={openCreate}>Add New Plan</Button>
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

			{/* Cards List */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{pageItems.map((plan) => (
					<div key={plan.id} className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3 className="text-base font-semibold">{plan.name}</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
							</div>
							<Badge variant={plan.status === "Active" ? "success" : "muted"}>{plan.status}</Badge>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="text-xl font-bold">${plan.price}</span>
								<span className="text-sm text-muted-foreground">{plan.duration}</span>
							</div>
							{typeof plan.members === "number" && (
								<span className="text-xs text-muted-foreground">{plan.members} members</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" onClick={() => openEdit(plan)}>Edit</Button>
							<Button size="sm" variant="outline" onClick={() => confirmDelete(plan.id)}>Delete</Button>
						</div>
					</div>
				))}
			</div>

			{/* Pagination Controls */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
					<Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
				</div>
			</div>

			{/* Sticky Add Button for Mobile */}
			<div className="fixed bottom-4 right-4 md:hidden">
				<Button className="shadow-lg" onClick={openCreate}>Add New Plan</Button>
			</div>

			{/* Edit/Create Sheet */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit Plan" : "Add Plan"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={handleSave} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Plan Name</span>
								<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Description</span>
								<Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Price ($)</span>
								<Input type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Duration</span>
								<select
									className="w-full h-9 rounded-md border bg-background px-3 text-sm"
									value={form.duration}
									onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value as PlanRow["duration"] }))}
								>
									<option value="Monthly">Monthly</option>
									<option value="Yearly">Yearly</option>
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<select
									className="w-full h-9 rounded-md border bg-background px-3 text-sm"
									value={form.status}
									onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PlanRow["status"] }))}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
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

			{/* Delete Confirmation */}
			{confirmId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-card rounded-lg border w-full max-w-sm p-4 space-y-3">
						<h3 className="text-base font-semibold">Delete Plan</h3>
						<p className="text-sm text-muted-foreground">Are you sure you want to delete this plan? This action cannot be undone.</p>
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

export default MembershipPlansPage;