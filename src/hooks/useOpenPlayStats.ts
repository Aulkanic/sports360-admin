/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { useOpenPlay } from './useOpenPlay';

export const useOpenPlayStats = (originalApiData: any[] = []) => {
  const { stats } = useOpenPlay();

  // Calculate stats from original API data as fallback
  const calculatedStats = useMemo(() => {
    const totalOccurrences = originalApiData.reduce((total, session) => total + (session.occurrences?.length || 0), 0);
    const activePrograms = originalApiData.filter(session => session.isActive).length;
    const totalParticipants = originalApiData.reduce((total, session) => 
      total + (session.occurrences?.reduce((occTotal: number, occ: any) => 
        occTotal + (occ.participants?.length || 0), 0) || 0), 0);
    const upcomingOccurrences = originalApiData.reduce((total, session) => 
      total + (session.occurrences?.filter((occ: any) => new Date(occ.occurrenceDate) > new Date()).length || 0), 0);

    return {
      totalOccurrences,
      activePrograms,
      totalParticipants,
      upcomingOccurrences,
    };
  }, [originalApiData]);

  // Use API stats if available, otherwise fall back to calculated stats
  const displayStats = stats || calculatedStats;

  return {
    stats: displayStats,
    calculatedStats,
    isUsingCalculatedStats: !stats,
  };
};
