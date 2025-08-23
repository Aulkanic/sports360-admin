import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import type { MemberRow } from "./table";

export const baseMemberColumnDefs: ColDef[] = [
	{ field: "name", headerName: "Name", sortable: true, filter: true, flex: 1, minWidth: 160 },
	{ field: "email", headerName: "Email", sortable: true, filter: true, flex: 1, minWidth: 200 },
	{ field: "phone", headerName: "Phone", sortable: true, filter: true, minWidth: 140 },
	{ field: "status", headerName: "Status", sortable: true, filter: true, minWidth: 120 },
	{ field: "joinedAt", headerName: "Joined", sortable: true, filter: true, minWidth: 140 },
];

export function getMemberColumns(
	onEdit: (row: MemberRow) => void,
	onDelete?: (row: MemberRow) => void,
): ColDef[] {
	const actionsCol: ColDef = {
		headerName: "Actions",
		field: "actions",
		pinned: "right",
		minWidth: 160,
		maxWidth: 200,
		cellRenderer: (params: ICellRendererParams<MemberRow>) => {
			return (
				<div className="flex items-center gap-2">
					<Button size="sm" onClick={() => onEdit(params.data!)}>Edit</Button>
					<Button size="sm" variant="outline" onClick={() => onDelete?.(params.data!)}>Delete</Button>
				</div>
			);
		},
		sortable: false,
		filter: false,
		suppressHeaderMenuButton: true,
	};
	return [...baseMemberColumnDefs, actionsCol];
}