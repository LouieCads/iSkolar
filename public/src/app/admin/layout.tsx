"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import {
  LayoutDashboard,
  Shield,
  Users,
  Repeat,
  FileBadge,
  Settings,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider 
} from "@/components/ui/sidebar";
import { usePlatform } from "@/hooks/use-platform";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { platform, loading } = usePlatform();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'KYC/KYB Approvals',
      path: '/admin/kyc-kyb-approvals',
      icon: Shield
    },
    {
      name: 'Scholarships',
      path: '/admin/scholarships',
      icon: FileBadge
    },
    {
      name: 'Transactions',
      path: '/admin/transactions',
      icon: Repeat
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    router.push("/auth");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="p-4 pl-10 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center space-x-2">
                <Image
                  src={platform?.logoUrl || "/iSkolar_logo.png"}
                  alt="iSkolar Logo"
                  width={33}
                  height={35}
                />
                <span className="text-xl font-bold text-blue-900">
                  iSkolar
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                    
                    return (
                      <SidebarMenuItem key={item.path}>
                        <Link href={item.path}>
                          <SidebarMenuButton
                            className={`w-full flex items-center cursor-pointer space-x-3 px-4 py-2.5 rounded-lg text-base font-normal transition-all duration-200 ${
                              isActive
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

        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
