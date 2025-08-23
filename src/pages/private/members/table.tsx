import React from "react";
import CustomDataTable from "@/components/custom-data-table";
import { memberColumnDefs } from "./columns-def";
import type { GridOptions, RowDoubleClickedEvent } from "ag-grid-community";

export interface MemberRow {
	id: string;
	name: string;
	email: string;
	phone: string;
	status: "Active" | "Inactive" | "Pending";
	joinedAt: string;
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

interface MembersTableProps {
	rows: MemberRow[];
	loading?: boolean;
	onRowDoubleClicked?: (event: RowDoubleClickedEvent<MemberRow>) => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ rows, loading, onRowDoubleClicked }) => {
	const gridOptions: GridOptions = {
		...baseGridOptions,
		onRowDoubleClicked,
	};

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