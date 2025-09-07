import { useState, useCallback, useEffect } from 'react';
import { getHubCourtAnalytics, type Court as APICourt } from '@/services/court.service';

export const useAnalytics = (apiCourts: APICourt[]) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      if (apiCourts.length > 0) {
        setIsLoading(true);
        const hubId = apiCourts[0].hubId;
        const analyticsData = await getHubCourtAnalytics(hubId);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiCourts]);

  useEffect(() => {
    if (apiCourts.length > 0) {
      loadAnalytics();
    }
  }, [apiCourts, loadAnalytics]);

  return {
    analytics,
    isLoading,
    loadAnalytics,
  };
};
