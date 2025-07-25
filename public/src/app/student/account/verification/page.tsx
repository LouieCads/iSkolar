import React from 'react';

export default function Verification() {
  return (
    <div className="max-w-4xl mx-auto p-6 pl-35">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8 border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-900 mb-3">Welcome to iSkolar</h1>
        
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-700">
            Complete your verification to unlock these benefits:
          </p>
          <button className="bg-amber-500 hover:bg-amber-600 text-white text-bold text-sm py-1.5 px-3 rounded transition-colors duration-200 whitespace-nowrap ml-3 flex items-center">
            Get Verified Now
            <svg 
              className="w-4 h-4 ml-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">✓</span>
            <p className="text-sm text-gray-600">Access to Merit & Skill-based scholarships</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">✓</span>
            <p className="text-sm text-gray-600">Direct tuition payment to your school</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">✓</span>
            <p className="text-sm text-gray-600">Easy scholarship application process</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-lg">✓</span>
            <p className="text-sm text-gray-600">Track your applications in real-time</p>
          </div>
        </div>
      </div>

      {/* Add your verification form/content here */}
    </div>
  );
}