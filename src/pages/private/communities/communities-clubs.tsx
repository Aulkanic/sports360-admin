import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { Building2, MapPin, Globe2, Link2, Plus, Pencil, Trash2, Search, Filter as FilterIcon, Upload, Download, GripVertical, MoreHorizontal, Users, Calendar } from "lucide-react";

// -------------------- Types --------------------
export type CommunityVisibility = "public" | "private" | "hidden";
export type JoinPolicy = "auto" | "approval";
export type ClubStatus = "active" | "archived";

export type Community = {
	id: string;
	name: string;
	slug: string;
	sports: string[];
	visibility: CommunityVisibility;
	joinPolicy: JoinPolicy;
	location: { city: string; country: string; address?: string; lat?: number; lng?: number };
	timezone?: string;
	memberCount?: number;
	upcomingEventsCount?: number;
	tags?: string[];
	socials?: { website?: string; instagram?: string; facebook?: string; whatsapp?: string };
	meetingInfo?: { typicalDays?: string[]; typicalTimes?: string; venue?: string };
	coverImageUrl?: string;
	description?: string;
	rules?: string;
	createdAt: string; // ISO
	updatedAt: string; // ISO
};

export type Club = {
	id: string;
	name: string;
	slug: string;
	sports: string[];
	timezone: string;
	logoUrl?: string;
	contactEmail?: string;
	status: ClubStatus;
	memberCount?: number;
	location?: { city: string; country: string; address?: string; lat?: number; lng?: number };
	socials?: { website?: string; instagram?: string; facebook?: string };
	createdAt: string; // ISO
};

export type CommunityClubLink = {
	communityId: string;
	clubId: string;
	displayOrder: number;
};

// -------------------- Utils/Mocks --------------------
const nowIso = () => new Date().toISOString();
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

// Mock API layer (replace with real API integration)
const mockDelay = (ms = 500) => new Promise((res) => setTimeout(res, ms));
export const mockApi = {
	createCommunity: async (c: Omit<Community, "id" | "createdAt" | "updatedAt">): Promise<Community> => {
		await mockDelay();
		return { ...c, id: `cm-${Date.now()}`, createdAt: nowIso(), updatedAt: nowIso() };
	},
	updateCommunity: async (c: Community): Promise<Community> => {
		await mockDelay();
		return { ...c, updatedAt: nowIso() };
	},
	createClub: async (k: Omit<Club, "id" | "createdAt">): Promise<Club> => {
		await mockDelay();
		return { ...k, id: `cl-${Date.now()}`, createdAt: nowIso() };
	},
	linkClub: async (link: CommunityClubLink): Promise<CommunityClubLink> => {
		await mockDelay();
		return link;
	},
	unlinkClub: async (): Promise<void> => {
		await mockDelay();
	},
	reorderLinks: async (links: CommunityClubLink[]): Promise<CommunityClubLink[]> => {
		await mockDelay();
		return links;
	},
};

// Guard slug uniqueness (client-side)
export const uniqueSlugGuard = (existingSlugs: string[], candidate: string) => {
	let s = candidate;
	let i = 2;
	while (existingSlugs.includes(s)) {
		s = `${candidate}-${i++}`;
	}
	return s;
};

// -------------------- Seeds --------------------
const seedCommunities: Community[] = [
	{ id: "cm-1", name: "Pickleball Social Hub", slug: "pickleball-social", sports: ["Pickleball"], visibility: "public", joinPolicy: "auto", timezone: "America/Chicago", memberCount: 324, upcomingEventsCount: 3, tags: ["social","clinic"], socials: { instagram: "@pickle_social" }, meetingInfo: { typicalDays: ["Tue","Thu"], typicalTimes: "6–8 PM", venue: "City Rec Center" }, location: { city: "Austin", country: "USA", address: "123 Main St" }, description: "Weekly socials and clinics", createdAt: nowIso(), updatedAt: nowIso() },
	{ id: "cm-2", name: "Badminton League", slug: "badminton-league", sports: ["Badminton"], visibility: "private", joinPolicy: "approval", timezone: "America/Toronto", memberCount: 198, upcomingEventsCount: 2, tags: ["league","ladder"], socials: { website: "https://badminton-league.example" }, location: { city: "Toronto", country: "Canada" }, createdAt: nowIso(), updatedAt: nowIso() },
	{ id: "cm-3", name: "City Tennis Network", slug: "city-tennis", sports: ["Tennis"], visibility: "public", joinPolicy: "auto", timezone: "Europe/London", memberCount: 542, upcomingEventsCount: 5, tags: ["network","teams"], location: { city: "London", country: "UK" }, createdAt: nowIso(), updatedAt: nowIso() },
	{ id: "cm-4", name: "Hoops Club", slug: "hoops-club", sports: ["Basketball"], visibility: "hidden", joinPolicy: "approval", timezone: "Australia/Sydney", memberCount: 120, upcomingEventsCount: 1, tags: ["pickup"], location: { city: "Sydney", country: "Australia" }, createdAt: nowIso(), updatedAt: nowIso() },
	{ id: "cm-5", name: "Racquet Collective", slug: "racquet-collective", sports: ["Tennis", "Badminton"], visibility: "public", joinPolicy: "approval", timezone: "America/Los_Angeles", memberCount: 271, upcomingEventsCount: 2, tags: ["multi-sport"], location: { city: "Seattle", country: "USA" }, createdAt: nowIso(), updatedAt: nowIso() },
];

const seedClubs: Club[] = [
	{ id: "cl-1", name: "Downtown Picklers", slug: "downtown-picklers", sports: ["Pickleball"], timezone: "America/Chicago", status: "active", memberCount: 120, location: { city: "Austin", country: "USA" }, socials: { instagram: "@downtown.picklers" }, createdAt: nowIso(), logoUrl: "" },
	{ id: "cl-2", name: "Shuttle Masters", slug: "shuttle-masters", sports: ["Badminton"], timezone: "America/Toronto", status: "active", memberCount: 85, location: { city: "Toronto", country: "Canada" }, createdAt: nowIso() },
	{ id: "cl-3", name: "Tennis Pros", slug: "tennis-pros", sports: ["Tennis"], timezone: "Europe/London", status: "active", memberCount: 210, location: { city: "London", country: "UK" }, createdAt: nowIso() },
	{ id: "cl-4", name: "City Hoopers", slug: "city-hoopers", sports: ["Basketball"], timezone: "Australia/Sydney", status: "archived", memberCount: 40, location: { city: "Sydney", country: "Australia" }, createdAt: nowIso() },
	{ id: "cl-5", name: "Court Ninjas", slug: "court-ninjas", sports: ["Tennis", "Badminton"], timezone: "America/Los_Angeles", status: "active", memberCount: 150, location: { city: "Seattle", country: "USA" }, createdAt: nowIso() },
	{ id: "cl-6", name: "Spin Doctors", slug: "spin-doctors", sports: ["Pickleball"], timezone: "America/Chicago", status: "active", memberCount: 90, location: { city: "Austin", country: "USA" }, createdAt: nowIso() },
	{ id: "cl-7", name: "Baseline United", slug: "baseline-united", sports: ["Tennis"], timezone: "America/New_York", status: "active", memberCount: 175, location: { city: "New York", country: "USA" }, createdAt: nowIso() },
	{ id: "cl-8", name: "Rim Runners", slug: "rim-runners", sports: ["Basketball"], timezone: "America/Los_Angeles", status: "active", memberCount: 65, location: { city: "Los Angeles", country: "USA" }, createdAt: nowIso() },
	{ id: "cl-9", name: "Feather Flyers", slug: "feather-flyers", sports: ["Badminton"], timezone: "Asia/Singapore", status: "active", memberCount: 95, location: { city: "Singapore", country: "Singapore" }, createdAt: nowIso() },
];

const seedLinks: CommunityClubLink[] = [
	{ communityId: "cm-1", clubId: "cl-1", displayOrder: 1 },
	{ communityId: "cm-1", clubId: "cl-6", displayOrder: 2 },
	{ communityId: "cm-2", clubId: "cl-2", displayOrder: 1 },
	{ communityId: "cm-3", clubId: "cl-3", displayOrder: 1 },
	{ communityId: "cm-5", clubId: "cl-5", displayOrder: 1 },
];

// -------------------- UI helpers --------------------
const sportColor = (s: string) =>
	s === "Pickleball" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
	s === "Badminton" ? "bg-sky-100 text-sky-700 border-sky-200" :
	s === "Tennis" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
	s === "Basketball" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-muted text-muted-foreground";

const VisibilityBadge: React.FC<{ v: CommunityVisibility }> = ({ v }) => (
	<Badge variant={v === "public" ? "success" : v === "private" ? "warning" : "outline"} className="capitalize">{v}</Badge>
);

// -------------------- Subcomponents --------------------
const DraggableRow: React.FC<{ id: string; children: React.ReactNode; onActivate?: () => void }> = ({ id, children }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
	const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? 0.7 : 1 } as React.CSSProperties;
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-lg border bg-card p-2 flex items-center gap-2">
			<GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden />
			<div className="flex-1 min-w-0">{children}</div>
		</div>
	);
};

const DroppableArea: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
	const { isOver, setNodeRef } = useDroppable({ id });
	return (
		<div ref={setNodeRef} className={`space-y-2 ${isOver ? "bg-muted/40 p-2 rounded-md" : ""}`}>{children}</div>
	);
};

// -------------------- Main Page --------------------
const CommunitiesClubsAdminPage: React.FC = () => {
	// Data state
	const [communities, setCommunities] = useState<Community[]>(seedCommunities);
	const [clubs, setClubs] = useState<Club[]>(seedClubs);
	const [links, setLinks] = useState<CommunityClubLink[]>(seedLinks);

	// UI state
	const [search, setSearch] = useState("");
	const [sportFilter, setSportFilter] = useState<string>("All");
	const [visibilityFilter, setVisibilityFilter] = useState<string>("All");
	const countries = useMemo(() => Array.from(new Set(communities.map((c) => c.location.country))), [communities]);
	const [countryFilter, setCountryFilter] = useState<string>("All");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [sortBy, setSortBy] = useState<"name" | "clubs" | "updated">("name");
	const [page, setPage] = useState(1);
	const pageSize = 10;

	// Dialog/Drawer state
	const [manageFor, setManageFor] = useState<Community | null>(null);
	const [openCommunityDialog, setOpenCommunityDialog] = useState(false);
	const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
	const [openClubDialog, setOpenClubDialog] = useState(false);

	// Derived
	const filtered = useMemo(() => {
		let list = communities.slice();
		if (sportFilter !== "All") list = list.filter((c) => c.sports.includes(sportFilter));
		if (visibilityFilter !== "All") list = list.filter((c) => c.visibility === visibilityFilter);
		if (countryFilter !== "All") list = list.filter((c) => c.location.country === countryFilter);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((c) => [c.name, c.slug, c.location.city, c.location.country, ...c.sports].some((v) => v?.toLowerCase().includes(q)));
		}
		if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
		if (sortBy === "clubs") list.sort((a, b) => countClubs(b.id) - countClubs(a.id));
		if (sortBy === "updated") list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
		return list;
	}, [communities, links, search, sportFilter, visibilityFilter, countryFilter, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

	function countClubs(communityId: string) {
		return links.filter((l) => l.communityId === communityId).length;
	}

	function toggleSelect(id: string) {
		setSelectedIds((prev) => {
			const n = new Set(prev);
			n.has(id) ? n.delete(id) : n.add(id);
			return n;
		});
	}

	function clearFilters() {
		setSearch(""); setSportFilter("All"); setVisibilityFilter("All"); setCountryFilter("All"); setPage(1);
	}

	// Create/Edit Community minimal form (without external libs)
	function openCreateCommunity() { setEditingCommunity(null); setOpenCommunityDialog(true); }
	function openEditCommunity(c: Community) { setEditingCommunity(c); setOpenCommunityDialog(true); }

	async function submitCommunity(form: Partial<Community>) {
		if (!form.name || form.name.trim().length < 3) return alert("Name must be at least 3 characters");
		const baseSlug = slugify(form.slug || form.name);
		const unique = uniqueSlugGuard(communities.map((c) => c.slug), baseSlug);
		if (editingCommunity) {
			const updated: Community = { ...editingCommunity, ...form, slug: unique, updatedAt: nowIso() } as Community;
			const saved = await mockApi.updateCommunity(updated);
			setCommunities((prev) => prev.map((c) => c.id === saved.id ? saved : c));
		} else {
			const toCreate: Omit<Community, "id" | "createdAt" | "updatedAt"> = {
				name: form.name!, slug: unique, sports: form.sports || ["Pickleball"], visibility: (form.visibility as CommunityVisibility) || "public",
				joinPolicy: (form.joinPolicy as JoinPolicy) || "auto", location: form.location || { city: "", country: "" }, coverImageUrl: form.coverImageUrl,
				description: form.description, rules: form.rules,
			};
			const created = await mockApi.createCommunity(toCreate);
			setCommunities((prev) => [created, ...prev]);
		}
		setOpenCommunityDialog(false);
	}

	async function submitClub(form: Partial<Club>, linkToCommunityId?: string) {
		if (!form.name || !form.slug) return alert("Club name and slug are required");
		const created = await mockApi.createClub({ name: form.name, slug: slugify(form.slug), sports: form.sports || ["Pickleball"], timezone: form.timezone || "UTC", contactEmail: form.contactEmail, logoUrl: form.logoUrl, status: "active" });
		setClubs((prev) => [created, ...prev]);
		if (linkToCommunityId) {
			const maxOrder = Math.max(0, ...links.filter((l) => l.communityId === linkToCommunityId).map((l) => l.displayOrder));
			const newLink = await mockApi.linkClub({ communityId: linkToCommunityId, clubId: created.id, displayOrder: maxOrder + 1 });
			setLinks((prev) => [...prev, newLink]);
		}
		setOpenClubDialog(false);
	}

	// Manage clubs drawer helpers
	const attachedClubs = (communityId: string) => links
		.filter((l) => l.communityId === communityId)
		.sort((a, b) => a.displayOrder - b.displayOrder)
		.map((l) => ({ link: l, club: clubs.find((c) => c.id === l.clubId)! }))
		.filter((x) => Boolean(x.club));

	function onManageDragEnd(e: DragEndEvent, communityId: string) {
		const { active, over } = e; if (!over || active.id === over.id) return;
		setLinks((prev) => {
			const scoped = prev.filter((l) => l.communityId === communityId).sort((a, b) => a.displayOrder - b.displayOrder);
			const others = prev.filter((l) => l.communityId !== communityId);
			const fromIdx = scoped.findIndex((l) => l.clubId === active.id);
			const toIdx = scoped.findIndex((l) => l.clubId === String(over.id));
			if (fromIdx < 0 || toIdx < 0) return prev;
			const copy = scoped.slice();
			const [moved] = copy.splice(fromIdx, 1);
			copy.splice(toIdx, 0, moved);
			// reindex
			const reindexed = copy.map((l, i) => ({ ...l, displayOrder: i + 1 }));
			void mockApi.reorderLinks(reindexed);
			return [...others, ...reindexed];
		});
	}

	function unlinkClub(communityId: string, clubId: string) {
		if (!confirm("Unlink this club?")) return;
		void mockApi.unlinkClub();
		setLinks((prev) => prev.filter((l) => !(l.communityId === communityId && l.clubId === clubId)));
	}

	function attachClub(communityId: string, clubId: string) {
		const maxOrder = Math.max(0, ...links.filter((l) => l.communityId === communityId).map((l) => l.displayOrder));
		void mockApi.linkClub({ communityId, clubId, displayOrder: maxOrder + 1 }).then((link) => setLinks((prev) => [...prev, link]));
	}

	// -------------------- Render --------------------
	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold">Communities & Clubs</h1>
					<p className="text-sm text-muted-foreground">Create communities and manage linked clubs</p>
				</div>
				<div className="flex items-center gap-2">
					<Button className="bg-[#FF7A29] hover:bg-[#E63900]" onClick={openCreateCommunity}><Plus className="h-4 w-4 mr-1" />Create Community</Button>
					<Button variant="outline" onClick={() => setOpenClubDialog(true)}><Building2 className="h-4 w-4 mr-1" />Create Club</Button>
					<Button variant="outline"><Upload className="h-4 w-4 mr-1" />Import CSV</Button>
					<Button variant="outline"><Download className="h-4 w-4 mr-1" />Export CSV</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="rounded-xl border bg-card p-3 shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center gap-2">
					<div className="flex-1 flex items-center gap-2">
						<div className="relative w-full md:w-80">
							<Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
							<Input className="pl-8" placeholder="Search name, slug, sport, location" value={search} onChange={(e) => setSearch(e.target.value)} />
						</div>
						<select className="h-9 rounded-md border bg-background px-3 text-sm" value={sportFilter} onChange={(e) => { setSportFilter(e.target.value); setPage(1); }}>
							<option value="All">All Sports</option>
							{["Pickleball","Badminton","Tennis","Basketball"].map((s) => <option key={s} value={s}>{s}</option>)}
						</select>
						<select className="h-9 rounded-md border bg-background px-3 text-sm" value={visibilityFilter} onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1); }}>
							<option value="All">All Visibility</option>
							{["public","private","hidden"].map((v) => <option key={v} value={v}>{v}</option>)}
						</select>
						<select className="h-9 rounded-md border bg-background px-3 text-sm" value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}>
							<option value="All">All Countries</option>
							{countries.map((c) => <option key={c} value={c}>{c}</option>)}
						</select>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={clearFilters}><FilterIcon className="h-4 w-4 mr-1" />Clear</Button>
						<select className="h-9 rounded-md border bg-background px-3 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
							<option value="name">Sort: Name</option>
							<option value="clubs">Sort: Clubs</option>
							<option value="updated">Sort: Updated</option>
						</select>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card shadow-sm overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/40">
						<tr>
							<th className="p-3"><input type="checkbox" aria-label="Select all" onChange={(e) => e.target.checked ? setSelectedIds(new Set(pageItems.map((c) => c.id))) : setSelectedIds(new Set())} checked={pageItems.every((c) => selectedIds.has(c.id)) && pageItems.length > 0} /></th>
							<th className="p-3 text-left">Community</th>
							<th className="p-3 text-left">Sports</th>
							<th className="p-3 text-left">Visibility</th>
							<th className="p-3 text-left">Location</th>
							<th className="p-3 text-left">Clubs</th>
							<th className="p-3 text-left">Updated</th>
							<th className="p-3 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{pageItems.map((c) => (
							<tr key={c.id} className="border-t hover:bg-muted/20">
								<td className="p-3 align-top"><input type="checkbox" aria-label={`Select ${c.name}`} checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
								<td className="p-3 align-top">
									<div className="font-medium leading-tight flex items-center gap-2">
										<span>{c.name}</span>
										{typeof c.memberCount === 'number' && (
											<span className="inline-flex items-center text-xs text-muted-foreground gap-1"><Users className="h-3.5 w-3.5" />{c.memberCount}</span>
										)}
										{typeof c.upcomingEventsCount === 'number' && (
											<span className="inline-flex items-center text-xs text-muted-foreground gap-1"><Calendar className="h-3.5 w-3.5" />{c.upcomingEventsCount}</span>
										)}
									</div>
									<div className="text-xs text-muted-foreground">{c.slug}</div>
								</td>
								<td className="p-3 align-top">
									<div className="flex flex-wrap gap-1">
										{c.sports.map((s) => <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border ${sportColor(s)}`}>{s}</span>)}
									</div>
								</td>
								<td className="p-3 align-top"><VisibilityBadge v={c.visibility} /></td>
								<td className="p-3 align-top"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.location.city}, {c.location.country}</span>
									{c.tags?.length ? (
										<div className="mt-1 flex flex-wrap gap-1">{c.tags!.slice(0,3).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">#{t}</span>)}</div>
									) : null}
								</td>
								<td className="p-3 align-top">{countClubs(c.id)}</td>
								<td className="p-3 align-top">{new Date(c.updatedAt).toLocaleDateString()}</td>
								<td className="p-3 align-top">
									<div className="flex items-center gap-2">
										<Button size="sm" variant="outline" onClick={() => openEditCommunity(c)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
										<Button size="sm" onClick={() => setManageFor(c)}><Link2 className="h-4 w-4 mr-1" />Manage clubs</Button>
										<Button size="sm" variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>
									</div>
								</td>
							</tr>
						))}
						{pageItems.length === 0 && (
							<tr>
								<td colSpan={8} className="p-8">
									<div className="rounded-xl border bg-card p-8 text-center">
										<p className="text-sm text-muted-foreground">No communities match your filters.</p>
										<div className="mt-3"><Button onClick={openCreateCommunity} className="bg-[#FF7A29] hover:bg-[#E63900]"><Plus className="h-4 w-4 mr-1" />Create Community</Button></div>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Bulk actions & pagination */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button variant="outline" disabled={selectedIds.size === 0} onClick={() => alert("Archive (mock)")}>Archive</Button>
					<Button variant="outline" disabled={selectedIds.size === 0} onClick={() => confirm("Delete selected?") && setCommunities((prev) => prev.filter((c) => !selectedIds.has(c.id)))}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
					<div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
					<Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
				</div>
			</div>

			{/* Manage clubs overlay */}
			<ResponsiveOverlay
				open={!!manageFor}
				onOpenChange={(v) => !v && setManageFor(null)}
				title={`Manage clubs • ${manageFor?.name ?? ""}`}
				ariaLabel="Manage clubs"
				footer={(
					<div className="flex items-center justify-end gap-2">
						<Button variant="outline" onClick={() => setManageFor(null)}>Close</Button>
					</div>
				)}
			>
				<div className="space-y-4">
						{/* Community summary */}
						{manageFor && (
							<div className="rounded-lg border p-3 bg-card">
								<div className="flex items-center gap-2">
									<Globe2 className="h-4 w-4" />
									<p className="text-sm font-medium">{manageFor.location.city}, {manageFor.location.country}</p>
									<div className="flex items-center gap-3 ml-auto">
										{typeof manageFor.memberCount === 'number' && (
											<span className="inline-flex items-center text-xs text-muted-foreground gap-1"><Users className="h-3.5 w-3.5" />{manageFor.memberCount}</span>
										)}
										{typeof manageFor.upcomingEventsCount === 'number' && (
											<span className="inline-flex items-center text-xs text-muted-foreground gap-1"><Calendar className="h-3.5 w-3.5" />{manageFor.upcomingEventsCount}</span>
										)}
										<div className="flex flex-wrap gap-1">
											{manageFor.sports.map((s) => <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border ${sportColor(s)}`}>{s}</span>)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Attached clubs */}
						{manageFor && (
							<div className="space-y-3">
								<p className="text-sm font-semibold">Attached Clubs</p>
								<DndContext onDragEnd={(e) => onManageDragEnd(e, manageFor.id)}>
									<DroppableArea id={`links-${manageFor.id}`}>
										{attachedClubs(manageFor.id).map(({ club }) => (
											<DraggableRow key={club.id} id={club.id}>
												<div className="flex items-center gap-3">
													<div className="h-8 w-8 rounded-md border bg-muted" aria-hidden />
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">{club.name} <span className="text-xs text-muted-foreground">• {club.slug}</span></p>
														<div className="flex flex-wrap gap-1">
															{club.sports.map((s) => <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border ${sportColor(s)}`}>{s}</span>)}
														</div>
													</div>
													<Badge variant={club.status === "active" ? "success" : "destructive"} className="ml-auto">{club.status}</Badge>
													<div className="flex items-center gap-2 ml-2">
														<Button size="sm" variant="outline">View</Button>
														<Button size="sm" variant="outline" onClick={() => unlinkClub(manageFor.id, club.id)}>Unlink</Button>
													</div>
											</div>
											</DraggableRow>
										))}
									</DroppableArea>
								</DndContext>
							</div>
						)}

						{/* Attach club */}
						{manageFor && (
							<div className="space-y-2">
								<p className="text-sm font-semibold">Attach club</p>
								<div className="flex items-center gap-2">
									<select className="h-9 rounded-md border bg-background px-3 text-sm" id="attach-select">
										{clubs.filter((cl) => !links.some((l) => l.communityId === manageFor.id && l.clubId === cl.id)).map((cl) => (
											<option key={cl.id} value={cl.id}>{cl.name}</option>
										))}
									</select>
									<Button variant="outline" onClick={() => {
										const sel = (document.getElementById("attach-select") as HTMLSelectElement);
										if (sel?.value) attachClub(manageFor.id, sel.value);
									}}>Attach</Button>
								</div>
							</div>
						)}

						{/* Create & attach club */}
						{manageFor && (
							<div className="pt-3 border-t">
								<p className="text-sm font-semibold mb-2">Create & attach new club</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
									<input id="club-name" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Club name" />
									<input id="club-slug" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="slug" />
									<input id="club-sports" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="sports (comma-separated)" />
									<input id="club-tz" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="timezone" />
									<input id="club-email" className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="contact email (optional)" />
								</div>
								<div className="mt-2">
									<Button variant="outline" onClick={() => {
										const nm = (document.getElementById("club-name") as HTMLInputElement)?.value?.trim();
										const sg = (document.getElementById("club-slug") as HTMLInputElement)?.value?.trim();
										const sp = (document.getElementById("club-sports") as HTMLInputElement)?.value?.split(",").map((s) => s.trim()).filter(Boolean);
										const tz = (document.getElementById("club-tz") as HTMLInputElement)?.value?.trim();
										const em = (document.getElementById("club-email") as HTMLInputElement)?.value?.trim();
										if (!nm || !sg || !sp?.length) return alert("Name, slug, sports required");
										void submitClub({ name: nm, slug: sg, sports: sp, timezone: tz || "UTC", contactEmail: em }, manageFor!.id);
									}}>Create & Attach</Button>
								</div>
							</div>
						)}
				</div>
			</ResponsiveOverlay>

			{/* Create/Edit Community Dialog */}
			<ResponsiveOverlay
				open={openCommunityDialog}
				onOpenChange={setOpenCommunityDialog}
				title={editingCommunity ? "Edit Community" : "Create Community"}
				ariaLabel={editingCommunity ? "Edit Community" : "Create Community"}
				footer={(
					<div className="flex items-center gap-2">
						<Button onClick={() => submitCommunity({
							name: (document.getElementById("cm-name") as HTMLInputElement)?.value,
							slug: (document.getElementById("cm-slug") as HTMLInputElement)?.value,
							sports: (document.getElementById("cm-sports") as HTMLInputElement)?.value?.split(",").map((s) => s.trim()).filter(Boolean),
							visibility: (document.getElementById("cm-vis") as HTMLSelectElement)?.value as CommunityVisibility,
							joinPolicy: (document.getElementById("cm-join") as HTMLSelectElement)?.value as JoinPolicy,
							location: { city: (document.getElementById("cm-city") as HTMLInputElement)?.value, country: (document.getElementById("cm-country") as HTMLInputElement)?.value },
							coverImageUrl: (document.getElementById("cm-cover") as HTMLInputElement)?.value,
							description: (document.getElementById("cm-desc") as HTMLTextAreaElement)?.value,
							rules: (document.getElementById("cm-rules") as HTMLTextAreaElement)?.value,
						})} className="bg-[#FF7A29] hover:bg-[#E63900]">{editingCommunity ? "Save" : "Create"}</Button>
						<Button variant="outline" onClick={() => setOpenCommunityDialog(false)}>Cancel</Button>
					</div>
				)}
			>
				<div className="space-y-3">
						<label className="space-y-1 block">
							<span className="text-sm">Name</span>
							<Input defaultValue={editingCommunity?.name || ""} id="cm-name" />
						</label>
															<label className="space-y-1 block">
										<span className="text-sm">Slug</span>
										<Input defaultValue={editingCommunity?.slug || ""} id="cm-slug" />
									</label>
									<div className="grid grid-cols-2 gap-2">
										<label className="space-y-1 block"><span className="text-sm">Timezone</span><Input defaultValue={editingCommunity?.timezone || ""} id="cm-tz" /></label>
										<label className="space-y-1 block"><span className="text-sm">Tags (comma-separated)</span><Input defaultValue={editingCommunity?.tags?.join(", ") || ""} id="cm-tags" /></label>
									</div>
						<label className="space-y-1 block">
							<span className="text-sm">Sports (comma-separated)</span>
							<Input defaultValue={editingCommunity?.sports.join(", ") || "Pickleball"} id="cm-sports" />
						</label>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1 block">
								<span className="text-sm">Visibility</span>
								<select id="cm-vis" defaultValue={editingCommunity?.visibility || "public"} className="h-9 rounded-md border bg-background px-3 text-sm">
									<option value="public">public</option>
									<option value="private">private</option>
									<option value="hidden">hidden</option>
								</select>
							</label>
							<label className="space-y-1 block">
								<span className="text-sm">Join Policy</span>
								<select id="cm-join" defaultValue={editingCommunity?.joinPolicy || "auto"} className="h-9 rounded-md border bg-background px-3 text-sm">
									<option value="auto">auto</option>
									<option value="approval">approval</option>
								</select>
							</label>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<label className="space-y-1 block">
								<span className="text-sm">City</span>
								<Input defaultValue={editingCommunity?.location.city || ""} id="cm-city" />
							</label>
							<label className="space-y-1 block">
								<span className="text-sm">Country</span>
								<Input defaultValue={editingCommunity?.location.country || ""} id="cm-country" />
							</label>
						</div>
						<label className="space-y-1 block">
							<span className="text-sm">Cover Image URL</span>
							<Input defaultValue={editingCommunity?.coverImageUrl || ""} id="cm-cover" />
						</label>
						<label className="space-y-1 block">
							<span className="text-sm">Description</span>
							<textarea id="cm-desc" className="w-full rounded-md border bg-background px-3 py-2 text-sm" defaultValue={editingCommunity?.description || ""} />
						</label>
						<label className="space-y-1 block">
							<span className="text-sm">Rules</span>
							<textarea id="cm-rules" className="w-full rounded-md border bg-background px-3 py-2 text-sm" defaultValue={editingCommunity?.rules || ""} />
						</label>
				</div>
			</ResponsiveOverlay>

			{/* Create Club Dialog */}
			<ResponsiveOverlay
				open={openClubDialog}
				onOpenChange={setOpenClubDialog}
				title="Create Club"
				ariaLabel="Create Club"
				footer={(
					<div className="flex items-center gap-2">
						<Button onClick={() => submitClub({
							name: (document.getElementById("nclub-name") as HTMLInputElement)?.value,
							slug: (document.getElementById("nclub-slug") as HTMLInputElement)?.value,
							sports: (document.getElementById("nclub-sports") as HTMLInputElement)?.value?.split(",").map((s) => s.trim()).filter(Boolean),
							timezone: (document.getElementById("nclub-tz") as HTMLInputElement)?.value,
							contactEmail: (document.getElementById("nclub-email") as HTMLInputElement)?.value,
						})} className="bg-[#FF7A29] hover:bg-[#E63900]">Create</Button>
						<Button variant="outline" onClick={() => setOpenClubDialog(false)}>Cancel</Button>
					</div>
				)}
			>
				<div className="space-y-3">
						<label className="space-y-1 block"><span className="text-sm">Name</span><Input id="nclub-name" /></label>
						<label className="space-y-1 block"><span className="text-sm">Slug</span><Input id="nclub-slug" /></label>
						<label className="space-y-1 block"><span className="text-sm">Sports (comma-separated)</span><Input id="nclub-sports" defaultValue="Pickleball" /></label>
						<label className="space-y-1 block"><span className="text-sm">Timezone</span><Input id="nclub-tz" defaultValue="UTC" /></label>
						<label className="space-y-1 block"><span className="text-sm">Contact email (optional)</span><Input id="nclub-email" /></label>
				</div>
			</ResponsiveOverlay>
		</div>
	);
};

export default CommunitiesClubsAdminPage;