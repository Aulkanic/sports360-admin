import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface Facility {
	id: string;
	name: string;
	type: "Court" | "Field" | "Room";
	location: string;
	status: "Available" | "Maintenance" | "Booked";
	images?: string[];
}

const initialFacilities: Facility[] = [
	{ id: "f1", name: "Court A", type: "Court", location: "Building 1", status: "Available", images: ["/bglogin.webp"] },
	{ id: "f2", name: "Field 1", type: "Field", location: "North Wing", status: "Booked", images: ["/bglogin.webp"] },
	{ id: "f3", name: "Court 2", type: "Court", location: "Building 2", status: "Maintenance", images: [] },
];

const CourtsFieldsPage: React.FC = () => {
	const [items, setItems] = useState<Facility[]>(initialFacilities);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<"All" | Facility["type"]>("All");
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Omit<Facility, "id">>({ name: "", type: "Court", location: "", status: "Available", images: [""] });
	const [editing, setEditing] = useState<Facility | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const filtered = useMemo(() => {
		let list = items;
		if (type !== "All") list = list.filter((i) => i.type === type);
		if (query.trim()) {
			const q = query.toLowerCase();
			list = list.filter((i) => [i.name, i.type, i.location, i.status].some((v) => v.toLowerCase().includes(q)));
		}
		return list;
	}, [items, type, query]);

	function openCreate() {
		setEditing(null);
		setForm({ name: "", type: "Court", location: "", status: "Available", images: [""] });
		setOpen(true);
	}
	function openEdit(it: Facility) {
		setEditing(it);
		setForm({ name: it.name, type: it.type, location: it.location, status: it.status, images: it.images && it.images.length ? it.images : [""] });
		setOpen(true);
	}
	function save(e: React.FormEvent) {
		e.preventDefault();
		const images = (form.images ?? []).map((s) => s.trim()).filter(Boolean);
		const payload = { ...form, images };
		if (editing) setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...editing, ...payload } : i)));
		else setItems((prev) => [{ id: `f${Date.now()}`, ...payload }, ...prev]);
		setOpen(false);
	}
	function remove(id: string) { setConfirmId(id); }
	function doDelete() { if (confirmId) setItems((p) => p.filter((i) => i.id !== confirmId)); setConfirmId(null); }

	function updateImage(idx: number, value: string) {
		setForm((p) => ({ ...p, images: (p.images ?? []).map((s, i) => (i === idx ? value : s)) }));
	}
	function addImageField() {
		setForm((p) => ({ ...p, images: [...(p.images ?? []), ""] }));
	}
	function removeImageField(idx: number) {
		setForm((p) => ({ ...p, images: (p.images ?? []).filter((_, i) => i !== idx) }));
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<h1 className="text-xl font-semibold">Courts / Fields</h1>
				<div className="flex flex-1 items-center gap-2">
					<Input className="w-full md:w-80" placeholder="Search name, location, status" value={query} onChange={(e) => setQuery(e.target.value)} />
					<select className="h-9 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as any)}>
						<option value="All">All Types</option>
						<option value="Court">Court</option>
						<option value="Field">Field</option>
						<option value="Room">Room</option>
					</select>
					<Button onClick={openCreate}>Add Facility</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{filtered.map((f) => (
					<div key={f.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
						<div className="relative h-28 bg-muted">
							{(f.images && f.images[0]) ? (
								<img src={f.images[0]} alt="banner" className="absolute inset-0 h-full w-full object-cover" />
							) : (
								<div className="h-full w-full bg-gradient-to-r from-primary/20 to-accent/20" />
							)}
							<div className="absolute top-2 left-2">
								<Badge variant="muted">{f.type}</Badge>
							</div>
							<div className="absolute top-2 right-2">
								<Badge variant={f.status === "Available" ? "success" : f.status === "Booked" ? "warning" : "destructive"}>{f.status}</Badge>
							</div>
						</div>
						<div className="p-4 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-base font-semibold">{f.name}</h3>
									<p className="text-sm text-muted-foreground">{f.location}</p>
								</div>
							</div>
							{(f.images && f.images.length > 1) && (
								<div className="flex items-center gap-2 overflow-x-auto">
									{f.images.slice(1).map((src, idx) => (
										<img key={idx} src={src} alt="thumb" className="h-10 w-16 rounded-md object-cover border" />
									))}
								</div>
							)}
							<div className="flex items-center gap-2">
								<Button size="sm" onClick={() => openEdit(f)}>Edit</Button>
								<Button size="sm" variant="destructive" onClick={() => remove(f.id)}>Delete</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="right" className="sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>{editing ? "Edit" : "Add"} Facility</SheetTitle>
					</SheetHeader>
					<form onSubmit={save} className="p-4 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="space-y-1">
								<span className="text-sm">Name</span>
								<Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Type</span>
								<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Facility["type"] }))}>
									<option value="Court">Court</option>
									<option value="Field">Field</option>
									<option value="Room">Room</option>
								</select>
							</label>
							<label className="space-y-1 md:col-span-2">
								<span className="text-sm">Location</span>
								<Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Status</span>
								<select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Facility["status"] }))}>
									<option value="Available">Available</option>
									<option value="Maintenance">Maintenance</option>
									<option value="Booked">Booked</option>
								</select>
							</label>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Images</span>
								<Button type="button" size="sm" variant="outline" onClick={addImageField}>Add Image</Button>
							</div>
							<div className="space-y-2">
								{(form.images ?? []).map((src, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Input className="flex-1" placeholder="https://..." value={src} onChange={(e) => updateImage(idx, e.target.value)} />
										<Button type="button" variant="outline" size="sm" onClick={() => removeImageField(idx)}>Remove</Button>
									</div>
								))}
							</div>
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
						<h3 className="text-base font-semibold">Delete Facility</h3>
						<p className="text-sm text-muted-foreground">Are you sure you want to delete this facility?</p>
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

export default CourtsFieldsPage;