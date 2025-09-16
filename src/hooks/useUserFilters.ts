import { useState, useEffect, useMemo } from 'react';
import type { User } from '@/services/user.service';
import type { UserRow } from '@/pages/private/users/table';

export type UserTypeFilter = "All" | "Admin" | "Player" | "Coach" | "Sports/hub" | "Guest";
export type StatusFilter = "All" | "REGULAR" | "GUEST";

export const useUserFilters = (users: User[]) => {
  const [query, setQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Filter by user type
    if (userTypeFilter !== "All") {
      filtered = filtered.filter(user => user.userTypeRef.description === userTypeFilter);
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(user => user.accountStatus.description === statusFilter);
    }

    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(user =>
        user.userName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.personalInfo.firstName.toLowerCase().includes(searchTerm) ||
        user.personalInfo.lastName.toLowerCase().includes(searchTerm) ||
        (user.personalInfo.contactNo && user.personalInfo.contactNo.includes(searchTerm))
      );
    }

    setFilteredUsers(filtered);
  }, [users, query, userTypeFilter, statusFilter]);

  // Convert API users to table rows
  const userRows: UserRow[] = useMemo(() => {
    return filteredUsers.map(user => ({
      id: user.id,
      userName: user.userName,
      email: user.email,
      fullName: `${user.personalInfo.firstName} ${user.personalInfo.lastName}`,
      userType: user.userTypeRef.description,
      status: user.accountStatus.description,
      contactNo: user.personalInfo.contactNo || 'N/A',
      createdAt: user.createdAt,
      lastLogin: user.updatedAt,
      personalInfo: user.personalInfo
    }));
  }, [filteredUsers]);

  const userTypeOptions: UserTypeFilter[] = ["All", "Admin", "Player", "Coach", "Sports/hub", "Guest"];
  const statusOptions: StatusFilter[] = ["All", "REGULAR", "GUEST"];

  return {
    query,
    setQuery,
    userTypeFilter,
    setUserTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredUsers,
    userRows,
    userTypeOptions,
    statusOptions
  };
};
