import type { CourtFormData } from '@/types/court.types';

// Helper function to convert availability to API format
export const convertAvailabilityToAPI = (availability: CourtFormData['availability']) => {
  const availabilityData: any[] = [];
  const dayMap: { [key: string]: number } = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7
  };

  Object.entries(availability ?? {}).forEach(([day, dayAvailability]) => {
    if (dayAvailability.available && dayAvailability.timeSlots) {
      dayAvailability.timeSlots.forEach((slot) => {
        if (slot.available) {
          availabilityData.push({
            weekday: dayMap[day],
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: true
          });
        }
      });
    }
  });

  return availabilityData;
};

// Helper function to convert availability from API format
export const convertAvailabilityFromAPI = (apiAvailability: any[]) => {
  const dayMap: { [key: number]: string } = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    7: 'sunday'
  };

  const availability: any = {
    monday: { available: false, timeSlots: [] },
    tuesday: { available: false, timeSlots: [] },
    wednesday: { available: false, timeSlots: [] },
    thursday: { available: false, timeSlots: [] },
    friday: { available: false, timeSlots: [] },
    saturday: { available: false, timeSlots: [] },
    sunday: { available: false, timeSlots: [] }
  };

  // Safety check: ensure apiAvailability is an array
  if (!Array.isArray(apiAvailability)) {
    console.warn('convertAvailabilityFromAPI: Expected array but received:', typeof apiAvailability, apiAvailability);
    return availability;
  }

  // Group availability by day
  const dayGroups: { [key: string]: any[] } = {};
  apiAvailability.forEach((slot) => {
    const day = dayMap[slot.weekday];
    if (day) {
      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }
      dayGroups[day].push(slot);
    }
  });

  // Convert each day's slots
  Object.entries(dayGroups).forEach(([day, slots]) => {
    if (slots.length > 0) {
      availability[day] = {
        available: true,
        timeSlots: slots.map((slot, index) => ({
          id: `${day}_${index + 1}`,
          start: slot.startTime,
          end: slot.endTime,
          available: slot.isAvailable
        }))
      };
    }
  });

  return availability;
};

// Helper function to get default form data
export const getDefaultFormData = (): CourtFormData => ({
  name: "",
  location: "",
  status: "Available",
  images: [""],
  capacity: 0,
  openingHours: "",
  reservations: 0,
  description: "",
  hourlyRate: 0,
  minHours: 1,
  hubId: "",
  rentalId: "",
  courtNumber: "",
  isActive: true,
  availability: {
    monday: { 
      available: true, 
      timeSlots: [{ id: "new_monday_1", start: "08:00", end: "22:00", available: true }] 
    },
    tuesday: { 
      available: true, 
      timeSlots: [{ id: "new_tuesday_1", start: "08:00", end: "22:00", available: true }] 
    },
    wednesday: { 
      available: true, 
      timeSlots: [{ id: "new_wednesday_1", start: "08:00", end: "22:00", available: true }] 
    },
    thursday: { 
      available: true, 
      timeSlots: [{ id: "new_thursday_1", start: "08:00", end: "22:00", available: true }] 
    },
    friday: { 
      available: true, 
      timeSlots: [{ id: "new_friday_1", start: "08:00", end: "22:00", available: true }] 
    },
    saturday: { 
      available: true, 
      timeSlots: [{ id: "new_saturday_1", start: "08:00", end: "22:00", available: true }] 
    },
    sunday: { 
      available: true, 
      timeSlots: [{ id: "new_sunday_1", start: "08:00", end: "22:00", available: true }] 
    },
  },
});

// Helper function to get image preview URL
export const getImagePreview = (image: string | File): string => {
  if (typeof image === 'string') {
    return image; // It's already a URL
  } else {
    return URL.createObjectURL(image); // Create blob URL for File object
  }
};

// Helper function to check if image is a File
export const isFile = (image: string | File): image is File => {
  return image instanceof File;
};
