"use client";

import React, { useState, useEffect, useRef } from "react";
import { Book, GraduationCap, Coins, ShieldCheck, Eye, Gift } from "lucide-react";

const Benefits: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="benefits"
      className="section bg-gradient-to-br from-[#f0f7ff] to-white px-4 sm:px-15 md:px-38 py-12 sm:py-16 md:py-35"
      ref={sectionRef}
    >
      <div className="container mx-auto">
        {/* Students Section */}
        <div
          className={`text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16 transition-all duration-1500 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-40"
          }`}
        >
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0054a6] to-[#0077e6] text-transparent bg-clip-text">
            Benefits for <span className="text-[#fbbf24]">Students</span>
          </h2>
          <p className="text-base sm:text-lg text-[#0054a6]/70 px-2">
              Connect directly with sponsors and access transparent scholarship opportunities. Freely upload your academic credentials to your profile for sponsors and schools to view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Apply to Scholarships */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Apply to Scholarship Banners
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Scholarships that match your profile find you, but you can also browse and apply to scholarships posted by sponsors based on your academic credentials.
            </p>
          </div>

          {/* Upload Credentials */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <Book className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Upload Academic Credentials
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Upload your academic documents, certificates, and achievements to your profile. Sponsors can review your credentials directly.
            </p>
          </div>

          {/* Direct Funding */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Direct Tuition Payment
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Receive scholarship funds directly to your school for tuition, ensuring transparent and secure payment.
            </p>
          </div>
        </div>

        {/* Sponsors Section */}
        <div
          className={`text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16 mt-12 sm:mt-16 md:mt-20 transition-all duration-1500 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-40"
          }`}
        >
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0054a6] to-[#0077e6] text-transparent bg-clip-text">
            Benefits for <span className="text-[#fbbf24]">Sponsors</span>
          </h2>
          <p className="text-base sm:text-lg text-[#0054a6]/70 px-2">
            Support students with transparent and impactful contributions through blockchain-verified processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Create Scholarship Banners */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Create Scholarship Banners
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Post scholarships with specific criteria and requirements for students to apply.
            </p>
          </div>

          {/* Transparent Process */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Transparent Selection Process
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Choose between selections: auto (school selects) or manual (sponsor selects) for scholarship recipients.
            </p>
          </div>

          {/* Direct School Payment */}
          <div
            className={`group p-4 sm:p-6 rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg text-center transition-opacity transition-transform duration-900 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-45"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e0f0ff] flex items-center justify-center group-hover:bg-[#bae1ff] transition-colors">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-[#0077e6]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#0054a6]">
              Direct School Payment
            </h3>
            <p className="text-sm sm:text-base text-[#0061c2]/80">
              Send funds directly to schools via crypto or fiat payment methods with automatic confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;