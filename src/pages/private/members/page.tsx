import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import MembersTable from "./table";
import type { MemberRow } from "./table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const initialRows: MemberRow[] = [
	{ id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-1234", status: "Active", joinedAt: "2024-05-10" },
	{ id: "2", name: "Bob Smith", email: "bob@example.com", phone: "+1 555-5678", status: "Inactive", joinedAt: "2024-02-18" },
	{ id: "3", name: "Carol Davis", email: "carol@example.com", phone: "+1 555-9012", status: "Pending", joinedAt: "2025-01-03" },
];

const emptyForm: Omit<MemberRow, "id" | "joinedAt"> & { joinedAt?: string } = {
	name: "",
	email: "",
	phone: "",
	status: "Active",
	joinedAt: "",
};

const MembersPage: React.FC = () => {
	const [rows, setRows] = useState<MemberRow[]>(initialRows);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<MemberRow | null>(null);
	const [form, setForm] = useState<typeof emptyForm>(emptyForm);
	const [query, setQuery] = useState("");
	const isEditing = useMemo(() => Boolean(editing), [editing]);

	const stats = useMemo(() => {
		const total = rows.length;
		const active = rows.filter((r) => r.status === "Active").length;
		const pending = rows.filter((r) => r.status === "Pending").length;
		const inactive = rows.filter((r) => r.status === "Inactive").length;
		return { total, active, pending, inactive };
	}, [rows]);

	const filteredRows = useMemo(() => {
		if (!query.trim()) return rows;
		const q = query.toLowerCase();
		return rows.filter((r) =>
			[r.name, r.email, r.phone, r.status].some((v) => v.toLowerCase().includes(q))
		);
	}, [rows, query]);

	function handleAddClick() {
		setEditing(null);
		setForm(emptyForm);
		setOpen(true);
	}

	function handleEditOpen(row: MemberRow) {
		setEditing(row);
		setForm({ name: row.name, email: row.email, phone: row.phone, status: row.status, joinedAt: row.joinedAt });
		setOpen(true);
	}

	function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (isEditing && editing) {
			setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
		} else {
			const newRow: MemberRow = {
				id: String(Date.now()),
				name: form.name,
				email: form.email,
				phone: form.phone,
				status: (form.status as MemberRow["status"]) || "Active",
				joinedAt: form.joinedAt || new Date().toISOString().slice(0, 10),
			};
			setRows((prev) => [newRow, ...prev]);
		}
		setOpen(false);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Members</h1>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Search name, email, phone, status"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-72"
					/>
					<Button onClick={handleAddClick}>Add Member</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Total</p>
					<p className="text-lg font-semibold">{stats.total}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Active</p>
					<p className="text-lg font-semibold text-green-600">{stats.active}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Pending</p>
					<p className="text-lg font-semibold text-amber-600">{stats.pending}</p>
				</div>
				<div className="rounded-lg bg-card p-3 border">
					<p className="text-xs text-muted-foreground">Inactive</p>
					<p className="text-lg font-semibold text-gray-500">{stats.inactive}</p>
				</div>
			</div>

			<MembersTable
				rows={filteredRows}
				onRowDoubleClicked={(e) => handleEditOpen(e.data as MemberRow)}
				onEditClick={(row) => handleEditOpen(row)}
			/>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{isEditing ? "Edit Member" : "Add Member"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={handleSave} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Full Name</span>
								<Input name="name" value={form.name} onChange={handleFormChange} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Email</span>
								<Input type="email" name="email" value={form.email} onChange={handleFormChange} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Phone</span>
								<Input name="phone" value={form.phone} onChange={handleFormChange} />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<Input name="status" value={form.status} onChange={handleFormChange} />
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

export default MembersPage;