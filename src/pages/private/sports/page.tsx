import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface SportItem {
	id: string;
	name: string;
	description: string;
	type: "Team" | "Individual";
	numPlayers: number;
	facility: string;
	equipment: string[];
	positions: string[];
	status: "Active" | "Inactive";
	participants?: number;
}

const initialSports: SportItem[] = [
	{ id: "s1", name: "Basketball", description: "Team-based indoor sport.", type: "Team", numPlayers: 10, facility: "Court A", equipment: ["Basketballs", "Hoop"], positions: ["Guard", "Forward", "Center"], status: "Active", participants: 58 },
	{ id: "s2", name: "Tennis", description: "Individual or doubles court sport.", type: "Individual", numPlayers: 2, facility: "Court 2", equipment: ["Rackets", "Balls", "Net"], positions: ["Player"], status: "Active", participants: 32 },
	{ id: "s3", name: "Soccer", description: "Outdoor team sport.", type: "Team", numPlayers: 22, facility: "Field 1", equipment: ["Soccer Balls", "Nets"], positions: ["Goalkeeper", "Defender", "Midfielder", "Forward"], status: "Inactive", participants: 76 },
];

const facilities = ["Court A", "Court B", "Court 1", "Court 2", "Field 1", "Field 2"];
const equipments = ["Basketballs", "Hoop", "Rackets", "Balls", "Net", "Soccer Balls", "Cones"];

const SportsPage: React.FC = () => {
	const [sports, setSports] = useState<SportItem[]>(initialSports);
	const [query, setQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<"All" | "Team" | "Individual">("All");
	const [openEdit, setOpenEdit] = useState(false);
	const [editing, setEditing] = useState<SportItem | null>(null);
	const [form, setForm] = useState<Omit<SportItem, "id">>({
		name: "",
		description: "",
		type: "Team",
		numPlayers: 0,
		facility: facilities[0],
		equipment: [],
		positions: [],
		status: "Active",
		participants: 0,
	});
	const [openDetails, setOpenDetails] = useState(false);
	const [detailItem, setDetailItem] = useState<SportItem | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		let list = sports;
		if (typeFilter !== "All") list = list.filter((s) => s.type === typeFilter);
		if (query.trim()) {
			const q = query.toLowerCase();
			list = list.filter((s) => [s.name, s.type, s.facility, s.status].some((v) => v.toLowerCase().includes(q)));
		}
		return list;
	}, [sports, typeFilter, query]);

	function validate(): string | null {
		if (!form.name.trim()) return "Sport name is required";
		if (!form.description.trim()) return "Description is required";
		if (isNaN(Number(form.numPlayers)) || Number(form.numPlayers) <= 0) return "Number of players must be a positive number";
		if (!form.facility) return "Facility must be selected";
		if (!Array.isArray(form.positions) || form.positions.length === 0) return "At least one position is required";
		return null;
	}

	function openCreate() {
		setEditing(null);
		setForm({ name: "", description: "", type: "Team", numPlayers: 0, facility: facilities[0], equipment: [], positions: [], status: "Active", participants: 0 });
		setOpenEdit(true);
	}

	function openEditSheet(item: SportItem) {
		setEditing(item);
		setForm({ name: item.name, description: item.description, type: item.type, numPlayers: item.numPlayers, facility: item.facility, equipment: item.equipment, positions: item.positions, status: item.status, participants: item.participants ?? 0 });
		setOpenEdit(true);
	}

	function openDetailsSheet(item: SportItem) {
		setDetailItem(item);
		setOpenDetails(true);
	}

	function save(e: React.FormEvent) {
		e.preventDefault();
		const error = validate();
		if (error) return alert(error);
		if (editing) {
			setSports((prev) => prev.map((s) => (s.id === editing.id ? { ...editing, ...form } : s)));
		} else {
			setSports((prev) => [{ id: `s${Date.now()}`, ...form }, ...prev]);
		}
		setOpenEdit(false);
	}

	function remove(id: string) {
		setConfirmId(id);
	}
	function doDelete() {
		if (confirmId) setSports((prev) => prev.filter((s) => s.id !== confirmId));
		setConfirmId(null);
	}

	function addPosition() {
		const name = prompt("Add position/role");
		if (name && name.trim()) setForm((p) => ({ ...p, positions: [...p.positions, name.trim()] }));
	}
	function removePosition(name: string) {
		setForm((p) => ({ ...p, positions: p.positions.filter((n) => n !== name) }));
	}
	function toggleEquipment(item: string) {
		setForm((p) => ({ ...p, equipment: p.equipment.includes(item) ? p.equipment.filter((e) => e !== item) : [...p.equipment, item] }));
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Sports</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-80" placeholder="Search by name, type, facility" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select
						className="h-9 rounded-md border bg-background px-3 text-sm"
						value={typeFilter}
						onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
					>
						<option value="All">All Types</option>
						<option value="Team">Team</option>
						<option value="Individual">Individual</option>
					</select>
					<Button onClick={openCreate}>Add New Sport</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{filtered.map((s) => (
					<div key={s.id} className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h3 className="text-base font-semibold">{s.name}</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
								<p className="text-xs text-muted-foreground mt-1">Facility: {s.facility}</p>
							</div>
							<Badge variant={s.status === "Active" ? "success" : "muted"}>{s.status}</Badge>
						</div>
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<span className="font-medium">{s.type}</span>
								<span className="text-muted-foreground">•</span>
								<span>{s.numPlayers} players</span>
							</div>
							{typeof s.participants === "number" && (
								<span className="text-muted-foreground">{s.participants} participants</span>
							)}
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							{s.positions.slice(0, 4).map((p) => (
								<Badge key={p} variant="ghost" className="border px-2 py-0.5">{p}</Badge>
							))}
							{s.positions.length > 4 && (
								<span className="text-xs text-muted-foreground">+{s.positions.length - 4} more</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" onClick={() => openDetailsSheet(s)}>View</Button>
							<Button size="sm" variant="outline" onClick={() => openEditSheet(s)}>Edit</Button>
							<Button size="sm" variant="destructive" onClick={() => remove(s.id)}>Delete</Button>
						</div>
					</div>
				))}
			</div>

			{/* Sticky Add Button for Mobile */}
			<div className="fixed bottom-4 right-4 md:hidden">
				<Button className="shadow-lg" onClick={openCreate}>Add New Sport</Button>
			</div>

			{/* Edit/Create Sheet */}
			<Sheet open={openEdit} onOpenChange={setOpenEdit}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit Sport" : "Add Sport"}</SheetTitle>
					</SheetHeader>
					<form onSubmit={save} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Sport Name</span>
								<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Description</span>
								<textarea
									className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
									value={form.description}
									onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
									required
								/>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Type of Sport</span>
								<select
									className="w-full h-9 rounded-md border bg-background px-3 text-sm"
									value={form.type}
									onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as SportItem["type"] }))}
								>
									<option value="Team">Team</option>
									<option value="Individual">Individual</option>
								</select>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Number of Players</span>
								<Input type="number" min={1} value={form.numPlayers} onChange={(e) => setForm((p) => ({ ...p, numPlayers: Number(e.target.value) }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Court/Field Assigned</span>
								<select
									className="w-full h-9 rounded-md border bg-background px-3 text-sm"
									value={form.facility}
									onChange={(e) => setForm((p) => ({ ...p, facility: e.target.value }))}
								>
									{facilities.map((f) => (
										<option key={f} value={f}>{f}</option>
									))}
								</select>
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Available Equipment</span>
								<div className="flex flex-wrap gap-2">
									{equipments.map((e) => (
										<button
											key={e}
											type="button"
											className={`px-2 py-1 rounded-md text-xs border ${form.equipment.includes(e) ? 'bg-primary text-white border-primary' : 'bg-background'}`}
											onClick={() => toggleEquipment(e)}
										>
											{e}
										</button>
									))}
								</div>
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Positions</span>
								<div className="flex flex-wrap items-center gap-2">
									{form.positions.map((p) => (
										<Badge key={p} variant="ghost" className="border px-2 py-0.5">
											{p}
											<button type="button" className="ml-1 text-xs text-muted-foreground" onClick={() => removePosition(p)}>×</button>
										</Badge>
									))}
									<Button type="button" size="sm" variant="outline" onClick={addPosition}>Add position</Button>
								</div>
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<select
									className="w-full h-9 rounded-md border bg-background px-3 text-sm"
									value={form.status}
									onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SportItem["status"] }))}
								>
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</label>
						</div>
						<SheetFooter>
							<div className="flex gap-2">
								<Button type="submit">Save</Button>
								<Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
							</div>
						</SheetFooter>
					</form>
				</SheetContent>
			</Sheet>

			{/* Details Sheet */}
			<Sheet open={openDetails} onOpenChange={setOpenDetails}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>Sport Details</SheetTitle>
					</SheetHeader>
					<div className="p-4 space-y-4">
						{detailItem && (
							<>
								<div>
									<h3 className="text-lg font-semibold">{detailItem.name} <Badge variant={detailItem.status === "Active" ? "success" : "muted"}>{detailItem.status}</Badge></h3>
									<p className="text-sm text-muted-foreground mt-1">{detailItem.description}</p>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground">Type</p>
										<p className="font-medium">{detailItem.type}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Players</p>
										<p className="font-medium">{detailItem.numPlayers}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Facility</p>
										<p className="font-medium">{detailItem.facility}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Equipment</p>
										<p className="font-medium">{detailItem.equipment.join(", ") || "-"}</p>
									</div>
									<div className="md:col-span-2">
										<p className="text-muted-foreground">Positions</p>
										<div className="flex flex-wrap gap-2 mt-1">
											{detailItem.positions.map((p) => (
												<Badge key={p} variant="ghost" className="border px-2 py-0.5">{p}</Badge>
											))}
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation */}
			{confirmId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-card rounded-lg border w-full max-w-sm p-4 space-y-3">
						<h3 className="text-base font-semibold">Delete Sport</h3>
						<p className="text-sm text-muted-foreground">Are you sure you want to delete this sport? This action cannot be undone.</p>
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

export default SportsPage;