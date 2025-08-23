import { PrivateLayout, PublicLayout } from "@/layout";
import { LoginPage, SuperAdminDashboardPage } from "@/pages";

export const urls = {
  login: "/",
  superadmindashboard: '/super-admin/dashboard',
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
    ]
  }
};
