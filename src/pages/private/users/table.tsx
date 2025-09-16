import React, { useMemo } from "react";
import CustomDataTable from "@/components/custom-data-table";
import { getUsersColumns } from "./columns-def";
import type { GridOptions, RowDoubleClickedEvent } from "ag-grid-community";

export interface UserRow {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  userType: string;
  status: string;
  contactNo: string;
  createdAt: string;
  lastLogin: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName: string | null;
    address: string | null;
    gender: string | null;
    birthday: string | null;
    country: string | null;
    contactNo: string | null;
    upload: {
      filePath: string | null;
    };
  };
}

const baseGridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  },
  rowSelection: "single",
  animateRows: true,
};

interface UsersTableProps {
  rows: UserRow[];
  loading?: boolean;
  onRowDoubleClicked?: (event: RowDoubleClickedEvent<UserRow>) => void;
  onEditClick?: (row: UserRow) => void;
  onUserAction?: (userId: string, action: 'activate' | 'deactivate' | 'delete') => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  rows, 
  loading, 
  onRowDoubleClicked, 
  onEditClick,
  onUserAction 
}) => {
  const gridOptions: GridOptions = useMemo(() => ({
    ...baseGridOptions,
    onRowDoubleClicked,
  }), [onRowDoubleClicked]);

  const columns = useMemo(() => 
    getUsersColumns(
      (row) => onEditClick?.(row),
      (userId, action) => onUserAction?.(userId, action)
    ), 
    [onEditClick, onUserAction]
  );

  return (
    <CustomDataTable
      columnDefs={columns}
      rowData={rows}
      paginationPageSize={20}
      gridOptions={gridOptions}
      loading={loading}
      className="rounded-lg"
    />
  );
};

export default UsersTable;
