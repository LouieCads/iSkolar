"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, Settings, ShieldCheck } from "lucide-react";

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
    <div className="flex min-h-full bg-white">
      {/* Settings Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base font-normal transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 p-6 bg-white">
        {children}
      </div>
    </div>
  );
}