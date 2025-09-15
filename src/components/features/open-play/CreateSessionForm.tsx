import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Settings, Star } from 'lucide-react';
import type { Court } from '@/types/court.types';

type LevelTag = "Beginner" | "Intermediate" | "Advanced";

export interface CreateSessionFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  price: number;
  isFreeJoin: boolean;
  courtId: string;
  eventType: "one-time" | "recurring" | "tournament";
  // Recurring fields
  frequency: "daily" | "weekly" | "monthly";
  endDate: string;
  // Tournament fields
  tournamentFormat: "single-elimination" | "double-elimination" | "round-robin";
  prize: string;
  registrationDeadline: string;
  levels: { Beginner: boolean; Intermediate: boolean; Advanced: boolean };
}

interface CreateSessionFormProps {
  form: CreateSessionFormData;
  setForm: React.Dispatch<React.SetStateAction<CreateSessionFormData>>;
  courts: Court[];
  courtsLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

// Helper function to generate recurring occurrences
const generateRecurringOccurrences = (
  startDate: string,
  endDate: string,
  frequency: "daily" | "weekly" | "monthly",
  startTime: string,
  endTime: string,
  maxOccurrences: number = 50
) => {
  const occurrences = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);
  
  while (current <= end && occurrences.length < maxOccurrences) {
    occurrences.push({
      date: current.toISOString().split('T')[0],
      startTime,
      endTime,
    });
    
    switch (frequency) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return occurrences;
};

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  form,
  setForm,
  courts,
  courtsLoading,
  onSubmit,
}) => {
  return (
    <form id="open-play-create-form" onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Session Details</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Set the date and time range for your session. The end time must be after the start time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Session Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Pickleball Open Play"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Event Type *</label>
            <select
              className="w-full h-11 rounded-md border bg-background px-3 text-sm"
              value={form.eventType}
              onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value as "one-time" | "recurring" | "tournament" }))}
              required
            >
              <option value="one-time">One-time Event</option>
              <option value="recurring">Recurring Event</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date *</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Start Time *</label>
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">End Time *</label>
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              className="h-11"
              required
            />
          </div>
          {/* Quick Time Presets */}
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "1 Hour", start: "09:00", end: "10:00" },
                { label: "1.5 Hours", start: "09:00", end: "10:30" },
                { label: "2 Hours", start: "09:00", end: "11:00" },
                { label: "3 Hours", start: "09:00", end: "12:00" },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    startTime: preset.start,
                    endTime: preset.end,
                  }))}
                  className="h-8 px-3 text-xs border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration Display */}
          {form.startTime && form.endTime && (
            <div className="col-span-2 space-y-2">
              <div className={`flex items-center gap-2 p-3 border rounded-lg ${
                form.startTime >= form.endTime 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-primary/5 border-primary/20'
              }`}>
                <Clock className={`h-4 w-4 ${
                  form.startTime >= form.endTime ? 'text-red-500' : 'text-primary'
                }`} />
                <span className={`text-sm font-medium ${
                  form.startTime >= form.endTime ? 'text-red-600' : 'text-primary'
                }`}>
                  Session Duration: {(() => {
                    if (form.startTime >= form.endTime) {
                      return "Invalid time range";
                    }
                    const start = new Date(`2000-01-01T${form.startTime}:00`);
                    const end = new Date(`2000-01-01T${form.endTime}:00`);
                    const diffMs = end.getTime() - start.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    if (diffHours > 0) {
                      return `${diffHours}h ${diffMinutes}m`;
                    }
                    return `${diffMinutes}m`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe your event, rules, special instructions, or any additional information participants should know..."
            className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Recurring Event Settings */}
      {form.eventType === "recurring" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Recurring Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Frequency *</label>
              <select
                className="w-full h-11 rounded-md border bg-background px-3 text-sm"
                value={form.frequency}
                onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as "daily" | "weekly" | "monthly" }))}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date *</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                className="h-11"
                required
              />
            </div>
          </div>
          
          {/* Recurring Preview */}
          {form.date && form.endDate && form.frequency && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Recurring Preview</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This will create {(() => {
                  const occurrences = generateRecurringOccurrences(
                    form.date,
                    form.endDate,
                    form.frequency,
                    form.startTime || "09:00",
                    form.endTime || "11:00",
                    10
                  );
                  return occurrences.length;
                })()} session{(() => {
                  const occurrences = generateRecurringOccurrences(
                    form.date,
                    form.endDate,
                    form.frequency,
                    form.startTime || "09:00",
                    form.endTime || "11:00",
                    10
                  );
                  return occurrences.length !== 1 ? 's' : '';
                })()} from {new Date(form.date).toLocaleDateString()} to {new Date(form.endDate).toLocaleDateString()}
              </p>
              {(() => {
                const occurrences = generateRecurringOccurrences(
                  form.date,
                  form.endDate,
                  form.frequency,
                  form.startTime || "09:00",
                  form.endTime || "11:00",
                  10
                );
                if (occurrences.length >= 50) {
                  return (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ Warning: Creating {occurrences.length} sessions may take a moment. Consider reducing the date range.
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tournament Settings */}
      {form.eventType === "tournament" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Tournament Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tournament Format *</label>
              <select
                className="w-full h-11 rounded-md border bg-background px-3 text-sm"
                value={form.tournamentFormat}
                onChange={(e) => setForm((p) => ({ ...p, tournamentFormat: e.target.value as "single-elimination" | "double-elimination" | "round-robin" }))}
                required
              >
                <option value="single-elimination">Single Elimination</option>
                <option value="double-elimination">Double Elimination</option>
                <option value="round-robin">Round Robin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Registration Deadline *</label>
              <Input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => setForm((p) => ({ ...p, registrationDeadline: e.target.value }))}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Prize/Prize Pool</label>
              <Input
                value={form.prize}
                onChange={(e) => setForm((p) => ({ ...p, prize: e.target.value }))}
                placeholder="e.g., ₱5,000 cash prize or Trophy + Certificate"
                className="h-11"
              />
            </div>
          </div>
        </div>
      )}

      {/* Session Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Session Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Max Players</label>
            <Input
              type="number"
              min={1}
              max={500}
              value={form.maxPlayers}
              onChange={(e) => setForm((p) => ({ ...p, maxPlayers: Number(e.target.value) }))}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price per Player (₱)</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              placeholder="0.00"
              className="h-11"
              disabled={form.isFreeJoin}
            />
          </div>
        </div>
        
        {/* Court Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Court</label>
          <select
            value={form.courtId}
            onChange={(e) => setForm((p) => ({ ...p, courtId: e.target.value }))}
            className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={courtsLoading}
          >
            <option value="">Select a court...</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name} - {court.location} (Capacity: {court.capacity})
              </option>
            ))}
          </select>
        </div>
        
        {/* Free Join Checkbox */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200/50">
            <input
              type="checkbox"
              id="isFreeJoin"
              checked={form.isFreeJoin}
              onChange={(e) => {
                setForm((p) => ({ 
                  ...p, 
                  isFreeJoin: e.target.checked,
                  price: e.target.checked ? 0 : p.price // Reset price to 0 when free join is checked
                }));
              }}
              className="h-4 w-4 text-green-600 rounded border-green-300 focus:ring-green-200"
            />
            <div className="flex-1">
              <label htmlFor="isFreeJoin" className="text-sm font-medium text-green-800 cursor-pointer">
                🆓 Free to Join
              </label>
              <p className="text-xs text-green-700 mt-1">
                Players can join this session without any payment. When enabled, the price per player will be set to ₱0.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Levels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Star className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Skill Levels</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["Beginner", "Intermediate", "Advanced"] as LevelTag[]).map((lvl) => (
            <div key={lvl} className={`space-y-2 p-3 border rounded-lg transition-all ${
              (form.levels as any)[lvl] ? 'border-primary/30 bg-primary/10' : 'border-border bg-muted/30'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(form.levels as any)[lvl]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      levels: { ...p.levels, [lvl]: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-primary rounded border-primary/30 focus:ring-primary/20"
                />
                <span className="text-sm font-medium capitalize text-foreground">{lvl}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lvl === 'Beginner' && 'New to the sport or learning basics'}
                {lvl === 'Intermediate' && 'Some experience, comfortable with rules'}
                {lvl === 'Advanced' && 'Experienced players, competitive level'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default CreateSessionForm;
