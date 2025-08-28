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
import { ChevronRight, Crown, Shield } from "lucide-react";
import * as React from "react";
import {
  FaCalendarAlt,
  FaCog,
  FaDollarSign,
  FaFutbol,
  FaList,
  FaRegCalendar,
  FaSignOutAlt,
  FaTachometerAlt,
  FaUserAlt,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Dashboard");
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: urls.superadmindashboard,
        icon: <FaTachometerAlt className="w-5 h-5" />,
      },
      {
        title: "Facility",
        icon: <FaFutbol className="w-5 h-5" />,
        submenu: [
          {
            title: "List of Sports",
            url: urls.sports,
            icon: <FaList className="w-4 h-4" />,
          },
          {
            title: "Courts Rentals",
            url: urls.courtsFields,
            icon: <FaRegCalendar className="w-4 h-4" />,
          },
          {
            title: "Add-ons",
            url: urls.equipment,
            icon: <FaList className="w-4 h-4" />,
          },
        ],
      },
      {
        title: "Members",
        url: urls.members,
        icon: <FaUsers className="w-5 h-5" />,
      },
      {
        title: "Membership Plans",
        url: urls.plans,
        icon: <FaDollarSign className="w-5 h-5" />,
      },
      {
        title: "Events",
        url: urls.events,
        icon: <FaRegCalendar className="w-5 h-5" />,
      },
      {
        title: "Bookings",
        icon: <FaCalendarAlt className="w-5 h-5" />,

        submenu: [
          {
            title: "Calendar",
            url: urls.bookingsCalendar,
            icon: <FaCalendarAlt className="w-4 h-4" />,
          },
          {
            title: "Manage",
            url: urls.bookingsAdmin,
            icon: <FaList className="w-4 h-4" />,
          },
        ],
      },
    ],
  };

  const settingsItems = [
    {
      title: "Settings",
      url: urls.settings,
      icon: <FaCog className="w-5 h-5" />,
    },
    {
      title: "Profile",
      url: urls.profile,
      icon: <FaUserAlt className="w-5 h-5" />,
    },
  ];

  const handleSubmenuToggle = (itemTitle: string) => {
    setOpenSubmenu(openSubmenu === itemTitle ? null : itemTitle);
    setActiveItem(itemTitle);
  };
  return (
    <Sidebar collapsible="icon" className="h-screen overflow-hidden" {...props}>
      <SidebarHeader className="border-b border-white/10">
        <div className="flex h-16 text-white bg-gradient-to-r from-primary to-accent gap-3 items-center justify-start px-4 rounded-lg mx-2 mt-2 shadow-lg">
          <div className="flex aspect-square bg-white/95 size-12 items-center justify-center rounded-xl shadow-md">
            <img src="/logo.png" alt="Sports360" className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-lg leading-tight">Sports360</p>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-300" />
              <span className="text-xs text-white/90 font-medium">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary pt-2 overflow-y-auto overflow-x-hidden flex-1">
        <SidebarGroup>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
              Main Menu
            </p>
          </div>
          <SidebarMenu className="gap-1 px-2">
            {data.navMain.map((item) => (
              <Collapsible
                key={item.title}
                className="group/collapsible"
                open={openSubmenu === item.title}
                onOpenChange={() =>
                  item.submenu && handleSubmenuToggle(item.title)
                }
              >
                <SidebarMenuItem>
                  {item.submenu ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={`text-base h-12 px-4 rounded-xl transition-all duration-200 hover:bg-white/10 hover:shadow-md ${
                            activeItem === item.title
                              ? "bg-white/15 shadow-md border border-white/20"
                              : ""
                          } ${openSubmenu === item.title ? "bg-white/10" : ""}`}
                          onClick={() => handleSubmenuToggle(item.title)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-white/90 group-hover:text-white transition-colors">
                              {item.icon}
                            </span>
                            <span className="text-white font-medium">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.submenu && (
                              <ChevronRight
                                className={`ml-auto w-4 h-4 text-white/70 transition-transform duration-200 ${
                                  openSubmenu === item.title ? "rotate-90" : ""
                                }`}
                              />
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {item.submenu && (
                          <SidebarMenuSub className="!border-0 mt-2 ml-4">
                            {item.submenu.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className="h-10 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                                >
                                  <Link
                                    to={subItem.url}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="text-white/70">
                                      {subItem.icon}
                                    </span>
                                    <span className="text-white/90 text-sm">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </CollapsibleContent>
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`text-base h-12 px-4 rounded-xl transition-all duration-200 hover:bg-white/10 hover:shadow-md ${
                        activeItem === item.title
                          ? "bg-white/15 shadow-md border border-white/20"
                          : ""
                      }`}
                      onClick={() => setActiveItem(item.title)}
                    >
                      <Link
                        to={item.url || "#"}
                        className="flex items-center gap-3 flex-1"
                      >
                        <span className="text-white/90 group-hover:text-white transition-colors">
                          {item.icon}
                        </span>
                        <span className="text-white font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <Separator className="mx-4 my-4 bg-white/20" />

        <SidebarGroup>
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
              System
            </p>
          </div>
          <SidebarMenu className="gap-1 px-2">
            {settingsItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`text-base h-12 px-4 rounded-xl transition-all duration-200 hover:bg-white/10 hover:shadow-md ${
                    activeItem === item.title
                      ? "bg-white/15 shadow-md border border-white/20"
                      : ""
                  }`}
                  onClick={() => setActiveItem(item.title)}
                >
                  <Link
                    to={item.url}
                    className="flex items-center gap-3 flex-1"
                  >
                    <span className="text-white/90 group-hover:text-white transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-white font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Super Admin
            </p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-400" />
              <p className="text-xs text-white/70">Online</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors group">
            <FaSignOutAlt className="w-4 h-4 text-white/70 group-hover:text-white" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
