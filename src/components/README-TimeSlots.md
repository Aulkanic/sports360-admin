# Time Slot Management System

This document describes the enhanced Weekly Availability system for court management that allows admins to add multiple time slots for each day.

## Features

### 🕒 **Multiple Time Slots Per Day**
- Add unlimited time slots for each day of the week
- Each time slot has start and end times
- Visual indicators for available/unavailable days
- Easy add/remove functionality

### ✅ **Smart Validation**
- **Time Validation**: Ensures end time is after start time
- **Conflict Detection**: Prevents overlapping time slots
- **Format Validation**: Validates HH:MM time format
- **Real-time Error Display**: Shows validation errors immediately

### 🎨 **Enhanced UX**
- **Visual Feedback**: Different colors for available/unavailable days
- **Slot Counter**: Shows number of time slots per day
- **Empty State**: Helpful message when no slots are added
- **Responsive Design**: Works on all screen sizes

### 🔧 **Helper Functions**
- Time formatting and calculations
- Conflict detection and merging
- Time slot sorting and validation
- Summary generation

## Components

### TimeSlotManager
Main component for managing time slots for a single day.

**Props:**
```typescript
interface TimeSlotManagerProps {
  day: string;                    // Day name (e.g., "monday")
  availability: DayAvailability;  // Current availability state
  onChange: (availability: DayAvailability) => void; // Change handler
  className?: string;             // Optional CSS classes
}
```

**Features:**
- Toggle day availability on/off
- Add/remove time slots
- Real-time validation
- Conflict detection
- Visual error indicators

### TimeSlotHelpers
Utility functions for time slot management.

**Key Functions:**
- `validateTimeSlot()` - Validates time format and logic
- `checkTimeSlotConflicts()` - Detects overlapping slots
- `calculateTotalAvailableHours()` - Calculates total hours
- `formatTime()` - Formats time for display
- `mergeOverlappingTimeSlots()` - Merges overlapping periods

## Data Structure

### TimeSlot Interface
```typescript
interface TimeSlot {
  id: string;        // Unique identifier
  start: string;     // Start time (HH:MM format)
  end: string;       // End time (HH:MM format)
  available: boolean; // Whether slot is available
}
```

### DayAvailability Interface
```typescript
interface DayAvailability {
  available: boolean;    // Whether day is available
  timeSlots: TimeSlot[]; // Array of time slots
}
```

### Court Availability Structure
```typescript
interface CourtAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}
```

## Usage Examples

### Basic Usage
```typescript
import TimeSlotManager from '@/components/TimeSlotManager';
import type { DayAvailability } from '@/components/TimeSlotManager';

const [availability, setAvailability] = useState<DayAvailability>({
  available: true,
  timeSlots: [
    { id: '1', start: '08:00', end: '12:00', available: true },
    { id: '2', start: '14:00', end: '18:00', available: true }
  ]
});

<TimeSlotManager
  day="monday"
  availability={availability}
  onChange={setAvailability}
/>
```

### With Validation
```typescript
import { validateTimeSlot, checkTimeSlotConflicts } from '@/components/TimeSlotHelpers';

const handleTimeSlotChange = (slot: TimeSlot) => {
  // Validate time format
  const timeError = validateTimeSlot(slot.start, slot.end);
  if (timeError) {
    setError(timeError);
    return;
  }

  // Check for conflicts
  const conflicts = checkTimeSlotConflicts(allSlots, slot);
  if (conflicts.length > 0) {
    setError(conflicts.join(', '));
    return;
  }

  // Update slot
  updateTimeSlot(slot);
};
```

## Validation Rules

### Time Format
- Must be in HH:MM format (24-hour)
- Valid hours: 00-23
- Valid minutes: 00-59

### Time Logic
- End time must be after start time
- No negative duration slots
- No zero-duration slots

### Conflict Detection
- No overlapping time slots on the same day
- Visual indicators for conflicts
- Automatic conflict highlighting

## Styling

### Available Day
- Green border and background tint
- Primary color accents
- Shadow effects

### Unavailable Day
- Gray border and background
- Muted colors
- Disabled appearance

### Error States
- Red border and background
- Error icons and messages
- Clear error indicators

## Best Practices

### 1. **Time Slot Organization**
- Use logical time periods (e.g., morning, afternoon, evening)
- Avoid too many small slots
- Consider booking patterns

### 2. **Validation**
- Always validate on both client and server
- Provide clear error messages
- Prevent invalid submissions

### 3. **User Experience**
- Show helpful hints and examples
- Provide default time slots
- Allow easy bulk operations

### 4. **Performance**
- Limit maximum slots per day if needed
- Debounce validation calls
- Use efficient data structures

## Integration

### With Court Management
The time slot system integrates seamlessly with the existing court management:

1. **Form Integration**: Replaces old single-slot system
2. **Data Persistence**: Saves to court availability
3. **Booking System**: Used for availability checking
4. **Calendar Display**: Shows in court calendars

### API Integration
```typescript
// Save court with time slots
const saveCourt = async (court: Court) => {
  const response = await apiClient.post('/courts', {
    ...court,
    availability: court.availability
  });
  return response.data;
};

// Get court availability
const getCourtAvailability = async (courtId: string) => {
  const response = await apiClient.get(`/courts/${courtId}/availability`);
  return response.data;
};
```

## Future Enhancements

### Planned Features
- **Recurring Patterns**: Set weekly/monthly patterns
- **Holiday Exceptions**: Special availability for holidays
- **Seasonal Schedules**: Different schedules per season
- **Bulk Operations**: Copy/paste time slots across days
- **Template System**: Predefined availability templates

### Advanced Features
- **Time Zone Support**: Handle multiple time zones
- **Booking Integration**: Real-time availability updates
- **Analytics**: Track usage patterns
- **Mobile Optimization**: Touch-friendly interface
