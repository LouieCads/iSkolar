"use client";

import React, { useEffect, useState } from "react";
import { getPlatformDetails } from "@/lib/getPlatformDetails";

// Type definitions
interface LinkItem {
  href: string;
  label: string;
}

interface SocialLink {
  href: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface LinkListProps {
  title: string;
  links: LinkItem[];
}

export default function Footer(): React.JSX.Element {
  const currentYear: number = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/iskolarph",
    twitter: "https://twitter.com/iskolarph",
    instagram: "https://instagram.com/iskolarph",
    linkedin: "https://linkedin.com/company/iskolarph",
  });

  useEffect(() => {
    getPlatformDetails().then((data) => {
      setSocialLinks({
        facebook: data.facebook || "https://facebook.com/iskolarph",
        twitter: data.twitter || "https://twitter.com/iskolarph",
        instagram: data.instagram || "https://instagram.com/iskolarph",
        linkedin: data.linkedin || "https://linkedin.com/company/iskolarph",
      });
    });
  }, []);

  // Navigation Links Data
  const navigationLinks: LinkItem[] = [
    { href: "#", label: "Home" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#benefits", label: "Benefits" },
    { href: "#sponsors", label: "Sponsor" },
    { href: "#faq", label: "FAQs" },
  ];

  // Students Links Data
  const studentLinks: LinkItem[] = [
    { href: "#", label: "Upload Credentials" },
    { href: "#", label: "Student Dashboard" },
    { href: "#", label: "Scholarship Guide" },
    { href: "#", label: "Resource Center" },
  ];

  // Sponsors Links Data
  const sponsorLinks: LinkItem[] = [
    { href: "#", label: "Create Scholarship" },
    { href: "#", label: "Corporate Partnerships" },
    { href: "#", label: "Impact Reports" },
    { href: "#", label: "Sponsor Dashboard" },
  ];

  // Social Media Links Data
  const socialLinkData: SocialLink[] = [
    {
      href: socialLinks.facebook,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      bgColor: "bg-[#0054a6] hover:bg-[#0061c2]",
    },
    {
      href: socialLinks.twitter,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-twitter-x"
          viewBox="0 0 16 16"
        >
          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
        </svg>
      ),
      bgColor: "bg-[#0054a6] hover:bg-[#0061c2]",
    },
    {
      href: socialLinks.instagram,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21.743 4.18a1 1 0 00-1.401-1.106L2.994 10.166a1 1 0 00.118 1.852l4.835 1.856 2.014 5.483a1 1 0 001.766.2l2.762-3.504 4.293 3.169a1 1 0 001.587-.647l1.364-13.394z"
          />
        </svg>
      ),
      bgColor: "bg-[#0054a6] hover:bg-[#0061c2]",
    },
    {
      href: socialLinks.linkedin,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      bgColor: "bg-[#0054a6] hover:bg-[#0061c2]",
    },
  ];

  // Policy Links Data
  const policyLinks: LinkItem[] = [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Contact Us" },
  ];

  // Reusable Link List Component
  const LinkList: React.FC<LinkListProps> = ({ title, links }) => (
    <div className="text-center md:text-left">
      <h4 className="text-[#fbbf24] text-base sm:text-lg font-semibold mb-3 sm:mb-4">
        {title}
      </h4>
      <ul className="space-y-2 sm:space-y-3">
        {links.map((link: LinkItem, index: number) => (
          <li key={index}>
            <a
              href={link.href}
              className="text-[#e0f0ff] hover:text-white transition-colors text-sm sm:text-base"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-[#004080] text-white py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10 md:mb-12">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="font-bold text-xl sm:text-2xl">
                i<span className="text-[#fbbf24]">Skolar</span>
              </span>
            </div>
            <p className="text-[#e0f0ff] text-sm sm:text-base mb-4 sm:mb-6 mx-auto md:mx-0 max-w-xs">
              Empowering Filipino students with blockchain technology to achieve their educational dreams through transparent scholarship distribution.
            </p>
            <div className="flex justify-center md:justify-start gap-3 sm:gap-4">
              {socialLinkData.map((social: SocialLink, index: number) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${social.bgColor} flex items-center justify-center transition-colors`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation, Students, Sponsors Sections */}
          <LinkList title="Navigation" links={navigationLinks} />
          <LinkList title="Students" links={studentLinks} />
          <LinkList title="Sponsors" links={sponsorLinks} />
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-[#0054a6] flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <div className="text-[#7cc8ff] text-sm sm:text-base">
            © {currentYear} iSkolar. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {policyLinks.map((link: LinkItem, index: number) => (
              <a
                key={index}
                href={link.href}
                className="text-[#7cc8ff] hover:text-white transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}