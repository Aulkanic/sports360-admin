import React from "react";
import CustomDataTable from "@/components/custom-data-table";
import { memberColumnDefs } from "./columns-def";
import type { GridOptions } from "ag-grid-community";

export interface MemberRow {
	id: string;
	name: string;
	email: string;
	phone: string;
	status: "Active" | "Inactive" | "Pending";
	joinedAt: string;
}

const gridOptions: GridOptions = {
	defaultColDef: {
		sortable: true,
		filter: true,
		resizable: true,
		floatingFilter: true,
	},
	rowSelection: "single",
	animateRows: true,
};

interface MembersTableProps {
	rows: MemberRow[];
	loading?: boolean;
}

const MembersTable: React.FC<MembersTableProps> = ({ rows, loading }) => {
	return (
		<CustomDataTable
			columnDefs={memberColumnDefs}
			rowData={rows}
			paginationPageSize={10}
			gridOptions={gridOptions}
			loading={loading}
			className="rounded-lg"
		/>
	);
};

export default MembersTable;