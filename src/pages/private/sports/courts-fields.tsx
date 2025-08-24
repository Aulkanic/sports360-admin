/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";

interface Facility {
	id: string;
	name: string;
	type: "Court" | "Field" | "Room";
	location: string;
	status: "Available" | "Maintenance" | "Booked";
	images?: string[];
	capacity?: number;
	openingHours?: string;
	reservations?: number;
	amenities?: string[];
}

const initialFacilities: Facility[] = [
	{ id: "f1", name: "Court 1", type: "Court", location: "Building 1", status: "Available", images: ["https://tse4.mm.bing.net/th/id/OIP.uNvD4-Mwm18Y7mqk0WkUcgHaDT?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"], capacity: 10, openingHours: "08:00 - 22:00", reservations: 2, amenities: ["Lighting", "Benches"] },
	{ id: "f2", name: "Court 2", type: "Field", location: "North Wing", status: "Booked", images: ["https://tse1.mm.bing.net/th/id/OIP.wdqEdSlnuBW1zqsBGrNrSgHaE8?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"], capacity: 22, openingHours: "06:00 - 21:00", reservations: 1, amenities: ["Locker Rooms", "Shower"] },
	{ id: "f3", name: "Court 3", type: "Court", location: "Building 2", status: "Maintenance", images: ["https://www.urbansoccerpark.com/hs-fs/hubfs/Imported%20images/DJI_0039-1.jpeg?width=2000&height=1167&name=DJI_0039-1.jpeg"], capacity: 8, openingHours: "09:00 - 18:00", reservations: 0, amenities: ["Water Station"] },
];

const CourtsFieldsPage: React.FC = () => {
	const [items, setItems] = useState<Facility[]>(initialFacilities);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<"All" | Facility["type"]>("All");
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<Omit<Facility, "id">>({ name: "", type: "Court", location: "", status: "Available", images: [""], capacity: 0, openingHours: "", reservations: 0, amenities: [""] });
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
		setForm({ name: "", type: "Court", location: "", status: "Available", images: [""], capacity: 0, openingHours: "", reservations: 0, amenities: [""] });
		setOpen(true);
	}
	function openEdit(it: Facility) {
		setEditing(it);
		setForm({ name: it.name, type: it.type, location: it.location, status: it.status, images: it.images && it.images.length ? it.images : [""], capacity: it.capacity ?? 0, openingHours: it.openingHours ?? "", reservations: it.reservations ?? 0, amenities: (it.amenities && it.amenities.length ? it.amenities : [""]) });
		setOpen(true);
	}
	function save(e: React.FormEvent) {
		e.preventDefault();
		const images = (form.images ?? []).map((s) => s.trim()).filter(Boolean);
		const amenities = (form.amenities ?? []).map((s) => s.trim()).filter(Boolean);
		const payload = { ...form, images, amenities };
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

	function updateAmenity(idx: number, value: string) {
		setForm((p) => ({ ...p, amenities: (p.amenities ?? []).map((s, i) => (i === idx ? value : s)) }));
	}
	function addAmenityField() {
		setForm((p) => ({ ...p, amenities: [...(p.amenities ?? []), ""] }));
	}
	function removeAmenityField(idx: number) {
		setForm((p) => ({ ...p, amenities: (p.amenities ?? []).filter((_, i) => i !== idx) }));
	}

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const urls = acceptedFiles.map((f) => URL.createObjectURL(f));
		setForm((p) => ({ ...p, images: [ ...(p.images ?? []).filter(Boolean), ...urls ] }));
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

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

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				{filtered.map((f) => (
					<div key={f.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
						<div className="relative h-48 bg-muted">
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
									<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
										{typeof f.capacity === "number" && <span>Capacity: {f.capacity}</span>}
										{f.openingHours && <span>• Hours: {f.openingHours}</span>}
										{typeof f.reservations === "number" && <span>• Reservations: {f.reservations}</span>}
									</div>
								</div>
							</div>
							{(f.amenities && f.amenities.length > 0) && (
								<div className="flex items-center gap-2 flex-wrap">
									{f.amenities.map((a, idx) => (
										<Badge key={idx} variant="ghost" className="border px-2 py-0.5">{a}</Badge>
									))}
								</div>
							)}
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
							<label className="space-y-1">
								<span className="text-sm">Capacity</span>
								<Input type="number" min={0} value={form.capacity ?? 0} onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))} />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Opening Hours</span>
								<Input placeholder="e.g., 08:00 - 22:00" value={form.openingHours ?? ""} onChange={(e) => setForm((p) => ({ ...p, openingHours: e.target.value }))} />
							</label>
							<label className="space-y-1">
								<span className="text-sm">Reservations</span>
								<Input type="number" min={0} value={form.reservations ?? 0} onChange={(e) => setForm((p) => ({ ...p, reservations: Number(e.target.value) }))} />
							</label>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Images</span>
								<Button type="button" size="sm" variant="outline" onClick={addImageField}>Add Image</Button>
							</div>
							<div className="space-y-2">
								<div {...getRootProps()} className={`rounded-md border border-dashed p-4 text-center text-sm ${isDragActive ? 'bg-muted/50' : 'bg-transparent'}`}>
									<input {...getInputProps()} />
									<p>Drag & drop images here, or click to select</p>
								</div>
								{(form.images ?? []).map((src, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Input className="flex-1" placeholder="https://..." value={src} onChange={(e) => updateImage(idx, e.target.value)} />
										<Button type="button" variant="outline" size="sm" onClick={() => removeImageField(idx)}>Remove</Button>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Amenities</span>
								<Button type="button" size="sm" variant="outline" onClick={addAmenityField}>Add Amenity</Button>
							</div>
							<div className="space-y-2">
								{(form.amenities ?? []).map((val, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Input className="flex-1" placeholder="e.g., Lighting" value={val} onChange={(e) => updateAmenity(idx, e.target.value)} />
										<Button type="button" variant="outline" size="sm" onClick={() => removeAmenityField(idx)}>Remove</Button>
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