"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
}

export default function Header(): React.JSX.Element {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navLinks: NavLink[] = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Benefits", href: "#benefits" },
    { name: "Sponsors", href: "#sponsors" },
    { name: "FAQ", href: "#faq" },
  ];

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-2 sm:px-8 md:px-32 lg:px-36 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-md py-3 border-b border-gray-100"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/iSkolar_logo.png"
            alt="iSkolar Logo"
            width={35}
            height={25}
            className="w-7 h-9 sm:w-13 sm:h-15"
            priority
          />
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex flex-grow justify-center">
          <div className="flex items-center sm:space-x-3 md:space-x-9">
            {navLinks.map((link: NavLink) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-[#0054a6] hover:text-[#0077e6] text-sm md:text-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Desktop Get Started Button */}
        <div className="hidden md:block">
          <Link href="/auth">
            <Button 
              className="bg-transparent text-[#efa508] hover:text-white font-semibold px-6 py-2 rounded-lg border-2 border-[#efa508] hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-blue-900 p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu - Centered Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <div className="container mx-auto px-4 space-y-4">
            <nav className="flex flex-col items-center gap-4">
              {navLinks.map((link: NavLink) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#0054a6] hover:text-[#0077e6] font-medium transition-colors text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {/* Mobile Get Started Button */}
              <Button 
                className="bg-transparent hover:bg-gradient-to-r hover:from-[#f59e0b] hover:to-[#fbbf24] text-[#0054a6] hover:text-white font-semibold px-6 py-2 rounded-lg border-2 border-[#0054a6] hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer mt-2"
              >
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}