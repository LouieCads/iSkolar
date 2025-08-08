"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
// import CreateScholarshipPopup from "@/components/sponsor/CreateScholarshipPopup";
import ScholarshipBanner from "@/components/sponsor/ScholarshipBanner";

export default function Feed() {
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [scholarships, setScholarships] = useState([]);

  // Fetch scholarships for feed (mock for now)
  useEffect(() => {
    // In real implementation, fetch from API
    const mockScholarships = [
      {
        _id: "1",
        title: "Academic Excellence Scholarship",
        description:
          "Supporting outstanding students with exceptional academic performance in engineering and technology fields.",
        scholarshipType: "merit_based",
        purpose: "tuition",
        totalScholars: 5,
        amountPerScholar: 25000,
        totalAmount: 125000,
        selectedSchool: "University of the Philippines",
        selectionMode: "auto",
        applicationDeadline: "2024-12-31",
        criteriaTags: ["Engineering", "GPA >= 3.5", "3rd Year"],
        requiredDocuments: ["academic_records", "certificates"],
        status: "active",
        createdAt: "2024-11-15T00:00:00.000Z",
        sponsorName: "ABC Foundation",
      },
      {
        _id: "2",
        title: "Skills Development Grant",
        description:
          "Empowering students with technical skills and certifications in computer science and information technology.",
        scholarshipType: "skill_based",
        purpose: "allowance",
        totalScholars: 3,
        amountPerScholar: 15000,
        totalAmount: 45000,
        selectedSchool: "Ateneo de Manila University",
        selectionMode: "manual",
        applicationDeadline: "2024-11-30",
        criteriaTags: ["Computer Science", "Programming", "Certification"],
        requiredDocuments: ["certificates", "awards", "essay"],
        status: "active",
        createdAt: "2024-11-10T00:00:00.000Z",
        sponsorName: "Tech Skills Fund",
      },
    ];
    setScholarships(mockScholarships);
  }, []);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Create Post Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="flex-1">
            <button
              onClick={() => setIsCreatePopupOpen(true)}
              className="w-full text-left px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 text-gray-600"
            >
              Start a scholarship post...
            </button>
          </div>
          <button
            onClick={() => setIsCreatePopupOpen(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Post
          </button>
        </div>

        {/* Feed Scholarships */}
        <div className="space-y-6">
          {scholarships.length > 0 ? (
            scholarships.map((scholarship) => (
              <div
                key={scholarship._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {scholarship.sponsorName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Posted on{" "}
                      {new Date(scholarship.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Scholarship Banner */}
                <ScholarshipBanner scholarship={scholarship} isPreview={false} />

                {/* Metadata */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {scholarship.selectedSchool}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    Deadline:{" "}
                    {new Date(
                      scholarship.applicationDeadline
                    ).toLocaleDateString()}
                  </span>
                  {scholarship.criteriaTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              No scholarships available right now.
            </p>
          )}
        </div>
      </div>

      {/* // Popup
      <CreateScholarshipPopup
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
      /> */}
    </>
  );
}
