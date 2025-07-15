import { 
  LayoutDashboard, 
  Shield,
  Repeat,
  Settings,
  FileBadge,
  ChevronDown,
  LogOut
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { usePlatform } from "@/hooks/use-platform";

interface Submenu {
  id: string;
  title: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  submenus?: Submenu[];
}

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "kyc-status",
    title: "KYC/KYB Status",
    icon: Shield,
  },
  {
    id: "scholarships",
    title: "Scholarships",
    icon: FileBadge,
  },
  {
    id: "transactions",
    title: "Transactions",
    icon: Repeat,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    submenus: [
      { id: "general", title: "General" },
      { id: "user-management", title: "User Management" },
      { id: "personal-information", title: "Scholarship Details" },
      { id: "academic-data", title: "Academic Details" },
      { id: "scholarship-tags", title: "Token & Payment" },
      { id: "sponsors", title: "KYC Configuration" },
      { id: "document-type", title: "Credentials" },
      { id: "notification", title: "Notification" },
    ]
  },
];

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const { platform, loading } = usePlatform();

  const handleSettingsClick = (): void => {
    setOpenSettings(!openSettings);
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4 pl-17 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <Image
              src="/iSkolar_logo.png"
              alt="ScholarPass Logo"
              width={33}
              height={35}
            />
            <span className="text-xl font-bold text-blue-900">
              {loading ? 'Loading...' : platform?.name || 'iSkolar'}
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 pl-12">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSettings = item.id === 'settings';
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => isSettings ? handleSettingsClick() : onTabChange(item.id)}
                      className={`w-full flex items-center cursor-pointer justify-between space-x-3 px-4 py-2.5 rounded-lg text-base font-normal transition-all duration-200 ${
                        activeTab === item.id && !isSettings
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Icon className="w-6 h-6" />
                        <span>{item.title}</span>
                      </div>
                      {isSettings && <ChevronDown className={`w-5 h-5 transition-transform ${openSettings ? 'rotate-180' : ''}`} />}
                    </SidebarMenuButton>
                    {isSettings && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSettings ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <SidebarMenuSub>
                          {item.submenus?.map((submenu) => (
                            <SidebarMenuSubItem key={submenu.id}>
                              <SidebarMenuSubButton
                                onClick={() => onTabChange(submenu.id)}
                                isActive={activeTab === submenu.id}
                                className="w-full text-sm mb-0.25 cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[active=true]:text-blue-700 data-[active=true]:bg-blue-50"
                              >
                                {submenu.title}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}