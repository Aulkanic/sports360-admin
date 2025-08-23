import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MembersTable from "./table";
import type { MemberRow } from "./table";
import { urls } from "@/routes";

const mockRows: MemberRow[] = [
	{ id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-1234", status: "Active", joinedAt: "2024-05-10" },
	{ id: "2", name: "Bob Smith", email: "bob@example.com", phone: "+1 555-5678", status: "Inactive", joinedAt: "2024-02-18" },
	{ id: "3", name: "Carol Davis", email: "carol@example.com", phone: "+1 555-9012", status: "Pending", joinedAt: "2025-01-03" },
];

const MembersPage: React.FC = () => {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Members</h1>
				<Button asChild>
					<Link to={urls.addMember}>Add Member</Link>
				</Button>
			</div>
			<MembersTable rows={mockRows} />
		</div>
	);
};

export default MembersPage;