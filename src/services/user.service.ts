import apiClient from "@/config/api";


export interface UserPersonalInfo {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  address: string | null;
  gender: string | null;
  birthday: string | null;
  country: string | null;
  contactNo: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userTypeId: number | null;
  uploadId: string | null;
  upload: any | null;
}

export interface UserAccountStatus {
  id: number;
  description: string;
}

export interface UserTypeRef {
  id: number;
  description: string;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
  statusId: string;
  accountStatus: UserAccountStatus;
  userTypeRef: UserTypeRef;
  personalInfo: UserPersonalInfo;
}

export interface UsersResponse {
  message: string;
  data: User[];
}

export interface UserStats {
  total: number;
  byUserType: Record<string, number>;
  byStatus: Record<string, number>;
  recent: number; // Users created in last 7 days
}

// Get all users
export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    const response = await apiClient.get('/users/get-all-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await apiClient.get('/users/get-all-users');
    const users = response.data.data;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: UserStats = {
      total: users.length,
      byUserType: {},
      byStatus: {},
      recent: 0
    };
    
    users.forEach((user: User) => {
      // Count by user type
      const userType = user.userTypeRef.description;
      stats.byUserType[userType] = (stats.byUserType[userType] || 0) + 1;
      
      // Count by status
      const status = user.accountStatus.description;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Count recent users
      const createdAt = new Date(user.createdAt);
      if (createdAt >= sevenDaysAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query: string): Promise<UsersResponse> => {
  try {
    const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<{ message: string; data: User }> => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Update user status
export const updateUserStatus = async (id: string, statusId: string): Promise<{ message: string; data: User }> => {
  try {
    const response = await apiClient.put(`/users/${id}/status`, { statusId });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
