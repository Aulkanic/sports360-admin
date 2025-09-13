import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UsersTable from "./table";
import type { UserRow } from "./table";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { getAllUsers, getUserStats, type User, type UserStats } from "@/services/user.service";

type UserTypeFilter = "All" | "Admin" | "Player" | "Coach" | "Sports/hub" | "Guest";
type StatusFilter = "All" | "REGULAR" | "GUEST";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [refreshing, setRefreshing] = useState(false);

  const isEditing = useMemo(() => Boolean(editing), [editing]);

  // Fetch users and stats
  const fetchData = async () => {
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
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAddClick = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEditOpen = (user: User) => {
    setEditing(user);
    setOpen(true);
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        // Handle delete logic here
        console.log(`User ${userId} deleted successfully`);
        await fetchData();
      } else {
        // Handle activate/deactivate logic here
        console.log(`User ${userId} ${action}d successfully`);
        await fetchData();
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const userTypeOptions: UserTypeFilter[] = ["All", "Admin", "Player", "Coach", "Sports/hub", "Guest"];
  const statusOptions: StatusFilter[] = ["All", "REGULAR", "GUEST"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg bg-card p-6 border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Users</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recent} new this week
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-card p-6 border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active Users</h3>
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus.REGULAR || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Regular accounts
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Guest Users</h3>
              <UserX className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.byStatus.GUEST || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Guest accounts
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 border">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Players</h3>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.byUserType.Player || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered players
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="rounded-lg bg-card p-6 border">
        <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={userTypeFilter} 
              onChange={(e) => setUserTypeFilter(e.target.value as UserTypeFilter)}
              className="w-40 h-9 rounded-md border bg-background px-3 text-sm"
            >
              {userTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-32 h-9 rounded-md border bg-background px-3 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {userRows.length} of {users.length} users
          {query && ` matching "${query}"`}
        </span>
        <div className="flex items-center gap-4">
          {userTypeFilter !== "All" && (
            <Badge variant="secondary">
              Type: {userTypeFilter}
            </Badge>
          )}
          {statusFilter !== "All" && (
            <Badge variant="outline">
              Status: {statusFilter}
            </Badge>
          )}
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        rows={userRows}
        loading={loading}
        onRowDoubleClicked={(e) => {
          const user = users.find(u => u.id === e.data?.id);
          if (user) handleEditOpen(user);
        }}
        onEditClick={(row) => {
          const user = users.find(u => u.id === row.id);
          if (user) handleEditOpen(user as User);
        }}
        onUserAction={handleUserAction}
      />

      {/* User Details Modal */}
      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title={isEditing ? "User Details" : "Add User"}
        ariaLabel={isEditing ? "User Details" : "Add User"}
        footer={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {isEditing && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleUserAction(editing!.id, 'activate')}
                >
                  Activate
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleUserAction(editing!.id, 'delete')}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      >
        {isEditing && editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <p className="text-sm text-gray-900">{editing.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{editing.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User Type</label>
                    <Badge variant="outline">{editing.userTypeRef.description}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge variant={editing.accountStatus.description === 'REGULAR' ? 'default' : 'secondary'}>
                      {editing.accountStatus.description}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">
                      {new Date(editing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">
                      {editing.personalInfo.firstName} {editing.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <p className="text-sm text-gray-900">
                      {editing.personalInfo.contactNo || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">
                      {editing.personalInfo.address || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-sm text-gray-900">
                      {editing.personalInfo.gender || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Birthday</label>
                    <p className="text-sm text-gray-900">
                      {editing.personalInfo.birthday 
                        ? new Date(editing.personalInfo.birthday).toLocaleDateString()
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New User</h3>
            <p className="text-gray-600">User creation functionality will be implemented here.</p>
          </div>
        )}
      </ResponsiveOverlay>
    </div>
  );
};

export default UsersPage;
