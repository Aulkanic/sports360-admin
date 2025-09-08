import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { CourtFormData } from '@/types/court.types';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

interface DayAvailability {
  available: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklyAvailabilityProps {
  form: CourtFormData;
  setForm: React.Dispatch<React.SetStateAction<CourtFormData>>;
}

const DAYS = [
  { name: 'monday', label: 'Monday', weekday: 1 },
  { name: 'tuesday', label: 'Tuesday', weekday: 2 },
  { name: 'wednesday', label: 'Wednesday', weekday: 3 },
  { name: 'thursday', label: 'Thursday', weekday: 4 },
  { name: 'friday', label: 'Friday', weekday: 5 },
  { name: 'saturday', label: 'Saturday', weekday: 6 },
  { name: 'sunday', label: 'Sunday', weekday: 7 },
] as const;

const WeeklyAvailability: React.FC<WeeklyAvailabilityProps> = ({ form, setForm }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [enabledDays, setEnabledDays] = useState<Set<string>>(new Set());
  
  // Initialize availability if not present
  const availability = form.availability || [];

  // Initialize enabled days from existing availability
  React.useEffect(() => {
    const days = new Set<string>();
    availability.forEach(slot => {
      const dayName = DAYS.find(d => d.weekday === slot.weekday)?.name;
      if (dayName) {
        days.add(dayName);
      }
    });
    setEnabledDays(days);
  }, [availability]);

  const getDayAvailability = (dayName: string): DayAvailability => {
    const dayIndex = DAYS.findIndex(d => d.name === dayName);
    const weekday = DAYS[dayIndex]?.weekday;
    
    if (!weekday) {
      return { available: false, timeSlots: [] };
    }

    const daySlots = availability.filter(slot => slot.weekday === weekday);

    return {
      available: enabledDays.has(dayName),
      timeSlots: daySlots.map(slot => ({
        id: `${dayName}_${slot.startTime}_${slot.endTime}`,
        start: slot.startTime,
        end: slot.endTime,
        available: slot.isAvailable
      }))
    };
  };

  const updateDayAvailability = (dayName: string, dayAvailability: DayAvailability) => {
    const dayIndex = DAYS.findIndex(d => d.name === dayName);
    const weekday = DAYS[dayIndex]?.weekday;
    
    if (!weekday) return;

    // Remove existing slots for this day
    const otherDaysSlots = availability.filter(slot => slot.weekday !== weekday);
    
    // Add new slots for this day
    const newDaySlots = dayAvailability.timeSlots.map(slot => ({
      weekday,
      startTime: slot.start,
      endTime: slot.end,
      isAvailable: slot.available
    }));

    setForm(prev => ({
      ...prev,
      availability: [...otherDaysSlots, ...newDaySlots]
    }));
  };

  const toggleDayAvailability = (dayName: string) => {
    const dayIndex = DAYS.findIndex(d => d.name === dayName);
    const weekday = DAYS[dayIndex]?.weekday;
    
    if (!weekday) return;

    const isCurrentlyEnabled = enabledDays.has(dayName);
    
    if (isCurrentlyEnabled) {
      // Disable the day - remove from enabled days and clear all time slots
      setEnabledDays(prev => {
        const newSet = new Set(prev);
        newSet.delete(dayName);
        return newSet;
      });
      
      // Remove all time slots for this day
      const otherDaysSlots = availability.filter(slot => slot.weekday !== weekday);
      setForm(prev => ({
        ...prev,
        availability: otherDaysSlots
      }));
    } else {
      // Enable the day - add to enabled days
      setEnabledDays(prev => new Set(prev).add(dayName));
    }
  };

  const addTimeSlot = (dayName: string) => {
    // Don't add slot if day is not enabled
    if (!enabledDays.has(dayName)) {
      return;
    }
    
    const currentAvailability = getDayAvailability(dayName);
    
    // Limit to maximum 5 time slots per day
    if (currentAvailability.timeSlots.length >= 5) {
      return;
    }
    
    const newSlot = {
      id: `${dayName}_${Date.now()}`,
      start: '08:00',
      end: '18:00',
      available: true
    };
    
    const newAvailability = {
      ...currentAvailability,
      timeSlots: [...currentAvailability.timeSlots, newSlot]
    };
    updateDayAvailability(dayName, newAvailability);
  };

  const updateTimeSlot = (dayName: string, slotId: string, field: 'start' | 'end', value: string) => {
    const currentAvailability = getDayAvailability(dayName);
    
    // Find the slot being updated
    const slotToUpdate = currentAvailability.timeSlots.find(slot => slot.id === slotId);
    if (!slotToUpdate) return;
    
    // Create updated slot
    const updatedSlot = { ...slotToUpdate, [field]: value };
    
    // Validate time range
    const startTime = field === 'start' ? value : slotToUpdate.start;
    const endTime = field === 'end' ? value : slotToUpdate.end;
    
    // Clear previous validation error
    const errorKey = `${dayName}_${slotId}`;
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
    
    // Check if start time is before end time
    if (startTime && endTime && startTime >= endTime) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: 'End time must be after start time'
      }));
      return;
    }
    
    // Check for overlapping time slots
    const hasOverlap = currentAvailability.timeSlots.some(slot => {
      if (slot.id === slotId) return false; // Skip the slot being updated
      
      const slotStart = slot.start;
      const slotEnd = slot.end;
      
      // Check if the new time range overlaps with existing slot
      return (startTime < slotEnd && endTime > slotStart);
    });
    
    if (hasOverlap) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: 'Time slot overlaps with another slot'
      }));
      return;
    }
    
    const newAvailability = {
      ...currentAvailability,
      timeSlots: currentAvailability.timeSlots.map(slot =>
        slot.id === slotId ? updatedSlot : slot
      )
    };
    updateDayAvailability(dayName, newAvailability);
  };

  const removeTimeSlot = (dayName: string, slotId: string) => {
    const currentAvailability = getDayAvailability(dayName);
    const newAvailability = {
      ...currentAvailability,
      timeSlots: currentAvailability.timeSlots.filter(slot => slot.id !== slotId)
    };
    updateDayAvailability(dayName, newAvailability);
  };

  // Helper function to get total slots (available for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTotalSlots = () => {
    return DAYS.reduce((total, day) => {
      const dayAvailability = getDayAvailability(day.name);
      return total + dayAvailability.timeSlots.length;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">Weekly Availability</h3>
          <p className="text-sm text-muted-foreground">Configure time slots for each day of the week</p>
          <p className="text-xs text-muted-foreground mt-1">Set up multiple time slots for each day. You can add different availability periods throughout the day.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS.map((day) => {
          const dayAvailability = getDayAvailability(day.name);
          
          return (
            <div key={day.name} className={`bg-white border rounded-xl p-5 space-y-4 min-h-0 overflow-hidden transition-all duration-200 shadow-sm ${
              dayAvailability.available 
                ? 'border-green-200 bg-green-50/30' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}>
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={dayAvailability.available}
                    onChange={() => toggleDayAvailability(day.name)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer transition-all duration-200"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-base text-foreground">{day.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      dayAvailability.timeSlots.length > 0 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {dayAvailability.timeSlots.length} slot{dayAvailability.timeSlots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {dayAvailability.available && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeSlot(day.name)}
                    className="h-8 px-3 text-xs text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Slot
                  </Button>
                )}
              </div>

              {/* Time Slots */}
              {dayAvailability.available && (
                <div className="space-y-3">
                  {dayAvailability.timeSlots.map((slot, index) => {
                    const errorKey = `${day.name}_${slot.id}`;
                    const hasError = validationErrors[errorKey];
                    
                    return (
                      <div key={slot.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Time Slot {index + 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTimeSlot(day.name, slot.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg min-w-0 ${
                          hasError 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day.name, slot.id, 'start', e.target.value)}
                              className="h-9 text-sm w-full min-w-0 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground flex-shrink-0 font-medium">to</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day.name, slot.id, 'end', e.target.value)}
                              className="h-9 text-sm w-full min-w-0 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white"
                            />
                          </div>
                        </div>
                        {hasError && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <span>{hasError}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Availability Summary */}
              {dayAvailability.available && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t border-gray-200">
                  <Clock className="h-4 w-4" />
                  <span>Total availability: {dayAvailability.timeSlots.length} slot{dayAvailability.timeSlots.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyAvailability;
