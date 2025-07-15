"use client";

import React, { useState, useEffect, useRef } from "react";
import { Award } from "lucide-react";

export default function Sponsors(): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.2,
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
      id="sponsors"
      className="section overflow-x-hidden bg-gradient-to-br from-[#004080] to-[#0054a6] text-white"
      ref={sectionRef}
    >
      <div className="container mx-auto px-2 sm:px-15 md:px-38 py-10 sm:py-16 md:py-25">
        <div
          className={`text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-40"
          }`}
          style={{ willChange: "opacity, transform" }}
        >
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-[#fbbf24]">
            Become a Sponsor
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#e0f0ff]">
            Join our community of sponsors empowering Filipino students through transparent scholarship distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-30"
            }`}
            style={{ transitionDelay: "200ms", willChange: "opacity, transform" }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#fbbf24]">
              Why Sponsor Students?
            </h3>
            <ul className="space-y-4 mb-6 sm:mb-8">
              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#fbbf24]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-[#fef3c7]">
                    Create Scholarship Banners
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-[#e0f0ff]">
                    Post merit-based or skill-based scholarships with specific criteria for students to apply. Review student-uploaded credentials directly—no school verification required.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#fbbf24]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-[#fef3c7]">
                    Transparent Selection Process
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-[#e0f0ff]">
                    Choose between auto-selection (school selects) or manual selection (sponsor selects) for recipients.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f59e0b]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#fbbf24]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-[#fef3c7]">
                    Direct School Payment
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-[#e0f0ff]">
                    Send funds directly to schools via crypto or fiat payment methods with automatic confirmation.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div
            className={`bg-white rounded-2xl p-4 sm:p-6 md:p-8 text-[#0054a6] transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-30"
            }`}
            style={{ transitionDelay: "350ms", willChange: "opacity, transform" }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 heading-gradient">
              Sponsor Options
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="border border-[#e0f0ff] rounded-xl p-4 sm:p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h4 className="font-bold text-base sm:text-lg">Individual Sponsor</h4>
                  <div className="px-2 sm:px-3 py-1 bg-[#fef3c7] text-[#b45309] text-xs sm:text-sm rounded-full">
                    Personal
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-[#0061c2]/80 mb-3 sm:mb-4">
                  Create scholarship banners as an individual sponsor to support Filipino students in need.
                </p>
              </div>
              <div className="border border-[#e0f0ff] rounded-xl p-4 sm:p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h4 className="font-bold text-base sm:text-lg">Corporate Sponsor</h4>
                  <div className="px-2 sm:px-3 py-1 bg-[#fef3c7] text-[#b45309] text-xs sm:text-sm rounded-full">
                    Business
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-[#0061c2]/80 mb-3 sm:mb-4">
                  Establish corporate scholarship programs with branded banners and multiple student support.
                </p>
              </div>
              {/* <div className="border border-[#e0f0ff] rounded-xl p-4 sm:p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h4 className="font-bold text-base sm:text-lg">School Partnership</h4>
                  <div className="px-2 sm:px-3 py-1 bg-[#fef3c7] text-[#b45309] text-xs sm:text-sm rounded-full">
                    Institution
                  </div>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-[#0061c2]/80 mb-3 sm:mb-4">
                  Partner with schools to verify student credentials and manage scholarship selection processes.
                </p>
                <Button
                  variant="default"
                  onClick={() => setIsDialogOpen(true)}
                  size="sm"
                  className="w-full sm:w-auto !bg-[#fbbf24] !hover:bg-[#f59e0b] !text-white border-none"
                >
                  Partner With Schools
                </Button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}