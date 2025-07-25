"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider // Add this import
} from "@/components/ui/sidebar";
import { usePlatform } from "@/hooks/use-platform";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { platform, loading } = usePlatform();

  const navItems = [
    {
      name: 'My Account',
      path: '/student/account/my-account',
      icon: UserCircle
    },
    {
      name: 'Verification',
      path: '/student/account/verification',
      icon: ShieldCheck
    },
  ];

  return (
    <SidebarProvider> {/* Add this wrapper */}
      <div className="flex min-h-screen">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="p-4 pl-10 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/student" className="flex items-center space-x-2">
                <Image
                  src={platform?.logoUrl || "/iSkolar_logo.png"}
                  alt="iSkolar Logo"
                  width={33}
                  height={35}
                />
                <span className="text-xl font-bold text-blue-900">
                  Account
                </span>
              </Link>
            </div>
          </SidebarHeader>
          
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
                            className={`w-full flex items-center cursor-pointer space-x-3 px-4 py-2.5 rounded-lg text-base font-normal transition-all duration-200 ${
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

        {/* Right Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}