import {
  Home,
  LayoutDashboard,
  BadgeDollarSign,
  FileText,
  Wallet,
  Bell,
  User,
} from "lucide-react";
import React from "react";
import Image from "next/image";

const sponsorMenu = [
  { id: "home", label: "Home", icon: Home, href: "/sponsor" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/sponsor/dashboard" },
  { id: "banners", label: "Scholarship Banners", icon: BadgeDollarSign, href: "/sponsor/banners" },
  { id: "applications", label: "Applications", icon: FileText, href: "/sponsor/applications" },
  { id: "funds", label: "Funds", icon: Wallet, href: "/sponsor/funds" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/sponsor/notifications" },
  { id: "profile", label: "Profile", icon: User, href: "/sponsor/profile" },
];

export default function SponsorNav() {
  return (
    <nav className="w-full flex items-center justify-center bg-white border-b border-gray-200 py-3 px-35 sticky top-0 z-100">
      <div className="flex items-center space-x-3 min-w-0">
        <a href="/sponsor" className="flex items-center">
          <Image src="/iSkolar_logo.png" alt="iSkolar Logo" width={36} height={36} />
        </a>
        <input
          type="text"
          placeholder="Search..."
          className="rounded-xl border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-40 md:w-64"
        />
      </div>
      <ul className="flex space-x-8 mx-auto">
        {sponsorMenu.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="flex flex-col items-center text-gray-700 hover:text-blue-700 transition-colors group"
            >
              <item.icon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-normal tracking-wide">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {/* Right: Empty for now, can add user actions here later */}
      <div className="w-40 md:w-64" />
    </nav>
  );
}
