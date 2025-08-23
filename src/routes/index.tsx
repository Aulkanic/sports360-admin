import { PrivateLayout, PublicLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage, MembersPage, MembershipPlansPage } from "@/pages";

export const urls = {
	login: "/",
	superadmindashboard: '/super-admin/dashboard',
	members: '/super-admin/members',
	plans: '/super-admin/membership-plans',
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
			{ path: urls.plans, element: <MembershipPlansPage /> },
		]
	}
};
