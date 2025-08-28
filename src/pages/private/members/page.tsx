import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import MembersTable from "./table";
import type { MemberRow } from "./table";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { Input } from "@/components/ui/input";

const initialRows: MemberRow[] = [
	{ id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-1234", status: "Active", joinedAt: "2024-05-10", role: "Player" },
	{ id: "2", name: "Bob Smith", email: "bob@example.com", phone: "+1 555-5678", status: "Inactive", joinedAt: "2024-02-18", role: "Coach" },
	{ id: "3", name: "Carol Davis", email: "carol@example.com", phone: "+1 555-9012", status: "Pending", joinedAt: "2025-01-03", role: "Staff" },
];

const emptyForm: Omit<MemberRow, "id" | "joinedAt"> & { joinedAt?: string } = {
	name: "",
	email: "",
	phone: "",
	status: "Active",
	joinedAt: "",
	role: "User",
};

const roleOptions: MemberRow["role"][] = ["User", "Player", "Coach", "Staff", "Manager"];

type RoleFilter = "All" | MemberRow["role"];

const MembersPage: React.FC = () => {
	const [rows, setRows] = useState<MemberRow[]>(initialRows);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<MemberRow | null>(null);
	const [form, setForm] = useState<typeof emptyForm>(emptyForm);
	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
	const isEditing = useMemo(() => Boolean(editing), [editing]);

	const stats = useMemo(() => {
		const total = rows.length;
		const active = rows.filter((r) => r.status === "Active").length;
		const pending = rows.filter((r) => r.status === "Pending").length;
		const inactive = rows.filter((r) => r.status === "Inactive").length;
		return { total, active, pending, inactive };
	}, [rows]);

	const filteredRows = useMemo(() => {
		let list = rows;
		if (roleFilter !== "All") list = list.filter((r) => r.role === roleFilter);
		if (!query.trim()) return list;
		const q = query.toLowerCase();
		return list.filter((r) =>
			[r.name, r.email, r.phone, r.status, r.role].some((v) => v.toLowerCase().includes(q))
		);
	}, [rows, query, roleFilter]);

	function handleAddClick() {
		setEditing(null);
		setForm(emptyForm);
		setOpen(true);
	}

	function handleEditOpen(row: MemberRow) {
		setEditing(row);
		setForm({ name: row.name, email: row.email, phone: row.phone, status: row.status, joinedAt: row.joinedAt, role: row.role });
		setOpen(true);
	}

	function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
				role: (form.role as MemberRow["role"]) || "User",
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
						placeholder="Search name, email, phone, status, role"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-72"
					/>
					<Button onClick={handleAddClick}>Add Member</Button>
				</div>
			</div>

			{/* Role filter tabs */}
			<div className="flex flex-wrap items-center gap-2">
				{(["All" as const, ...roleOptions] as RoleFilter[]).map((role) => (
					<button
						key={role}
						onClick={() => setRoleFilter(role)}
						className={`h-8 px-3 rounded-md border text-sm transition-colors ${roleFilter === role ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
					>
						{role}
					</button>
				))}
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

			<ResponsiveOverlay
				open={open}
				onOpenChange={setOpen}
				title={isEditing ? "Edit Member" : "Add Member"}
				ariaLabel={isEditing ? "Edit Member" : "Add Member"}
				footer={(
					<div className="flex gap-2">
						<Button type="submit" form="member-form">Save</Button>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
					</div>
				)}
			>
				<form id="member-form" onSubmit={handleSave} className="space-y-4">
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
							<label className="space-y-1">
								<span className="text-sm">Role</span>
								<select name="role" value={form.role} onChange={handleFormChange} className="h-9 rounded-md border bg-background px-3 text-sm">
									{roleOptions.map((r) => (
										<option key={r} value={r}>{r}</option>
									))}
								</select>
							</label>
						</div>
				</form>
			</ResponsiveOverlay>
		</div>
	);
};

export default MembersPage;