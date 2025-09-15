import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Court, CourtFormData } from '@/types/court.types';
import { 
  getAllCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  getCourtById,
  type Court as APICourt,
  type CreateCourtData,
  type UpdateCourtData
} from '@/services/court.service';
import { convertAvailabilityFromAPI, convertAvailabilityToAPI } from '@/utils/court.utils';

// Query keys for court operations
export const courtKeys = {
  all: ['courts'] as const,
  lists: () => [...courtKeys.all, 'list'] as const,
  list: (filters?: any) => [...courtKeys.lists(), { filters }] as const,
  details: () => [...courtKeys.all, 'detail'] as const,
  detail: (id: string) => [...courtKeys.details(), id] as const,
};

// Helper function to convert API court to local format
const convertAPICourtToLocal = async (court: APICourt): Promise<Court> => {
  // Get availability from courtRentalOptions
  const rentalOption = court.courtRentalOptions?.[0];
  const availabilityData = rentalOption?.courtAvailability || [];

  // Convert availability data to frontend format
  const convertedAvailability = convertAvailabilityFromAPI(availabilityData);

  return {
    id: court.id.toString(),
    name: court.courtName,
    location: court.hub?.sportsHubName || 'Unknown Location',
    status: (court.status === 'AVAILABLE' ? 'Available' : 
            court.status === 'MAINTENANCE' ? 'Maintenance' :
            court.status === 'BOOKED' ? 'Booked' : 'Fully Booked') as Court['status'],
    capacity: court.capacity,
    hourlyRate: rentalOption?.hourlyRate,
    hubId: court.hubId.toString(),
    courtName: court.courtName,
    isActive: court.isActive,
    hub: court.hub ? {
      id: court.hub.id,
      sportsHubName: court.hub.sportsHubName,
      streetAddress: court.hub.streetAddress,
      city: court.hub.city,
      stateProvince: court.hub.stateProvince,
      zipPostalCode: court.hub.zipPostalCode
    } : undefined,
    _count: court._count,
    // Use actual API data
    images: rentalOption?.uploads?.map(upload => upload.filePath) || [],
    description: rentalOption?.description || "",
    openingHours: "08:00 - 22:00", // This could be calculated from availability
    reservations: court._count?.bookings || 0,
    minHours: rentalOption?.minimumHours || 1,
    bookings: [],
    availability: convertedAvailability
  };
};

// Hook to fetch all courts
export const useCourtsQuery = (filters?: any) => {
  return useQuery({
    queryKey: courtKeys.list(filters),
    queryFn: async () => {
      const courtsData = await getAllCourts(filters);
      return Promise.all(courtsData.map(convertAPICourtToLocal));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single court by ID
export const useCourtQuery = (courtId: string) => {
  return useQuery({
    queryKey: courtKeys.detail(courtId),
    queryFn: async () => {
      const court = await getCourtById(courtId);
      return convertAPICourtToLocal(court);
    },
    enabled: !!courtId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a new court
export const useCreateCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CourtFormData) => {
      const createData: CreateCourtData = {
        hubId: formData.sportshubId || '1',
        courtName: formData.name,
        status: formData.status.toUpperCase(),
        capacity: formData.capacity,
        hourlyRate: formData.hourlyRate,
        minimumHours: formData.minHours,
        description: formData.description || undefined,
        images: (formData.images ?? []).filter(Boolean),
        availability: convertAvailabilityToAPI(formData.availability)
      };
      
      return createCourt(createData);
    },
    onSuccess: () => {
      // Invalidate and refetch courts list
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating court:', error);
    },
  });
};

// Hook to update a court
export const useUpdateCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courtId, formData }: { courtId: string; formData: CourtFormData }) => {
      const updateData: UpdateCourtData = {
        courtName: formData.name,
        status: formData.status.toUpperCase(),
        capacity: formData.capacity,
        hourlyRate: formData.hourlyRate,
        minimumHours: formData.minHours,
        description: formData.description || undefined,
        images: (formData.images ?? []).filter(Boolean),
        availability: convertAvailabilityToAPI(formData.availability)
      };
      
      return updateCourt(courtId, updateData);
    },
    onSuccess: (_, { courtId }) => {
      // Invalidate and refetch courts list and specific court
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courtKeys.detail(courtId) });
    },
    onError: (error) => {
      console.error('Error updating court:', error);
    },
  });
};

// Hook to delete a court
export const useDeleteCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courtId: string) => {
      return deleteCourt(courtId);
    },
    onSuccess: () => {
      // Invalidate and refetch courts list
      queryClient.invalidateQueries({ queryKey: courtKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting court:', error);
    },
  });
};

// Optimistic update hook for court operations
export const useOptimisticCourtUpdate = () => {
  const queryClient = useQueryClient();

  const optimisticUpdateCourt = (courtId: string, updates: Partial<Court>) => {
    queryClient.setQueryData(courtKeys.detail(courtId), (old: Court | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    });

    queryClient.setQueryData(courtKeys.lists(), (old: Court[] | undefined) => {
      if (!old) return old;
      return old.map(court => 
        court.id === courtId ? { ...court, ...updates } : court
      );
    });
  };

  const optimisticAddCourt = (newCourt: Court) => {
    queryClient.setQueryData(courtKeys.lists(), (old: Court[] | undefined) => {
      if (!old) return [newCourt];
      return [newCourt, ...old];
    });
  };

  const optimisticRemoveCourt = (courtId: string) => {
    queryClient.setQueryData(courtKeys.lists(), (old: Court[] | undefined) => {
      if (!old) return old;
      return old.filter(court => court.id !== courtId);
    });
  };

  return {
    optimisticUpdateCourt,
    optimisticAddCourt,
    optimisticRemoveCourt,
  };
};
