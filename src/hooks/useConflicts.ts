import { useState, useCallback } from 'react';
import { getAllConflicts, resolveConflict, type BookingConflict } from '@/services/court.service';

export const useConflicts = () => {
  const [conflicts, setConflicts] = useState<BookingConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConflicts = useCallback(async () => {
    try {
      setIsLoading(true);
      const conflictsData = await getAllConflicts({ status: 'pending' });
      setConflicts(conflictsData);
    } catch (error) {
      console.error('Error loading conflicts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveConflictData = useCallback(async (conflictId: string, resolution: string, notes?: string) => {
    try {
      await resolveConflict(conflictId, {
        resolution: resolution as 'resolved' | 'overridden',
        notes
      });
      await loadConflicts();
      return true;
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    }
  }, [loadConflicts]);

  return {
    conflicts,
    isLoading,
    loadConflicts,
    resolveConflict: resolveConflictData,
  };
};
