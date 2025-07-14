"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SchoolSidebar } from "@/components/school/SchoolSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function School(): React.JSX.Element  {
const [activeSection, setActiveSection] = useState("home");

  const renderActiveSection = () => {
    // switch (activeSection) {
    //   case "home":
    //     return <DashboardHome />;
    //   case "applications":
    //     return <MyApplications />;
    //   case "scholarships":
    //     return <Scholarships />;
    //   case "notifications":
    //     return <Notifications />;
    //   default:
    //     return <DashboardHome />;
    // }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        <SchoolSidebar activeTab={activeSection} onTabChange={setActiveSection} />
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* {renderActiveSection()} */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};