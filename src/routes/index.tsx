import { PrivateLayout, PublicLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage, MembersPage, MembershipPlansPage, SportsPage, CourtsFieldsPage, EventsPage } from "@/pages";

export const urls = {
	login: "/",
	superadmindashboard: '/super-admin/dashboard',
	members: '/super-admin/members',
	plans: '/super-admin/membership-plans',
	sports: '/super-admin/sports',
	courtsFields: '/super-admin/sports/courts-fields',
	events: '/super-admin/events',
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
			{ path: urls.sports, element: <SportsPage /> },
			{ path: urls.courtsFields, element: <CourtsFieldsPage /> },
			{ path: urls.events, element: <EventsPage /> },
		]
	}
};
