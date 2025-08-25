import { PrivateLayout, PublicLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage, MembersPage, MembershipPlansPage, SportsPage, CourtsFieldsPage, EventsPage, BookingsCalendarPage, BookingsAdminPage, EquipmentPage, CalendarDashboardPage, OpenPlayPage, BookingsExplorePage, CommunitiesClubsAdminPage, ProfilePage, SettingsPage } from "@/pages";

export const urls = {
	login: "/",
	superadmindashboard: '/super-admin/dashboard',
	members: '/super-admin/members',
	plans: '/super-admin/membership-plans',
	sports: '/super-admin/sports',
	courtsFields: '/super-admin/sports/courts-fields',
	events: '/super-admin/events',
	bookingsCalendar: '/super-admin/bookings/calendar',
	bookingsAdmin: '/super-admin/bookings/manage',
	bookingsExplore: '/super-admin/bookings/explore',
	equipment: '/super-admin/sports/equipment',
	calendarDashboard: '/super-admin/bookings/calendar-dashboard',
	openPlay: '/super-admin/bookings/open-play',
	communities: '/super-admin/communities-clubs',
	profile: '/super-admin/profile',
	settings: '/super-admin/settings',
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
			{ path: urls.bookingsCalendar, element: <BookingsCalendarPage /> },
			{ path: urls.bookingsAdmin, element: <BookingsAdminPage /> },
			{ path: urls.bookingsExplore, element: <BookingsExplorePage /> },
			{ path: urls.equipment, element: <EquipmentPage /> },
			{ path: urls.calendarDashboard, element: <CalendarDashboardPage /> },
			{ path: urls.openPlay, element: <OpenPlayPage /> },
			{ path: urls.communities, element: <CommunitiesClubsAdminPage /> },
			{ path: urls.profile, element: <ProfilePage /> },
			{ path: urls.settings, element: <SettingsPage /> },
		]
	}
};
