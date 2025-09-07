import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDropzone } from 'react-dropzone';
import { Calendar, Clock, DollarSign, Star, Edit3, Plus, Trash2 } from 'lucide-react';
import TimeSlotManager from '@/components/TimeSlotManager';
import type { CourtFormData } from '@/types/court.types';

interface CourtFormProps {
  form: CourtFormData;
  setForm: React.Dispatch<React.SetStateAction<CourtFormData>>;
  editing: boolean;
  isLoading: boolean;
}

const CourtForm: React.FC<CourtFormProps> = ({ form, setForm, editing, isLoading }) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setForm((p) => ({
      ...p,
      images: [...(p.images ?? []).filter(Boolean), ...acceptedFiles],
    }));
  }, [setForm]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const updateImage = (idx: number, value: string) => {
    setForm((p) => ({
      ...p,
      images: (p.images ?? []).map((s, i) => (i === idx ? value : s)),
    }));
  };

  const addImageField = () => {
    setForm((p) => ({ ...p, images: [...(p.images ?? []), ""] }));
  };

  const removeImageField = (idx: number) => {
    setForm((p) => ({
      ...p,
      images: (p.images ?? []).filter((_, i) => i !== idx),
    }));
  };

  const getImagePreview = (image: string | File): string => {
    if (typeof image === 'string') {
      return image;
    } else {
      return URL.createObjectURL(image);
    }
  };

  const isFile = (image: string | File): image is File => {
    return image instanceof File;
  };

  return (
    <form id="court-form" className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
          <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center shadow-sm">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
            <p className="text-sm text-muted-foreground">Essential details about the court</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Court Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter court name"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Court Number</label>
            <Input
              value={form.courtNumber || ''}
              onChange={(e) => setForm((p) => ({ ...p, courtNumber: e.target.value }))}
              placeholder="Enter court number"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Hub ID *</label>
            <Input
              value={form.hubId || ''}
              onChange={(e) => setForm((p) => ({ ...p, hubId: e.target.value }))}
              placeholder="Enter hub ID"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rental ID *</label>
            <Input
              value={form.rentalId || ''}
              onChange={(e) => setForm((p) => ({ ...p, rentalId: e.target.value }))}
              placeholder="Enter rental ID"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              className="w-full h-11 rounded-md border bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CourtFormData["status"] }))}
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Booked">Booked</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Capacity</label>
            <Input
              type="number"
              min={0}
              value={form.capacity ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
              placeholder="Enter capacity"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
          <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-sm">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Pricing & Booking</h3>
            <p className="text-sm text-muted-foreground">Set rates and booking requirements</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Hourly Rate (₱)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.hourlyRate ?? 0}
                onChange={(e) => setForm((p) => ({ ...p, hourlyRate: Number(e.target.value) }))}
                placeholder="0.00"
                className="h-11 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Hours</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                value={form.minHours ?? 1}
                onChange={(e) => setForm((p) => ({ ...p, minHours: Number(e.target.value) }))}
                placeholder="1"
                className="h-11 pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Availability */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Weekly Availability</h3>
            <p className="text-sm text-muted-foreground">Configure time slots for each day of the week</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set up multiple time slots for each day. You can add different availability periods throughout the day.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(form.availability ?? {}).map(([day, availability]) => (
              <TimeSlotManager
                key={day}
                day={day}
                availability={availability}
                onChange={(newAvailability) =>
                  setForm((p) => ({
                    ...p,
                    availability: {
                      ...p.availability!,
                      [day]: newAvailability,
                    },
                  }))
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-sm">
            <Edit3 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground">Add detailed information about the court</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Court Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Enter a detailed description of the court..."
            className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows={4}
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-sm">
            <Star className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Court Images</h3>
            <p className="text-sm text-muted-foreground">Upload photos to showcase the court</p>
          </div>
        </div>
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragActive 
                ? "border-primary bg-primary/10 shadow-lg" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Upload court images</p>
                <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
              </div>
            </div>
          </div>
          
          {(form.images ?? []).filter(Boolean).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Images</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addImageField}
                  className="h-8 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add URL
                </Button>
              </div>
              
              {/* Image Previews */}
              {(form.images ?? []).filter(Boolean).some(isFile) && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Uploaded Files</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(form.images ?? []).filter(Boolean).filter(isFile).map((file, idx) => (
                      <div key={`preview-${idx}`} className="relative group">
                        <img
                          src={getImagePreview(file)}
                          alt={file.name}
                          className="w-full h-20 object-cover rounded-md border"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <span className="text-white text-xs text-center px-2">
                            {file.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {(form.images ?? []).map((image, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {isFile(image) ? (
                      <div className="flex-1 flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                        <span className="text-sm text-muted-foreground">📁</span>
                        <span className="text-sm font-medium">{image.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(image.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <Input
                        className="flex-1 h-9"
                        placeholder="https://example.com/image.jpg"
                        value={image}
                        onChange={(e) => updateImage(idx, e.target.value)}
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImageField(idx)}
                      className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CourtForm;
