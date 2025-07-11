"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Admin(): React.JSX.Element  {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const router = useRouter();

  // useEffect(() => {
  //   const checkAuth = async (): Promise<void> => {
  //     try {
  //       const token = await localStorage.getItem('token');
  //       if (!token) {
  //         router.replace('/auth');
  //       } 
  //     } catch (e) {
  //       // Ignore errors, stay on sign-in
  //     }
  //   };
  //   checkAuth();
  // }, [router]);

  const handleLogout = (): void => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    router.push("/auth");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full bg-gray-50">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-blue-900">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                </h1>
                <p className="text-gray-600 mt-2">
                  Current active tab: {activeTab}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};