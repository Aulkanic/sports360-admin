import type { ColDef } from "ag-grid-community";

export const memberColumnDefs: ColDef[] = [
	{ field: "name", headerName: "Name", sortable: true, filter: true, flex: 1, minWidth: 160 },
	{ field: "email", headerName: "Email", sortable: true, filter: true, flex: 1, minWidth: 200 },
	{ field: "phone", headerName: "Phone", sortable: true, filter: true, minWidth: 140 },
	{ field: "status", headerName: "Status", sortable: true, filter: true, minWidth: 120 },
	{ field: "joinedAt", headerName: "Joined", sortable: true, filter: true, minWidth: 140 },
];