import { useCallback } from 'react';
import type { CourtFormData } from '@/types/court.types';
import { 
  useCourtsQuery,
  useCreateCourtMutation,
  useUpdateCourtMutation,
  useDeleteCourtMutation,
  useOptimisticCourtUpdate
} from './useCourtQueries';

export const useCourts = (filters?: any) => {
  // Use React Query for data fetching
  const { data: items = [], isLoading, error, refetch } = useCourtsQuery(filters);
  
  // Use React Query mutations for data modifications
  const createCourtMutation = useCreateCourtMutation();
  const updateCourtMutation = useUpdateCourtMutation();
  const deleteCourtMutation = useDeleteCourtMutation();
  
  // Get optimistic update helpers
  const { optimisticUpdateCourt, optimisticAddCourt, optimisticRemoveCourt } = useOptimisticCourtUpdate();

  // Wrapper functions that maintain the same API as before
  const createCourt = useCallback(async (formData: CourtFormData) => {
    try {
      await createCourtMutation.mutateAsync(formData);
      return true;
    } catch (error) {
      console.error('Error creating court:', error);
      return false;
    }
  }, [createCourtMutation]);

  const updateCourt = useCallback(async (courtId: string, formData: CourtFormData) => {
    try {
      await updateCourtMutation.mutateAsync({ courtId, formData });
      return true;
    } catch (error) {
      console.error('Error updating court:', error);
      return false;
    }
  }, [updateCourtMutation]);

  const deleteCourt = useCallback(async (courtId: string) => {
    try {
      await deleteCourtMutation.mutateAsync(courtId);
      return true;
    } catch (error) {
      console.error('Error deleting court:', error);
      return false;
    }
  }, [deleteCourtMutation]);

  const loadCourts = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    items,
    apiCourts: items, // For backward compatibility
    isLoading: isLoading || createCourtMutation.isPending || updateCourtMutation.isPending || deleteCourtMutation.isPending,
    loadCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    // Additional React Query specific properties
    error,
    isCreating: createCourtMutation.isPending,
    isUpdating: updateCourtMutation.isPending,
    isDeleting: deleteCourtMutation.isPending,
    // Optimistic update helpers
    optimisticUpdateCourt,
    optimisticAddCourt,
    optimisticRemoveCourt,
  };
};
