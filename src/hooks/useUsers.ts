import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getUserStats, type User, type UserStats } from '@/services/user.service';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersResponse, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      setUsers(usersResponse.data);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching users:', error);
      // toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleUserAction = useCallback(async (_userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        await fetchData();
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    users,
    loading,
    stats,
    refreshing,
    fetchData,
    handleRefresh,
    handleUserAction
  };
};
