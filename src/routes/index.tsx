import { PrivateLayout, PublicLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage, MembersPage, AddMemberPage } from "@/pages";

export const urls = {
	login: "/",
	superadmindashboard: '/super-admin/dashboard',
	members: '/super-admin/members',
	addMember: '/super-admin/members/add',
};

export const routeList = {
	public: {
		layout: <PublicLayout />,
		routes: [{ path: urls.login, element: <LoginPage /> }],
	},
	private : {
		layout: <PrivateLayout />,
		routes : [
			{ path: urls.superadmindashboard, element: <SuperAdminDashboardPage /> },
			{ path: urls.members, element: <MembersPage /> },
			{ path: urls.addMember, element: <AddMemberPage /> },
		]
	}
};
