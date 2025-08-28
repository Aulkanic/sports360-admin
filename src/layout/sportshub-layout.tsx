import { SportsHubSidebar } from "@/components/sportshub-sidebar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BiSearchAlt } from "react-icons/bi";
import { MdNotificationsActive } from "react-icons/md";
import { Outlet } from "react-router-dom";

const SportsHubLayout = () => {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <SportsHubSidebar className="!bg-white" />
      <SidebarInset>
        <header className="flex bg-white sticky top-0 shadow-b-2 h-20 shrink-0 items-center gap-4 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-10">
          <div className="flex-1 flex items-center space-x-4">
            <SidebarTrigger />
            <div className="flex justify-center items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <BiSearchAlt />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <MdNotificationsActive size={28} color="gray" />
            <Avatar className="w-8">
              <AvatarImage sizes="10" src="https://github.com/shadcn.png" />
            </Avatar>
          </div>
        </header>
        <div className="flex-1 p-4 bg-input overflow-y-auto overflow-x-hidden h-[calc(100vh-5rem)]">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SportsHubLayout;
