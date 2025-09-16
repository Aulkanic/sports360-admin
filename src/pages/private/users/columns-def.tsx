import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX } from "lucide-react";
import type { UserRow } from "./table";

const userTypeVariant = (userType: string) => {
  switch (userType) {
    case "Admin": return "destructive";
    case "Coach": return "secondary";
    case "Player": return "default";
    case "Sports/hub": return "outline";
    case "Guest": return "secondary";
    default: return "muted";
  }
};


export const baseUsersColumnDefs: ColDef[] = [
  {
    field: "userName",
    headerName: "User",
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
    cellRenderer: (params: ICellRendererParams<UserRow>) => {
      const user = params.data!;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.personalInfo.upload?.filePath || '/default_avatar.png'} />
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.userName}</span>
            <span className="text-xs text-gray-500">{user.fullName}</span>
          </div>
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 200,
    cellRenderer: (params: ICellRendererParams<UserRow>) => (
      <span className="text-sm">{params.value}</span>
    ),
  },
  {
    field: "userType",
    headerName: "Type",
    sortable: true,
    filter: true,
    minWidth: 120,
    cellRenderer: (params: ICellRendererParams<UserRow>) => (
      <Badge variant={userTypeVariant(params.value)} className="text-xs">
        {params.value}
      </Badge>
    ),
  },
  {
    field: "contactNo",
    headerName: "Contact",
    sortable: true,
    filter: true,
    minWidth: 140,
    cellRenderer: (params: ICellRendererParams<UserRow>) => (
      <span className="text-sm text-gray-600">
        {params.value === 'N/A' ? '-' : params.value}
      </span>
    ),
  },
  {
    field: "createdAt",
    headerName: "Joined",
    sortable: true,
    filter: true,
    minWidth: 120,
    cellRenderer: (params: ICellRendererParams<UserRow>) => (
      <span className="text-sm text-gray-600">
        {new Date(params.value).toLocaleDateString()}
      </span>
    ),
  },
  {
    field: "lastLogin",
    headerName: "Last Active",
    sortable: true,
    filter: true,
    minWidth: 120,
    cellRenderer: (params: ICellRendererParams<UserRow>) => (
      <span className="text-sm text-gray-600">
        {new Date(params.value).toLocaleDateString()}
      </span>
    ),
  },
];

export function getUsersColumns(
  onEdit: (row: UserRow) => void,
  onUserAction?: (userId: string, action: 'activate' | 'deactivate' | 'delete') => void,
): ColDef[] {
  const actionsCol: ColDef = {
    headerName: "Actions",
    field: "actions",
    pinned: "right",
    minWidth: 100,
    maxWidth: 120,
    cellRenderer: (params: ICellRendererParams<UserRow>) => {
      const user = params.data!;
      const isRegular = user.status === 'REGULAR';
      
      return (
        <div className="flex items-center justify-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onUserAction && (
                <>
                  {!isRegular && (
                    <DropdownMenuItem 
                      onClick={() => onUserAction(user.id, 'activate')}
                      className="text-green-600"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  {isRegular && (
                    <DropdownMenuItem 
                      onClick={() => onUserAction(user.id, 'deactivate')}
                      className="text-orange-600"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onUserAction(user.id, 'delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    sortable: false,
    filter: false,
    suppressHeaderMenuButton: true,
  };
  
  return [...baseUsersColumnDefs, actionsCol];
}
