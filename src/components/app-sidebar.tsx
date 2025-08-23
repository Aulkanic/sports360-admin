import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { urls } from "@/routes";
import { Separator } from "./ui/separator";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaRegCalendar,
  FaDollarSign,
  FaFutbol,
  FaChartLine,
  FaCog,
  FaUserAlt,
  FaPlusCircle,
  FaList,
} from "react-icons/fa"; 
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronRight } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: urls.superadmindashboard,
        icon: <FaTachometerAlt />,
      },
      {
        title: "Members",
        icon: <FaUsers />,
        submenu: [
          { title: "View All", url: "#", icon: <FaList /> },
          { title: "Add Member", url: "#", icon: <FaPlusCircle /> },
        ],
      },
      {
        title: "Membership Plans",
        url: "#",
        icon: <FaDollarSign />,
      },
      {
        title: "Bookings",
        icon: <FaCalendarAlt />,
        submenu: [
          { title: "Manage Reservations", url: "#", icon: <FaList /> },
          { title: "Calendar View", url: "#", icon: <FaCalendarAlt /> },
        ],
      },
      {
        title: "Events",
        icon: <FaRegCalendar />,
        submenu: [
          { title: "View All Events", url: "#", icon: <FaList /> },
          { title: "Create Event", url: "#", icon: <FaPlusCircle /> },
        ],
      },
      {
        title: "Payments",
        url: "#",
        icon: <FaDollarSign />,
      },
      {
        title: "Activities",
        url: "#",
        icon: <FaFutbol />,
      },
      {
        title: "Reports",
        url: "#",
        icon: <FaChartLine />,
      },
      {
        title: "Settings",
        url: "#",
        icon: <FaCog />,
      },
      {
        title: "Profile",
        url: "#",
        icon: <FaUserAlt />,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-16 text-white bg-primary gap-4 items-center justify-start">
          <div className="flex aspect-square bg-white size-14 items-center justify-center rounded-full">
            <img src="/logo.png" alt="" />
          </div>
          <div>
            <p className="font-bold text-xl">Sports360</p>
            <span>Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="bg-primary pt-4">
        <SidebarGroup>
          <SidebarMenu className="gap-4">
            {data.navMain.map((item) => (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className="text-lg">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.title}</span>
                      {item.submenu && (
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {item.submenu && (
                      <SidebarMenuSub className="!border-0">
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                               - <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
