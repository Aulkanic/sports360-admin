import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, AlertCircle } from 'lucide-react';

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

export interface DayAvailability {
  available: boolean;
  timeSlots: TimeSlot[];
}

interface TimeSlotManagerProps {
  day: string;
  availability: DayAvailability;
  onChange: (availability: DayAvailability) => void;
  className?: string;
}

const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  day,
  availability,
  onChange,
  className = '',
}) => {
  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      start: '08:00',
      end: '10:00',
      available: true,
    };

    onChange({
      ...availability,
      timeSlots: [...availability.timeSlots, newSlot],
    });
  };

  const removeTimeSlot = (slotId: string) => {
    onChange({
      ...availability,
      timeSlots: availability.timeSlots.filter(slot => slot.id !== slotId),
    });
  };

  const updateTimeSlot = (slotId: string, field: keyof TimeSlot, value: string | boolean) => {
    onChange({
      ...availability,
      timeSlots: availability.timeSlots.map(slot =>
        slot.id === slotId ? { ...slot, [field]: value } : slot
      ),
    });
  };

  const toggleDayAvailability = (available: boolean) => {
    onChange({
      available,
      timeSlots: available ? availability.timeSlots : [],
    });
  };

  const validateTimeSlot = (start: string, end: string): string | null => {
    if (start >= end) {
      return 'End time must be after start time';
    }
    return null;
  };

  const checkTimeSlotConflicts = (currentSlot: TimeSlot): string[] => {
    const conflicts: string[] = [];
    
    availability.timeSlots.forEach(slot => {
      if (slot.id !== currentSlot.id) {
        const currentStart = currentSlot.start;
        const currentEnd = currentSlot.end;
        const slotStart = slot.start;
        const slotEnd = slot.end;

        // Check for overlap
        if (
          (currentStart < slotEnd && currentEnd > slotStart) ||
          (slotStart < currentEnd && slotEnd > currentStart)
        ) {
          conflicts.push(`Overlaps with ${slotStart}-${slotEnd}`);
        }
      }
    });

    return conflicts;
  };

  return (
    <div className={`space-y-4 p-4 border rounded-lg transition-all duration-200 ${
      availability.available 
        ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm hover:shadow-md' 
        : 'border-border bg-muted/30'
    } ${className}`}>
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={availability.available}
            onChange={(e) => toggleDayAvailability(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-primary/30 focus:ring-primary/20 focus:ring-2 transition-all duration-200"
          />
          <span className="text-sm font-semibold capitalize text-foreground">
            {day}
          </span>
          {availability.available && (
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
              {availability.timeSlots.length} slot{availability.timeSlots.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {availability.available && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addTimeSlot}
            className="h-8 px-3 text-xs border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Slot
          </Button>
        )}
      </div>

      {/* Time Slots */}
      {availability.available && (
        <div className="space-y-3">
          {availability.timeSlots.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No time slots added yet</p>
              <p className="text-xs">Click "Add Slot" to create availability periods</p>
            </div>
          ) : (
            availability.timeSlots.map((slot, index) => {
              const timeError = validateTimeSlot(slot.start, slot.end);
              const conflicts = checkTimeSlotConflicts(slot);
              const hasError = timeError || conflicts.length > 0;

              return (
                <div
                  key={slot.id}
                  className={`space-y-2 p-3 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                    hasError 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-border bg-background hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Time Slot {index + 1}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(slot.id, 'start', e.target.value)}
                        className={`h-9 text-sm transition-all duration-200 ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'focus:border-primary/50 focus:ring-primary/20'}`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">to</span>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(slot.id, 'end', e.target.value)}
                        className={`h-9 text-sm transition-all duration-200 ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'focus:border-primary/50 focus:ring-primary/20'}`}
                      />
                    </div>
                  </div>


                  {/* Error Messages */}
                  {hasError && (
                    <div className="space-y-1">
                      {timeError && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{timeError}</span>
                        </div>
                      )}
                      {conflicts.map((conflict, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{conflict}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Day Summary */}
      {availability.available && availability.timeSlots.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Total availability: {availability.timeSlots.length} slot{availability.timeSlots.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager;
