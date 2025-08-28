import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResponsiveOverlay from "@/components/responsive-overlay";
import React, { useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import type { SportItem } from "../page";

interface EditCreateSheetProps {
  openEdit: boolean;
  setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>;
  editing: boolean;
  form: SportItem;
  setForm: React.Dispatch<React.SetStateAction<SportItem>>;
  save: React.FormEventHandler;
  toggleEquipment: (equipment: string) => void;
  facilities: string[];
  equipments: string[];
}

const EditCreateSheet: React.FC<EditCreateSheetProps> = ({
  openEdit,
  setOpenEdit,
  editing,
  form,
  setForm,
  save,
  toggleEquipment,
  facilities,
  equipments,
}) => {
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

  const handleAddPosition = () => {
    if (newPosition.trim()) {
      setForm((prev) => ({
        ...prev,
        positions: [...prev.positions, newPosition.trim()],
      }));
      setNewPosition(""); 
    }
  };
  const handleRemovePosition = (position: string) => {
    setForm((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p !== position), 
    }));
  };
  return (
    <ResponsiveOverlay
      open={openEdit}
      onOpenChange={setOpenEdit}
      title={editing ? "Edit Sport" : "Add Sport"}
      ariaLabel={editing ? "Edit Sport" : "Add Sport"}
      footer={(
        <div className="flex gap-2">
          <Button type="submit" form="sport-form">Save</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenEdit(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    >
        <form id="sport-form" onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm">Sport Name</span>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm">Description</span>
              <textarea
                className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Type of Sport</span>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    type: e.target.value as SportItem["type"],
                  }))
                }
              >
                <option value="Team">Team</option>
                <option value="Individual">Individual</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm">Category</span>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category: e.target.value as SportItem["category"],
                  }))
                }
              >
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
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.level}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    level: e.target.value as SportItem["level"],
                  }))
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm">Coaching Availability</span>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.coaching}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    coaching: e.target.value as SportItem["coaching"],
                  }))
                }
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm">Number of Players</span>
              <Input
                type="number"
                min={1}
                value={form.numPlayers}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    numPlayers: Number(e.target.value),
                  }))
                }
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Court/Field Assigned</span>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.facility}
                onChange={(e) =>
                  setForm((p) => ({ ...p, facility: e.target.value }))
                }
              >
                {facilities.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
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
                    className={`px-2 py-1 rounded-md text-xs border ${
                      form.equipment.includes(e)
                        ? "bg-primary text-white border-primary"
                        : "bg-background"
                    }`}
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
                  <Badge
                    key={p}
                    variant="ghost"
                    className="px-2 py-1 rounded-md text-xs border h-10"
                  >
                    {p}
                    <button
                      type="button"
                      className="ml-1 text-xs text-muted-foreground"
                      onClick={() => handleRemovePosition(p)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}

                <div className="flex items-center gap-2">
                  <Input
                    className="w-full"
                    placeholder="Add a new position"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={handleAddPosition}>
                    Add
                  </Button>
                </div>
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-sm">Status</span>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as SportItem["status"],
                  }))
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            {/* File dropzone for the banner */}
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm">Upload Banner Image</span>
              <div
                {...getRootProps()}
                className="w-full h-32 border-2 border-dashed flex justify-center items-center bg-background rounded-md cursor-pointer"
              >
                <input {...getInputProps()} />
                <span className="text-sm">Drag & Drop or Click to Upload</span>
              </div>
              {form.bannerUrl && (
                <div className="mt-2">
                  <img
                    src={form.bannerUrl}
                    alt="Banner"
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </label>
          </div>
        </form>
    </ResponsiveOverlay>
  );
};

export default EditCreateSheet;
