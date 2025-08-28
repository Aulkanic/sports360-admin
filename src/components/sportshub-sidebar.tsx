import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { urls } from "@/routes";
import * as React from "react";
import { FaCalendarAlt, FaTachometerAlt } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function SportsHubSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Dashboard");
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  type NavSubItem = { title: string; url: string; icon: React.ReactNode };
  type NavItem = {
    title: string;
    icon: React.ReactNode;
    url?: string;
    submenu?: NavSubItem[];
  };
  const data: { navMain: NavItem[] } = {
    navMain: [
      {
        title: "Dashboard",
        url: urls.sportshubDashboard,
        icon: <FaTachometerAlt className="w-5 h-5" />,
      },
      {
        title: "Bookings",
        submenu: [
          {
            title: "Calendar",
            url: urls.sportshubBookingsCalendar,
            icon: <FaCalendarAlt className="w-4 h-4" />,
          },
          {
            title: "Manage",
            url: urls.sportshubBookingsAdmin,
            icon: <FaCalendarAlt className="w-4 h-4" />,
          },
        ],
        icon: <FaCalendarAlt className="w-5 h-5" />,
      },
    ],
  };

  const handleSubmenuToggle = (itemTitle: string) => {
    setOpenSubmenu(openSubmenu === itemTitle ? null : itemTitle);
    setActiveItem(itemTitle);
  };

  return (
    <Sidebar collapsible="icon" className="h-screen overflow-hidden bg-white" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex h-16 gap-3 items-center justify-start px-4 rounded-lg mx-2 mt-2">
          <div className="flex aspect-square bg-primary/10 size-12 items-center justify-center rounded-xl">
            <img src="/logo.png" alt="Sports360" className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-lg leading-tight">Sports360</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Sports Hub Panel</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2 overflow-y-auto overflow-x-hidden flex-1">
        <SidebarGroup>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Main Menu
            </p>
          </div>
          <SidebarMenu className="gap-1 px-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.submenu ? (
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`text-base h-12 px-4 rounded-xl transition-all duration-200 hover:bg-muted/50 ${
                        activeItem === item.title ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSubmenuToggle(item.title)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-foreground/80">{item.icon}</span>
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={`ml-auto w-4 h-4 text-foreground/70 transition-transform duration-200 ${
                            openSubmenu === item.title ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </SidebarMenuButton>
                    {openSubmenu === item.title && (
                      <div className="pl-8 py-2">
                        {item.submenu.map((sub: NavSubItem) => (
                          <div key={sub.title} className="py-1">
                            <Link to={sub.url} className="text-sm text-foreground/80 hover:text-foreground">
                              <span className="inline-flex items-center gap-2">{sub.icon}{sub.title}</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`text-base h-12 px-4 rounded-xl transition-all duration-200 hover:bg-muted/50 ${
                      activeItem === item.title ? "bg-muted" : ""
                    }`}
                    onClick={() => setActiveItem(item.title)}
                  >
                    <Link to={(item.url as string) || "#"} className="flex items-center gap-3 flex-1">
                      <span className="text-foreground/80">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t shrink-0">
        <div className="text-xs text-muted-foreground">Logged in as Sports Hub</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default SportsHubSidebar;
