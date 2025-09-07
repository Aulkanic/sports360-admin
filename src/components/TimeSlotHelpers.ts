import type { TimeSlot, DayAvailability } from './TimeSlotManager';

/**
 * Helper functions for time slot management
 */

// Generate a unique ID for time slots
export const generateTimeSlotId = (day: string, index: number): string => {
  return `${day}_slot_${index}_${Date.now()}`;
};

// Create a default time slot
export const createDefaultTimeSlot = (day: string, start: string = '08:00', end: string = '10:00'): TimeSlot => {
  return {
    id: generateTimeSlotId(day, 0),
    start,
    end,
    available: true,
  };
};

// Create default day availability
export const createDefaultDayAvailability = (day: string): DayAvailability => {
  return {
    available: true,
    timeSlots: [createDefaultTimeSlot(day)],
  };
};

// Validate time slot
export const validateTimeSlot = (start: string, end: string): string | null => {
  if (!start || !end) {
    return 'Start and end times are required';
  }
  
  if (start >= end) {
    return 'End time must be after start time';
  }
  
  // Check if times are in valid format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start) || !timeRegex.test(end)) {
    return 'Invalid time format. Use HH:MM format';
  }
  
  return null;
};

// Check for time slot conflicts
export const checkTimeSlotConflicts = (timeSlots: TimeSlot[], currentSlot: TimeSlot): string[] => {
  const conflicts: string[] = [];
  
  timeSlots.forEach(slot => {
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

// Calculate total available hours for a day
export const calculateTotalAvailableHours = (dayAvailability: DayAvailability): number => {
  if (!dayAvailability.available || dayAvailability.timeSlots.length === 0) {
    return 0;
  }

  return dayAvailability.timeSlots.reduce((total, slot) => {
    const start = new Date(`2000-01-01T${slot.start}:00`);
    const end = new Date(`2000-01-01T${slot.end}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return total + diffHours;
  }, 0);
};

// Format time for display
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Get time slot summary for a day
export const getTimeSlotSummary = (dayAvailability: DayAvailability): string => {
  if (!dayAvailability.available || dayAvailability.timeSlots.length === 0) {
    return 'Not available';
  }

  if (dayAvailability.timeSlots.length === 1) {
    const slot = dayAvailability.timeSlots[0];
    return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
  }

  const totalHours = calculateTotalAvailableHours(dayAvailability);
  return `${dayAvailability.timeSlots.length} slots (${totalHours.toFixed(1)}h total)`;
};

// Sort time slots by start time
export const sortTimeSlotsByStartTime = (timeSlots: TimeSlot[]): TimeSlot[] => {
  return [...timeSlots].sort((a, b) => a.start.localeCompare(b.start));
};

// Merge overlapping time slots
export const mergeOverlappingTimeSlots = (timeSlots: TimeSlot[]): TimeSlot[] => {
  if (timeSlots.length <= 1) return timeSlots;

  const sorted = sortTimeSlotsByStartTime(timeSlots);
  const merged: TimeSlot[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // If current slot ends before next starts, add current and move to next
    if (current.end <= next.start) {
      merged.push(current);
      current = next;
    } else {
      // Merge overlapping slots
      current = {
        ...current,
        end: current.end > next.end ? current.end : next.end,
      };
    }
  }
  
  merged.push(current);
  return merged;
};

// Check if a time falls within any time slot
export const isTimeInAnySlot = (time: string, timeSlots: TimeSlot[]): boolean => {
  return timeSlots.some(slot => time >= slot.start && time <= slot.end);
};

// Get next available time slot after a given time
export const getNextAvailableSlot = (time: string, timeSlots: TimeSlot[]): TimeSlot | null => {
  const sorted = sortTimeSlotsByStartTime(timeSlots);
  return sorted.find(slot => slot.start > time) || null;
};
