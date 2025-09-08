import { useState, useCallback, useEffect } from 'react';
import type { Court, CourtFormData } from '@/types/court.types';
import { 
  getAllCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  getCourtAvailability,
  type Court as APICourt,
  type CreateCourtData,
  type UpdateCourtData
} from '@/services/court.service';
import { convertAvailabilityFromAPI, convertAvailabilityToAPI } from '@/utils/court.utils';

const initialCourts: Court[] = [
  {
    id: "c1",
    name: "Court 1",
    location: "Building 1",
    status: "Fully Booked",
    images: [
      "https://tse4.mm.bing.net/th/id/OIP.uNvD4-Mwm18Y7mqk0WkUcgHaDT?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
    ],
    capacity: 10,
    openingHours: "08:00 - 22:00",
    reservations: 2,
    hourlyRate: 500,
    minHours: 1,
    bookings: [
      {
        id: "b1",
        title: "Morning Pickleball Session",
        type: "Open Play",
        startTime: "08:00",
        endTime: "10:00",
        date: "2024-01-15",
        participants: 8,
        maxParticipants: 10,
        status: "In-Progress",
        organizer: {
          name: "John Smith",
          email: "john@example.com"
        },
        description: "Beginner-friendly pickleball session"
      },
      {
        id: "b2",
        title: "Tournament Quarterfinals",
        type: "Tournament",
        startTime: "14:00",
        endTime: "16:00",
        date: "2024-01-15",
        participants: 10,
        maxParticipants: 10,
        status: "Approved",
        organizer: {
          name: "Sarah Johnson",
          email: "sarah@example.com"
        },
        description: "Quarterfinal matches for the winter tournament"
      },
      {
        id: "b3",
        title: "Evening League Play",
        type: "Recurring",
        startTime: "18:00",
        endTime: "20:00",
        date: "2024-01-15",
        participants: 6,
        maxParticipants: 10,
        status: "Approved",
        organizer: {
          name: "Mike Davis",
          email: "mike@example.com"
        },
        description: "Weekly league matches"
      }
    ],
    availability: {
      monday: { 
        available: true, 
        timeSlots: [{ id: "monday_1", start: "08:00", end: "22:00", available: true }] 
      },
      tuesday: { 
        available: true, 
        timeSlots: [{ id: "tuesday_1", start: "08:00", end: "22:00", available: true }] 
      },
      wednesday: { 
        available: true, 
        timeSlots: [{ id: "wednesday_1", start: "08:00", end: "22:00", available: true }] 
      },
      thursday: { 
        available: true, 
        timeSlots: [{ id: "thursday_1", start: "08:00", end: "22:00", available: true }] 
      },
      friday: { 
        available: true, 
        timeSlots: [{ id: "friday_1", start: "08:00", end: "22:00", available: true }] 
      },
      saturday: { 
        available: true, 
        timeSlots: [{ id: "saturday_1", start: "08:00", end: "22:00", available: true }] 
      },
      sunday: { 
        available: true, 
        timeSlots: [{ id: "sunday_1", start: "08:00", end: "22:00", available: true }] 
      },
    },
  },
  {
    id: "c2",
    name: "Court 2",
    location: "North Wing",
    status: "Booked",
    images: [
      "https://tse1.mm.bing.net/th/id/OIP.wdqEdSlnuBW1zqsBGrNrSgHaE8?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
    ],
    capacity: 22,
    openingHours: "06:00 - 21:00",
    reservations: 1,
    hourlyRate: 600,
    minHours: 2,
    bookings: [
      {
        id: "b4",
        title: "Corporate Team Building",
        type: "One-time",
        startTime: "10:00",
        endTime: "12:00",
        date: "2024-01-15",
        participants: 15,
        maxParticipants: 22,
        status: "Approved",
        organizer: {
          name: "Lisa Chen",
          email: "lisa@company.com"
        },
        description: "Team building event for corporate employees"
      }
    ],
    availability: {
      monday: { 
        available: true, 
        timeSlots: [{ id: "c2_monday_1", start: "06:00", end: "21:00", available: true }] 
      },
      tuesday: { 
        available: true, 
        timeSlots: [{ id: "c2_tuesday_1", start: "06:00", end: "21:00", available: true }] 
      },
      wednesday: { 
        available: true, 
        timeSlots: [{ id: "c2_wednesday_1", start: "06:00", end: "21:00", available: true }] 
      },
      thursday: { 
        available: true, 
        timeSlots: [{ id: "c2_thursday_1", start: "06:00", end: "21:00", available: true }] 
      },
      friday: { 
        available: true, 
        timeSlots: [{ id: "c2_friday_1", start: "06:00", end: "21:00", available: true }] 
      },
      saturday: { 
        available: true, 
        timeSlots: [{ id: "c2_saturday_1", start: "06:00", end: "21:00", available: true }] 
      },
      sunday: { 
        available: true, 
        timeSlots: [{ id: "c2_sunday_1", start: "06:00", end: "21:00", available: true }] 
      },
    },
  },
  {
    id: "c3",
    name: "Court 3",
    location: "Building 2",
    status: "Maintenance",
    images: [
      "https://www.urbansoccerpark.com/hs-fs/hubfs/Imported%20images/DJI_0039-1.jpeg?width=2000&height=1167&name=DJI_0039-1.jpeg",
    ],
    capacity: 8,
    openingHours: "09:00 - 18:00",
    reservations: 0,
    hourlyRate: 400,
    minHours: 1,
    availability: {
      monday: { 
        available: true, 
        timeSlots: [{ id: "c3_monday_1", start: "09:00", end: "18:00", available: true }] 
      },
      tuesday: { 
        available: true, 
        timeSlots: [{ id: "c3_tuesday_1", start: "09:00", end: "18:00", available: true }] 
      },
      wednesday: { 
        available: true, 
        timeSlots: [{ id: "c3_wednesday_1", start: "09:00", end: "18:00", available: true }] 
      },
      thursday: { 
        available: true, 
        timeSlots: [{ id: "c3_thursday_1", start: "09:00", end: "18:00", available: true }] 
      },
      friday: { 
        available: true, 
        timeSlots: [{ id: "c3_friday_1", start: "09:00", end: "18:00", available: true }] 
      },
      saturday: { 
        available: true, 
        timeSlots: [{ id: "c3_saturday_1", start: "09:00", end: "18:00", available: true }] 
      },
      sunday: { 
        available: true, 
        timeSlots: [{ id: "c3_sunday_1", start: "09:00", end: "18:00", available: true }] 
      },
    },
  },
];

export const useCourts = () => {
  const [items, setItems] = useState<Court[]>(initialCourts);
  const [apiCourts, setApiCourts] = useState<APICourt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCourts = useCallback(async () => {
    try {
      setIsLoading(true);
      const courtsData = await getAllCourts();
      setApiCourts(courtsData);
      
      // Convert API courts to local format for display
      const convertedCourts = await Promise.all(courtsData.map(async (court: APICourt) => {
        // Load availability data for each court
        let availabilityData = null;
        try {
          availabilityData = await getCourtAvailability(court.id);
        } catch (error) {
          console.error(`Error loading availability for court ${court.id}:`, error);
        }

        // Convert availability data to frontend format
        const convertedAvailability = convertAvailabilityFromAPI(availabilityData || []);

        return {
          id: court.id,
          name: court.courtName,
          location: court.hub?.sportsHubName || 'Unknown Location',
          status: (court.status === 'available' ? 'Available' : 
                  court.status === 'maintenance' ? 'Maintenance' :
                  court.status === 'booked' ? 'Booked' : 'Fully Booked') as Court['status'],
          capacity: court.capacity,
          hourlyRate: court.rental?.hourlyRate,
          hubId: court.hubId,
          rentalId: court.rentalId,
          courtName: court.courtName,
          courtNumber: court.courtNumber,
          isActive: court.isActive,
          hub: court.hub,
          rental: court.rental,
          _count: court._count,
          // Use actual API data
          images: court.images || [],
          description: court.description || "",
          openingHours: "08:00 - 22:00", // This could be calculated from availability
          reservations: court._count?.bookings || 0,
          minHours: 1,
          bookings: [],
          availability: convertedAvailability
        };
      }));
      
      setItems(convertedCourts);
    } catch (error) {
      console.error('Error loading courts:', error);
      // Keep existing mock data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourtData = useCallback(async (formData: CourtFormData) => {
    setIsLoading(true);
    try {
      const createData: CreateCourtData = {
        hubId: formData.hubId || 'default-hub-id',
        courtName: formData.name,
        courtNumber: formData.courtNumber,
        status: formData.status.toLowerCase(),
        capacity: formData.capacity,
        images: (formData.images ?? []).filter(Boolean),
        description: formData.description || undefined,
        isActive: formData.isActive,
        availability: convertAvailabilityToAPI(formData.availability)
      };
      
      await createCourt(createData);
      await loadCourts(); // Reload courts from API
      return true;
    } catch (error) {
      console.error('Error creating court:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourts]);

  const updateCourtData = useCallback(async (courtId: string, formData: CourtFormData) => {
    setIsLoading(true);
    try {
      const updateData: UpdateCourtData = {
        courtName: formData.name,
        courtNumber: formData.courtNumber,
        status: formData.status.toLowerCase(),
        capacity: formData.capacity,
        images: (formData.images ?? []).filter(Boolean),
        description: formData.description || undefined,
        isActive: formData.isActive,
        availability: convertAvailabilityToAPI(formData.availability)
      };
      
      await updateCourt(courtId, updateData);
      await loadCourts(); // Reload courts from API
      return true;
    } catch (error) {
      console.error('Error updating court:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourts]);

  const deleteCourtData = useCallback(async (courtId: string) => {
    setIsLoading(true);
    try {
      await deleteCourt(courtId);
      await loadCourts(); // Reload courts from API
      return true;
    } catch (error) {
      console.error('Error deleting court:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadCourts]);

  useEffect(() => {
    loadCourts();
  }, [loadCourts]);

  return {
    items,
    apiCourts,
    isLoading,
    loadCourts,
    createCourt: createCourtData,
    updateCourt: updateCourtData,
    deleteCourt: deleteCourtData,
  };
};
