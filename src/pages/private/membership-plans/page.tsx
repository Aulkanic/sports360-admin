import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

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

const tierAccent = (name: string) => {
	const n = name.toLowerCase();
	if (n.includes("premium")) return "from-primary/10 to-primary/20 text-primary";
	if (n.includes("basic")) return "from-muted to-muted text-foreground/70";
	if (n.includes("annual")) return "from-violet-100/40 to-violet-200/40 text-violet-700";
	return "from-muted to-muted text-foreground/70";
};

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

	function getFeatures(desc: string): string[] {
		// naive split into features by comma or " and "
		const byComma = desc.split(",").map((s) => s.trim()).filter(Boolean);
		if (byComma.length > 1) return byComma;
		return desc.split(" and ").map((s) => s.trim()).filter(Boolean);
	}

	const allFeatures = useMemo(() => {
		const set = new Set<string>();
		pageItems.forEach((p) => getFeatures(p.description).forEach((f) => set.add(f)));
		return Array.from(set);
	}, [pageItems]);

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

			{/* Pricing Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{pageItems.map((plan) => {
					const isPopular = /premium/i.test(plan.name) && plan.status === "Active";
					const features = getFeatures(plan.description);
					const accent = tierAccent(plan.name);
					return (
						<div key={plan.id} className={`relative group rounded-2xl border bg-card p-5 shadow-sm overflow-hidden ${isPopular ? "ring-2 ring-primary" : ""}`}>
							{/* Popular ribbon */}
							{isPopular && (
								<div className="absolute -right-10 top-3 rotate-45 bg-primary text-primary-foreground text-xs px-10 py-1 shadow-sm">Most Popular</div>
							)}
							<div className="flex items-start justify-between gap-2">
								<div>
									<h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
									<p className={`text-[11px] inline-flex items-center gap-1 rounded-md bg-gradient-to-r ${accent} px-2 py-0.5 mt-1`}>{plan.duration} plan</p>
								</div>
								<div className="flex items-center gap-2">
									{plan.duration === "Yearly" && plan.status === "Active" && (
										<Badge variant="secondary">Save 15%</Badge>
									)}
									<Badge variant={plan.status === "Active" ? "success" : "muted"}>{plan.status}</Badge>
								</div>
							</div>
							<div className="mt-4 flex items-end gap-2">
								<span className="text-3xl font-bold leading-none">${plan.price}</span>
								<span className="text-sm text-muted-foreground mb-0.5">/ {plan.duration === "Monthly" ? "month" : "year"}</span>
							</div>
							{typeof plan.members === "number" && (
								<p className="mt-1 text-xs text-muted-foreground">{plan.members} members</p>
							)}
							<ul className="mt-4 space-y-2 text-sm">
								{features.map((f, idx) => (
									<li key={idx} className="flex items-start gap-2">
										<span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
										<span className="text-foreground/90">{f}</span>
									</li>
								))}
							</ul>
							<div className="mt-5 flex items-center gap-2">
								<Button className={`${isPopular ? "bg-primary text-primary-foreground" : ""}`}>Choose Plan</Button>
								<Button variant="outline" onClick={() => openEdit(plan)}>Edit</Button>
								<Button variant="destructive" onClick={() => confirmDelete(plan.id)}>Delete</Button>
							</div>
						</div>
					);
				})}
			</div>

			{/* Compare Plans Table */}
			<div className="mt-4">
				<h2 className="text-sm font-semibold mb-2">Compare plans</h2>
				<div className="overflow-x-auto">
					<table className="min-w-[720px] w-full text-sm border rounded-lg">
						<thead>
							<tr className="bg-muted/40">
								<th className="text-left p-2 border-r">Feature</th>
								{pageItems.map((p) => (
									<th key={p.id} className="text-left p-2 border-r last:border-r-0">{p.name}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{allFeatures.map((feat, idx) => (
								<tr key={idx} className="odd:bg-background even:bg-muted/20">
									<td className="p-2 border-r align-top">{feat}</td>
									{pageItems.map((p) => {
										const has = getFeatures(p.description).some((f) => f.toLowerCase() === feat.toLowerCase());
										return (
											<td key={p.id} className="p-2 text-center border-r last:border-r-0">
												{has ? <Check className="inline h-4 w-4 text-emerald-600" /> : <X className="inline h-4 w-4 text-muted-foreground" />}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
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