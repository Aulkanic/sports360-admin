import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
// import EditCreateSheet from "./sheets/edit-create-sheet";

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
    bannerUrl: "https://tse1.mm.bing.net/th/id/OIP.ozynK9kTsvFKljgxloY4DwHaEK?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
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
    bannerUrl: "https://tse3.mm.bing.net/th/id/OIP.AFq_kvbJ_RaOs4aMPZPX6gHaH2?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: "s3",
    name: "Pickleball",
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
    bannerUrl: "https://beehiiv-images-production.s3.amazonaws.com/uploads/publication/logo/ef1d9f55-de65-4f01-896e-c576ed8ce8e6/pickleball.jpg",
  },
];

// Facility and equipment lists are owned by the form route now

const SportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportItem[]>(initialSports);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Team" | "Individual">(
    "All"
  );
  const navigate = useNavigate();
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

  // Validation handled by form route

  function openCreate() {
    navigate("/super-admin/sports/form", { state: { mode: "create" } });
  }

  function openEditSheet(item: SportItem) {
    navigate("/super-admin/sports/form", { state: { mode: "edit", item } });
  }

  function openDetailsSheet(item: SportItem) {
    setDetailItem(item);
    setOpenDetails(true);
  }

  // Save handled in dedicated form route

  function remove(id: string) {
    setConfirmId(id);
  }
  function doDelete() {
    if (confirmId) setSports((prev) => prev.filter((s) => s.id !== confirmId));
    setConfirmId(null);
  }

  // Form controls handled in dedicated form route

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
            {/* Header & thumbnail (banner removed) */}
            <div className="p-4 flex items-start gap-3">
              {s.imageUrl || s.bannerUrl ? (
                <img
                  src={s.imageUrl || s.bannerUrl}
                  alt={s.name}
                  className="h-14 w-14 rounded-md object-cover border"
                />
              ) : (
                <div className="h-14 w-14 rounded-md border flex items-center justify-center text-xs text-muted-foreground">
                  No Img
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-tight">{s.name}</h3>
                  <Badge variant={s.status === "Active" ? "success" : "muted"}>{s.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{s.type}</Badge>
                  <Badge variant="outline">{s.category}</Badge>
                  <Badge variant="outline">Level: {s.level}</Badge>
                  <Badge variant={s.coaching === "Available" ? "success" : "muted"}>
                    {s.coaching === "Available" ? "Coaching available" : "No coaching"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="px-4 pb-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Facility: <span className="font-medium text-foreground">{s.facility}</span></span>
                <span>Players: <span className="font-medium text-foreground">{s.numPlayers}</span></span>
                {typeof s.participants === "number" && (
                  <span>Participants: <span className="font-medium text-foreground">{s.participants}</span></span>
                )}
              </div>
            </div>

            {/* Equipment & positions preview */}
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {s.equipment.slice(0, 3).map((eq) => (
                  <Badge key={eq} variant="ghost" className="border px-2 py-0.5 text-xs">
                    {eq}
                  </Badge>
                ))}
                {s.equipment.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{s.equipment.length - 3} more</span>
                )}
              </div>
              {s.positions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {s.positions.slice(0, 3).map((p) => (
                    <Badge key={p} variant="ghost" className="border px-2 py-0.5 text-xs">
                      {p}
                    </Badge>
                  ))}
                  {s.positions.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{s.positions.length - 3} more roles</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4">
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

      {/* Edit/Create moved to full-page form route */}

      {/* Details overlay */}
      <ResponsiveOverlay open={openDetails} onOpenChange={setOpenDetails} title="Sport Details" ariaLabel="Sport Details">
          <div className="space-y-4">
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
                      {detailItem.name} {" "}
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
                      Category: {detailItem.category} • Level: {" "}
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
      </ResponsiveOverlay>

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
