"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import General from "@/components/admin/settings/General";
import { UserManagement } from "@/components/admin/settings/UserManagement";
import { ScholarshipDetails } from "@/components/admin/settings/ScholarshipDetails";
import { AcademicDetails } from "@/components/admin/settings/AcademicDetails";
import { Credentials } from "@/components/admin/settings/Credentials";

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
            {activeTab === "general" && <General />}
            {activeTab === "user-management" && <UserManagement />}
            {activeTab === "scholarship-details" && <ScholarshipDetails />}
            {activeTab === "academic-details" && <AcademicDetails />}
            {activeTab === "credentials" && <Credentials />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};