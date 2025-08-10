"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  Repeat,
  Home,
  BadgeDollarSign,
  FileText,
  Wallet,
  Bell,
} from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { platform } = usePlatform();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      path: "/sponsor/feed",
      icon: Home,
    },
    {
      name: "Scholarships",
      path: "/sponsor/create-scholarship",
      icon: BadgeDollarSign,
    },
    {
      name: "Applications",
      path: "/sponsor/applications",
      icon: FileText,
    },
    {
      name: "Funds",
      path: "/sponsor/funds",
      icon: Wallet,
    },
    {
      name: "Transactions",
      path: "/sponsor/transactions",
      icon: Repeat,
    },
    {
      name: "Notifications",
      path: "/sponsor/notifications",
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen flex  flex-col">
      {/* Top Navigation */}
      <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-30 py-3 flex items-center justify-between">
          {/* Logo + Search */}
          <div className="flex items-center gap-4">
            <Link href="/sponsor">
              <Image
                src={platform?.logoUrl || "/iSkolar_logo.png"}
                alt="Logo"
                width={35}
                height={35}
              />
            </Link>
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Horizontal Nav */}
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                pathname.startsWith(`${item.path}/`);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex flex-col items-center text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Profile Dropdown */}
          <div
            className="relative cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <Image
              src="/iSkolar_logo.png"
              alt="Profile"
              width={35}
              height={35}
              className="rounded-full"
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <Link
                  href="/sponsor/my-profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  href="/sponsor/account"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Account
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
