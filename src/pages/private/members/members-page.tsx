import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CustomDataTable from "@/components/custom-data-table";
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaUserPlus,
  FaUsers,
  FaUserCheck,
  FaUserClock
} from "react-icons/fa";
import { BiExport } from "react-icons/bi";

// Mock data for demonstration
const mockMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 234 567 8900",
    membershipType: "Premium",
    status: "Active",
    joinDate: "2024-01-15",
    lastActivity: "2024-12-20",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234 567 8901",
    membershipType: "Standard",
    status: "Active",
    joinDate: "2024-02-20",
    lastActivity: "2024-12-19",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1 234 567 8902",
    membershipType: "Basic",
    status: "Inactive",
    joinDate: "2023-11-10",
    lastActivity: "2024-11-15",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 234 567 8903",
    membershipType: "Premium",
    status: "Pending",
    joinDate: "2024-12-18",
    lastActivity: "2024-12-18",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+1 234 567 8904",
    membershipType: "Standard",
    status: "Active",
    joinDate: "2024-03-05",
    lastActivity: "2024-12-21",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "Standard",
    status: "Active"
  });

  // Filter members based on search and filters
  const filteredMembers = useMemo(() => {
    return mockMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      const matchesMembership = membershipFilter === "All" || member.membershipType === membershipFilter;
      
      return matchesSearch && matchesStatus && matchesMembership;
    });
  }, [searchTerm, statusFilter, membershipFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = mockMembers.length;
    const active = mockMembers.filter(m => m.status === "Active").length;
    const pending = mockMembers.filter(m => m.status === "Pending").length;
    const inactive = mockMembers.filter(m => m.status === "Inactive").length;
    
    return { total, active, pending, inactive };
  }, []);

  // Column definitions for the data table
  const columnDefs = [
    {
      headerName: "Member",
      field: "member",
      flex: 2,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-3 py-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={params.data.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {params.data.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{params.data.name}</p>
            <p className="text-sm text-muted-foreground">{params.data.email}</p>
          </div>
        </div>
      )
    },
    {
      headerName: "Phone",
      field: "phone",
      flex: 1,
    },
    {
      headerName: "Membership",
      field: "membershipType",
      flex: 1,
      cellRenderer: (params: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          params.value === "Premium" ? "bg-yellow-100 text-yellow-800" :
          params.value === "Standard" ? "bg-blue-100 text-blue-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {params.value}
        </span>
      )
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      cellRenderer: (params: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          params.value === "Active" ? "bg-green-100 text-green-800" :
          params.value === "Pending" ? "bg-orange-100 text-orange-800" :
          "bg-red-100 text-red-800"
        }`}>
          {params.value}
        </span>
      )
    },
    {
      headerName: "Join Date",
      field: "joinDate",
      flex: 1,
      cellRenderer: (params: any) => (
        <span className="text-sm">
          {new Date(params.value).toLocaleDateString()}
        </span>
      )
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewMember(params.data)}
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
          >
            <FaEye className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditMember(params.data)}
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
          >
            <FaEdit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteMember(params.data.id)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <FaTrash className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ];

  const handleViewMember = (member: any) => {
    setSelectedMember(member);
    setIsViewSheetOpen(true);
  };

  const handleEditMember = (member: any) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      status: member.status
    });
    setSelectedMember(member);
    setIsCreateSheetOpen(true);
  };

  const handleDeleteMember = (id: number) => {
    // Handle delete logic here
    console.log("Delete member:", id);
  };

  const handleCreateMember = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      membershipType: "Standard",
      status: "Active"
    });
    setSelectedMember(null);
    setIsCreateSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form data:", formData);
    setIsCreateSheetOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members Management</h1>
          <p className="text-muted-foreground mt-1">Manage your sports club members</p>
        </div>
        <Button onClick={handleCreateMember} className="bg-primary hover:bg-primary/90">
          <FaUserPlus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaUserClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="All">All Memberships</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="Basic">Basic</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FaFilter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline" size="sm">
              <BiExport className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <CustomDataTable
          columnDefs={columnDefs}
          rowData={filteredMembers}
          paginationPageSize={10}
          className="h-[600px]"
        />
      </div>

      {/* Create/Edit Member Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FaUserPlus className="w-5 h-5" />
              {selectedMember ? "Edit Member" : "Add New Member"}
            </SheetTitle>
            <SheetDescription>
              {selectedMember ? "Update member information" : "Create a new member account"}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Full Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Membership Type *
                </label>
                <select
                  value={formData.membershipType}
                  onChange={(e) => handleInputChange("membershipType", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {selectedMember ? "Update Member" : "Create Member"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* View Member Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FaEye className="w-5 h-5" />
              Member Details
            </SheetTitle>
            <SheetDescription>
              View member information and activity
            </SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {selectedMember.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedMember.name}</h3>
                  <p className="text-muted-foreground">{selectedMember.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
                    selectedMember.status === "Active" ? "bg-green-100 text-green-800" :
                    selectedMember.status === "Pending" ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Membership</label>
                    <p className="text-foreground">{selectedMember.membershipType}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="text-foreground">{new Date(selectedMember.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Activity</label>
                    <p className="text-foreground">{new Date(selectedMember.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    handleEditMember(selectedMember);
                  }}
                  className="flex-1"
                >
                  <FaEdit className="w-4 h-4 mr-2" />
                  Edit Member
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewSheetOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MembersPage;