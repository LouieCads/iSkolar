"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Hero(): React.JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features: string[] = [
    "Direct connection between students and sponsors",
    "Transparent scholarship distribution via blockchain",
    "Upload academic credentials to your profile",
    "Secure tuition payment directly to schools"
  ];

  return (
    <section className="relative pt-21 pb-16 sm:pt-25 sm:pb-24 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-br from-[#f0f7ff] to-white">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 bg-[#fff4cc] rounded-full opacity-60 blur-3xl"></div>
        <div className="absolute top-1/2 -left-16 w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 bg-[#d6eaff] rounded-full opacity-60 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-2 sm:px-6 relative z-10">
        <div 
          className={`max-w-3xl mx-auto text-center mb-10 sm:mb-12 opacity-0 transform -translate-y-16 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : ""
          }`}
        >
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#0054a6] to-[#0077e6] text-transparent bg-clip-text">
              Empowering Filipino Students
            </span>{" "}
            <span className="text-[#0077e6] font-bold">with</span>{" "}
            <span className="bg-gradient-to-r from-[#fc4a1a] to-[#f7b733] text-transparent bg-clip-text font-bold">
              Web3
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#1e3a8a]/80 mb-6 sm:mb-8">
            iSkolar connects Filipino students with sponsors through transparent blockchain-powered scholarships.
          </p>
          <div className="mb-2 sm:mb-4 flex flex-col items-center">
            <span className="font-bold text-xl sm:text-2xl tracking-wide text-center bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-transparent bg-clip-text animate-pulse">
              Scholarships find you so you don’t have to
            </span>
            {/* <span className="mt-4 text-[#1e3a8a]/80 font-semibold text-sm sm:text-base tracking-wide">
              Built for students, built by students
            </span> */}
          </div>
        </div>

        {/* Hero image/illustration with staggered animation delay */}
        <div 
          className={`relative max-w-4xl mx-auto opacity-0 transform -translate-y-20 transition-all duration-1200 ease-out delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : ""
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#dbeafe] p-2">
            <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#fde68a] rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#fde68a] rounded-full blur-3xl opacity-20"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8 relative">
                <div className="flex flex-col justify-center">
                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
                    Transparent Scholarship Platform
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-[#e0f2fe]">
                    {features.map((item: string, index: number) => (
                      <li 
                        key={index} 
                        className={`flex items-center gap-2 sm:gap-3 opacity-0 transform -translate-y-12 transition-all duration-700 ease-out ${
                          isVisible ? "opacity-100 translate-y-0" : ""
                        }`} 
                        style={{ transitionDelay: `${500 + index * 150}ms` }}
                      >
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#facc15] rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">✓</span>
                        </div>
                        <span className="text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-center">
                  <div 
                    className={`relative w-full max-w-xs sm:max-w-sm opacity-0 transform -translate-y-16 transition-all duration-1200 ease-out delay-700 ${
                      isVisible ? "opacity-100 translate-y-0" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl transform -rotate-6"></div>
                    <div className="bg-white rounded-2xl p-4 sm:p-5 md:p-6 transform rotate-3 relative z-10">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div>
                          <h4 className="text-[#1e3a8a] font-bold text-base sm:text-lg">
                            iSkolar
                          </h4>
                          <p className="text-xs text-gray-500">
                            ID: #IS2025-1458
                          </p>
                        </div>
                        <div className="p-2 bg-[#fef3c7] rounded-md">
                          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#facc15]" />
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Student</p>
                          <p className="font-medium text-sm sm:text-base">Maria Santos</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">School</p>
                          <p className="font-medium text-sm sm:text-base">
                            University of the Philippines
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Achievement</p>
                          <p className="font-medium text-sm sm:text-base">Dean's Lister, 2025</p>
                        </div>
                      </div>
                      <div className="bg-[#e0f2fe] p-2 rounded text-xs sm:text-sm text-center text-[#1d4ed8]">
                        Academic Credentials Uploaded
                      </div>
                      <div className="mt-3">
                        <Button 
                          className="w-full bg-[#1e3a8a] text-white text-xs sm:text-sm opacity-60 cursor-not-allowed"
                          disabled
                        >
                          Apply for Scholarships
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>  
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}