"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, Settings, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'My Profile',
      path: '/school/settings/profile',
      icon: UserCircle
    },
    {
      name: 'Account',
      path: '/school/settings/account',
      icon: Settings
    },
    {
      name: 'Verification',
      path: '/school/settings/verification',
      icon: ShieldCheck
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] max-w-full overflow-hidden">
      <Sidebar className="w-64 flex-shrink-0 border-r border-gray-200">
        <SidebarContent className="p-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <Link href={item.path}>
                        <SidebarMenuButton
                          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base font-normal transition-all duration-200 ${
                            pathname === item.path
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 min-w-0 p-6">
        {children}
      </div>
    </div>
  );
}