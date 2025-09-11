import { PrivateLayout, PublicLayout, SportsHubLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage, MembersPage, MembershipPlansPage, SportsPage, SportsFormPage, CourtsPage, EventsPage, BookingsCalendarPage, BookingsAdminPage, EquipmentPage, CalendarDashboardPage, OpenPlayPage, OpenPlayDetailPage, BookingsExplorePage, CommunitiesClubsAdminPage, ProfilePage, SettingsPage } from "@/pages";
import MatchupScreen from "@/pages/private/bookings/matchup-screen";
import MatchupScreenMulti from "@/pages/private/bookings/matchup-screen-multi";
import SportsHubRegisterPage from "@/pages/public/register/sportshub";
import SportsHubDashboardPage from "@/pages/private/sportshub/dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

export const urls = {
	login: "/",
  sportshubRegister: "/register/sportshub",
  sportshubDashboard: "/sportshub/dashboard",
	sportshubBookingsCalendar: "/sportshub/bookings/calendar",
	sportshubBookingsAdmin: "/sportshub/bookings/manage",
	superadmindashboard: '/super-admin/dashboard',
	members: '/super-admin/members',
	plans: '/super-admin/membership-plans',
	sports: '/super-admin/sports',
	sportsForm: '/super-admin/sports/form',
	courtsFields: '/super-admin/sports/courts-fields',
	events: '/super-admin/events',
	bookingsCalendar: '/super-admin/bookings/calendar',
	bookingsAdmin: '/super-admin/bookings/manage',
	bookingsExplore: '/super-admin/bookings/explore',
	equipment: '/super-admin/sports/equipment',
	calendarDashboard: '/super-admin/bookings/calendar-dashboard',
	openPlay: '/super-admin/bookings/open-play',
	openPlayDetail: '/open-play/:id',
	matchupScreen: '/matchup/:id',
	matchupScreenMulti: '/matchup-multi/:id',
	communities: '/super-admin/communities-clubs',
	profile: '/super-admin/profile',
	settings: '/super-admin/settings',
};

export const routeList = {
	public: {
		layout: <PublicLayout />,
		routes: [
			{ path: urls.login, element: <LoginPage /> },
			{ path: urls.sportshubRegister, element: <SportsHubRegisterPage /> },
		],
	},
	private : {
		layout: <PrivateLayout />,
		routes : [
			{ path: urls.superadmindashboard, element: <ProtectedRoute><SuperAdminDashboardPage /></ProtectedRoute> },
			{ path: urls.members, element: <ProtectedRoute><MembersPage /></ProtectedRoute> },
			{ path: urls.plans, element: <ProtectedRoute><MembershipPlansPage /></ProtectedRoute> },
			{ path: urls.sports, element: <ProtectedRoute><SportsPage /></ProtectedRoute> },
			{ path: urls.sportsForm, element: <ProtectedRoute><SportsFormPage /></ProtectedRoute> },
			{ path: urls.courtsFields, element: <ProtectedRoute><CourtsPage /></ProtectedRoute> },
			{ path: urls.events, element: <ProtectedRoute><EventsPage /></ProtectedRoute> },
			{ path: urls.bookingsCalendar, element: <ProtectedRoute><BookingsCalendarPage /></ProtectedRoute> },
			{ path: urls.bookingsAdmin, element: <ProtectedRoute><BookingsAdminPage /></ProtectedRoute> },
			{ path: urls.bookingsExplore, element: <ProtectedRoute><BookingsExplorePage /></ProtectedRoute> },
			{ path: urls.equipment, element: <ProtectedRoute><EquipmentPage /></ProtectedRoute> },
			{ path: urls.calendarDashboard, element: <ProtectedRoute><CalendarDashboardPage /></ProtectedRoute> },
			{ path: urls.openPlay, element: <ProtectedRoute><OpenPlayPage /></ProtectedRoute> },
			{ path: urls.openPlayDetail, element: <ProtectedRoute><OpenPlayDetailPage /></ProtectedRoute> },
			{ path: urls.communities, element: <ProtectedRoute><CommunitiesClubsAdminPage /></ProtectedRoute> },
			{ path: urls.profile, element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
			{ path: urls.settings, element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
		]
	},
	// SportsHub private area
	sportshub: {
		layout: <SportsHubLayout />,
		routes: [
			{ path: urls.sportshubDashboard, element: <ProtectedRoute><SportsHubDashboardPage /></ProtectedRoute> },
			{ path: urls.sportshubBookingsCalendar, element: <ProtectedRoute><BookingsCalendarPage /></ProtectedRoute> },
			{ path: urls.sportshubBookingsAdmin, element: <ProtectedRoute><BookingsAdminPage /></ProtectedRoute> },
		]
	},
	// Standalone routes without layout (for TV displays, etc.)
	standalone: {
		layout: null,
		routes: [
			{ path: urls.matchupScreen, element: <MatchupScreen /> },
			{ path: urls.matchupScreenMulti, element: <MatchupScreenMulti /> },
		]
	}
};
