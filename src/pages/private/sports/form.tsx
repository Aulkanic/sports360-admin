import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropzone, type Accept } from "react-dropzone";

type SportItem = {
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
};

const facilities = ["Court A", "Court B", "Court 1", "Court 2", "Field 1", "Field 2"];
const equipments = ["Basketballs", "Hoop", "Rackets", "Balls", "Net", "Soccer Balls", "Cones"];

const SportsFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { mode?: "create" | "edit"; item?: SportItem } };
  const isEditing = state?.mode === "edit" && !!state?.item;

  const [form, setForm] = useState<Omit<SportItem, "id">>(() => ({
    name: state?.item?.name ?? "",
    description: state?.item?.description ?? "",
    type: state?.item?.type ?? "Team",
    category: state?.item?.category ?? "Indoor",
    level: state?.item?.level ?? "Beginner",
    coaching: state?.item?.coaching ?? "Available",
    numPlayers: state?.item?.numPlayers ?? 0,
    facility: state?.item?.facility ?? facilities[0],
    equipment: state?.item?.equipment ?? [],
    positions: state?.item?.positions ?? [],
    status: state?.item?.status ?? "Active",
    participants: state?.item?.participants ?? 0,
    imageUrl: state?.item?.imageUrl ?? "",
    bannerUrl: state?.item?.bannerUrl ?? "",
  }));

  const [newPosition, setNewPosition] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileUrl = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, bannerUrl: fileUrl }));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*" as unknown as Accept,
  });

  const title = isEditing ? "Edit Sport" : "Add Sport";

  function validate(): string | null {
    if (!form.name.trim()) return "Sport name is required";
    if (!form.description.trim()) return "Description is required";
    if (isNaN(Number(form.numPlayers)) || Number(form.numPlayers) <= 0) return "Number of players must be a positive number";
    if (!form.facility) return "Facility must be selected";
    if (!Array.isArray(form.positions) || form.positions.length === 0) return "At least one position is required";
    return null;
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) return alert(error);
    // In a real app, call API then navigate.
    alert(`${isEditing ? "Updated" : "Created"} sport: ${form.name}`);
    navigate(-1);
  }

  function toggleEquipment(equipment: string) {
    setForm((p) => ({
      ...p,
      equipment: p.equipment.includes(equipment)
        ? p.equipment.filter((x) => x !== equipment)
        : [...p.equipment, equipment],
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button form="sport-form-page" type="submit">Save</Button>
        </div>
      </div>

      <form id="sport-form-page" onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm">Sport Name</span>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm">Description</span>
            <textarea className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm">Type of Sport</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as SportItem["type"] }))}>
              <option value="Team">Team</option>
              <option value="Individual">Individual</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm">Category</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as SportItem["category"] }))}>
              <option value="All">All Categories</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Racquet">Racquet</option>
              <option value="Fitness">Fitness</option>
              <option value="Ball">Ball</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm">Level / Skill</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as SportItem["level"] }))}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm">Coaching Availability</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.coaching} onChange={(e) => setForm((p) => ({ ...p, coaching: e.target.value as SportItem["coaching"] }))}>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm">Number of Players</span>
            <Input type="number" min={1} value={form.numPlayers} onChange={(e) => setForm((p) => ({ ...p, numPlayers: Number(e.target.value) }))} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm">Court/Field Assigned</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.facility} onChange={(e) => setForm((p) => ({ ...p, facility: e.target.value }))}>
              {facilities.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm">Available Equipment</span>
            <div className="flex flex-wrap gap-2">
              {equipments.map((e) => (
                <button key={e} type="button" className={`px-2 py-1 rounded-md text-xs border ${form.equipment.includes(e) ? "bg-primary text-white border-primary" : "bg-background"}`} onClick={() => toggleEquipment(e)}>
                  {e}
                </button>
              ))}
            </div>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm">Positions</span>
            <div className="flex flex-wrap items-center gap-2">
              {form.positions.map((p) => (
                <Badge key={p} variant="ghost" className="px-2 py-1 rounded-md text-xs border h-10">
                  {p}
                  <button type="button" className="ml-1 text-xs text-muted-foreground" onClick={() => setForm((prev) => ({ ...prev, positions: prev.positions.filter((x) => x !== p) }))}>×</button>
                </Badge>
              ))}
              <div className="flex items-center gap-2">
                <Input className="w-full" placeholder="Add a new position" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} />
                <Button type="button" size="sm" onClick={() => { if (newPosition.trim()) { setForm((prev) => ({ ...prev, positions: [...prev.positions, newPosition.trim()] })); setNewPosition(""); } }}>Add</Button>
              </div>
            </div>
          </label>
          <label className="space-y-1">
            <span className="text-sm">Status</span>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SportItem["status"] }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm">Upload Banner Image</span>
            <div {...getRootProps()} className="w-full h-32 border-2 border-dashed flex justify-center items-center bg-background rounded-md cursor-pointer">
              <input {...getInputProps()} />
              <span className="text-sm">Drag & Drop or Click to Upload</span>
            </div>
            {form.bannerUrl && (
              <div className="mt-2">
                <img src={form.bannerUrl} alt="Banner" className="max-w-full h-auto" />
              </div>
            )}
          </label>
        </div>
      </form>
    </div>
  );
};

export default SportsFormPage;

