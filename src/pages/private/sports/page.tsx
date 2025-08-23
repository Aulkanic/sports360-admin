import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle
} from "@/components/ui/sheet";
import React, { useMemo, useState } from "react";
import EditCreateSheet from "./sheets/edit-create-sheet";

export interface SportItem {
  id?: string;
  name: string;
  description: string;
  type: "Team" | "Individual";
  category: "Indoor" | "Outdoor" | "Racquet" | "Ball" | "Fitness" | "Other" | "All";
  level: "Beginner" | "Intermediate" | "Advanced";
  coaching: "Available" | "Unavailable";
  numPlayers: number;
  facility: string;
  equipment: string[];
  positions: string[];
  status: "Active" | "Inactive";
  participants?: number;
  imageUrl?: string;
  bannerUrl?: string;
}

const initialSports: SportItem[] = [
  {
    id: "s1",
    name: "Basketball",
    description: "Team-based indoor sport.",
    type: "Team",
    category: "Indoor",
    level: "Intermediate",
    coaching: "Available",
    numPlayers: 10,
    facility: "Court A",
    equipment: ["Basketballs", "Hoop"],
    positions: ["Guard", "Forward", "Center"],
    status: "Active",
    participants: 58,
    bannerUrl: "/bglogin.webp",
  },
  {
    id: "s2",
    name: "Tennis",
    description: "Individual or doubles court sport.",
    type: "Individual",
    category: "Racquet",
    level: "Beginner",
    coaching: "Available",
    numPlayers: 2,
    facility: "Court 2",
    equipment: ["Rackets", "Balls", "Net"],
    positions: ["Player"],
    status: "Active",
    participants: 32,
    bannerUrl: "/bglogin.webp",
  },
  {
    id: "s3",
    name: "Soccer",
    description: "Outdoor team sport.",
    type: "Team",
    category: "Outdoor",
    level: "Advanced",
    coaching: "Unavailable",
    numPlayers: 22,
    facility: "Field 1",
    equipment: ["Soccer Balls", "Nets"],
    positions: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
    status: "Inactive",
    participants: 76,
    bannerUrl: "/bglogin.webp",
  },
];

const facilities = [
  "Court A",
  "Court B",
  "Court 1",
  "Court 2",
  "Field 1",
  "Field 2",
];
const equipments = [
  "Basketballs",
  "Hoop",
  "Rackets",
  "Balls",
  "Net",
  "Soccer Balls",
  "Cones",
];

const SportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportItem[]>(initialSports);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Team" | "Individual">(
    "All"
  );
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<SportItem | null>(null);
 const [form, setForm] = useState<Omit<SportItem, "id">>({
  name: "",
  description: "",
  type: "Team",
  category: "Indoor", 
  level: "Beginner",
  coaching: "Available",
  numPlayers: 0,
  facility: facilities[0],
  equipment: [],
  positions: [],
  status: "Active",
  participants: 0,
  imageUrl: "",
  bannerUrl: "",
});
  const [openDetails, setOpenDetails] = useState(false);
  const [detailItem, setDetailItem] = useState<SportItem | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = sports;
    if (typeFilter !== "All") list = list.filter((s) => s.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) =>
        [
          s.name,
          s.type,
          s.facility,
          s.status,
          s.category,
          s.level,
          s.coaching,
        ].some((v) => v.toLowerCase().includes(q))
      );
    }
    return list;
  }, [sports, typeFilter, query]);

  function validate(): string | null {
    if (!form.name.trim()) return "Sport name is required";
    if (!form.description.trim()) return "Description is required";
    if (isNaN(Number(form.numPlayers)) || Number(form.numPlayers) <= 0)
      return "Number of players must be a positive number";
    if (!form.facility) return "Facility must be selected";
    if (!Array.isArray(form.positions) || form.positions.length === 0)
      return "At least one position is required";
    return null;
  }

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      type: "Team",
      category: "Indoor",
      level: "Beginner",
      coaching: "Available",
      numPlayers: 0,
      facility: facilities[0],
      equipment: [],
      positions: [],
      status: "Active",
      participants: 0,
      imageUrl: "",
      bannerUrl: "",
    });
    setOpenEdit(true);
  }

  function openEditSheet(item: SportItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      level: item.level,
      coaching: item.coaching,
      numPlayers: item.numPlayers,
      facility: item.facility,
      equipment: item.equipment,
      positions: item.positions,
      status: item.status,
      participants: item.participants ?? 0,
      imageUrl: item.imageUrl ?? "",
      bannerUrl: item.bannerUrl ?? "",
    });
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
      setSports((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...editing, ...form } : s))
      );
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

  function toggleEquipment(item: string) {
    setForm((p) => ({
      ...p,
      equipment: p.equipment.includes(item)
        ? p.equipment.filter((e) => e !== item)
        : [...p.equipment, item],
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-semibold">Sports</h1>
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="w-full md:w-80"
            placeholder="Search name, type, category, level"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
          <div
            key={s.id}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            <div className="relative h-28 bg-muted">
              {s.bannerUrl ? (
                <img
                  src={s.bannerUrl}
                  alt="banner"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-primary/20 to-accent/20" />
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={s.status === "Active" ? "success" : "muted"}>
                  {s.status}
                </Badge>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {s.imageUrl || s.bannerUrl ? (
                  <img
                    src={s.imageUrl || s.bannerUrl}
                    alt={s.name}
                    className="h-12 w-12 rounded-md object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md border flex items-center justify-center text-xs text-muted-foreground">
                    No Img
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {s.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Facility: {s.facility}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {s.category} • Level: {s.level} • Coaching:{" "}
                    {s.coaching}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.type}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{s.numPlayers} players</span>
                </div>
                {typeof s.participants === "number" && (
                  <span className="text-muted-foreground">
                    {s.participants} participants
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => openDetailsSheet(s)}>
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditSheet(s)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(s.id ?? '')}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Add Button for Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <Button className="shadow-lg" onClick={openCreate}>
          Add New Sport
        </Button>
      </div>

      {/* Edit/Create Sheet */}
      <EditCreateSheet
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        editing={false} 
        form={form}
        setForm={setForm}
        save={save}
        toggleEquipment={toggleEquipment}
        facilities={facilities}
        equipments={equipments}
      />

      {/* Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Sport Details</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            {detailItem && (
              <>
                <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                  {detailItem.bannerUrl ? (
                    <img
                      src={detailItem.bannerUrl}
                      alt="banner"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-primary/20 to-accent/20" />
                  )}
                </div>
                <div className="flex items-start gap-3">
                  {detailItem.imageUrl ? (
                    <img
                      src={detailItem.imageUrl}
                      alt={detailItem.name}
                      className="h-16 w-16 rounded-md object-cover border mt-2"
                    />
                  ) : null}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {detailItem.name}{" "}
                      <Badge
                        variant={
                          detailItem.status === "Active" ? "success" : "muted"
                        }
                      >
                        {detailItem.status}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {detailItem.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Category: {detailItem.category} • Level:{" "}
                      {detailItem.level} • Coaching: {detailItem.coaching}
                    </p>
                  </div>
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
                    <p className="font-medium">
                      {detailItem.equipment.join(", ") || "-"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Positions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {detailItem.positions.map((p) => (
                        <Badge
                          key={p}
                          variant="ghost"
                          className="border px-2 py-0.5"
                        >
                          {p}
                        </Badge>
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
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this sport? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={doDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsPage;
