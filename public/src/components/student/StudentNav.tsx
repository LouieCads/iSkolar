import {
  Home,
  LayoutDashboard,
  FileText,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const studentMenu = [
  { id: "home", label: "Home", icon: Home, href: "/student" },
  { id: "scholarships", label: "Scholarships", icon: FileText, href: "/student/scholarships" },
  { id: "my-applications", label: "My Applications", icon: LayoutDashboard, href: "/student/my-applications" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/student/notifications" },
];

// Profile dropdown menu configuration - easily modifiable
const profileDropdownItems = [
  {
    id: "my-profile",
    label: "My Profile",
    icon: User,
    href: "/student/my-profile",
    type: "link"
  },
  {
    id: "account",
    label: "Account",
    icon: Settings,
    href: "/student/account",
    type: "link"
  },
  {
    id: "logout",
    label: "Logout",
    icon: LogOut,
    type: "button",
    action: "logout"
  }
];

export default function StudentNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: clear auth tokens, redirect to login, etc.
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const handleDropdownItemClick = (item) => {
    setIsDropdownOpen(false);
    
    if (item.type === "button" && item.action === "logout") {
      handleLogout();
    }
    // Add more button actions here as needed
  };

  const renderDropdownItem = (item) => {
    const commonClasses = "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors";
    const IconComponent = item.icon;

    if (item.type === "link") {
      return (
        <a
          key={item.id}
          href={item.href}
          className={commonClasses}
          onClick={() => setIsDropdownOpen(false)}
        >
          <IconComponent className="w-4 h-4 mr-3" />
          <span className="font-medium">{item.label}</span>
        </a>
      );
    }

    if (item.type === "button") {
      return (
        <button
          key={item.id}
          onClick={() => handleDropdownItemClick(item)}
          className={`${commonClasses} w-full text-left cursor-pointer`}
        >
          <IconComponent className="w-4 h-4 mr-3" />
          <span className="font-medium">{item.label}</span>
        </button>
      );
    }

    return null;
  };

  return (
    <nav className="w-full flex items-center justify-center bg-white border-b border-gray-200 py-3 px-35 sticky top-0 z-100">
      <div className="flex items-center space-x-3 min-w-0">
        <a href="/student" className="flex items-center">
          <Image src="/iSkolar_logo.png" alt="iSkolar Logo" width={36} height={36} />
        </a>
        <input
          type="text"
          placeholder="Search..."
          className="rounded-xl border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-40 md:w-55"
        />
      </div>
      <ul className="flex space-x-8 mx-auto">
        {studentMenu.map((item) => (
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
      <div className="flex items-center space-x-3 min-w-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex flex-col items-center cursor-pointer text-gray-700 hover:text-blue-700 transition-colors group focus:outline-none"
          >
            <div className="flex items-center">
              <User className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <ChevronDown className="w-3 h-3 ml-1 mb-1 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-normal tracking-wide">
              Profile
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {profileDropdownItems.map(renderDropdownItem)}
            </div>
          )}
        </div>
      </div>
      <div className="w-40 md:w-64" />
    </nav>
  );
}