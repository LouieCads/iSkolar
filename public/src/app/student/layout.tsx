"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  Home,
  Search,
  FileText,
  Wallet,
  Bell,
  User,
} from "lucide-react";
import { usePlatform } from "@/hooks/use-platform";

// Confirmation Modal Component (reusable)
function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Confirm Logout
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Are you sure you want to logout? You will be redirected to the login page.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 text-sm cursor-pointer font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 text-sm cursor-pointer font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { platform } = usePlatform();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      path: "/student/feed",
      icon: Home,
    },
    {
      name: "Discover",
      path: "/student/discover",
      icon: Search,
    },
    {
      name: "Notifications",
      path: "/student/notifications",
      icon: Bell,
    },
  ];

  const handleLogout = () => {
    // Remove token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      // You can also remove other auth-related items if needed
      // localStorage.removeItem("userType");
      // localStorage.removeItem("userId");
    }

    // Close dropdown and modal
    setIsDropdownOpen(false);
    setIsLogoutModalOpen(false);

    // Redirect to auth page
    router.push("/auth");
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          {/* Logo + Search */}
          <div className="flex items-center gap-4">
            <Link href="/student">
              <Image
                src={platform?.logoUrl || "/iSkolar_logo.png"}
                alt="Logo"
                width={35}
                height={35}
              />
            </Link>
            <input
              type="text"
              placeholder="Search scholarships..."
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
                  className={`flex flex-col items-center text-[11px] font-medium cursor-pointer transition-colors ${
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
                  href="/student/my-profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  href="/student/account/my-account"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
}