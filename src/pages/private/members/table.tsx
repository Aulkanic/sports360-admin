import React, { useMemo } from "react";
import CustomDataTable from "@/components/custom-data-table";
import { getMemberColumns } from "./columns-def";
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
	onEditClick?: (row: MemberRow) => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ rows, loading, onRowDoubleClicked, onEditClick }) => {
	const gridOptions: GridOptions = useMemo(() => ({
		...baseGridOptions,
		onRowDoubleClicked,
	}), [onRowDoubleClicked]);

	const columns = useMemo(() => getMemberColumns((row) => onEditClick?.(row)), [onEditClick]);

	return (
		<CustomDataTable
			columnDefs={columns}
			rowData={rows}
			paginationPageSize={10}
			gridOptions={gridOptions}
			loading={loading}
			className="rounded-lg"
		/>
	);
};

export default MembersTable;