import React, { useState } from "react";
import { Calendar, MapPin, Users, DollarSign, X, Building, Clock } from "lucide-react";

export default function ScholarshipCard({ scholarship }) {
  const [showModal, setShowModal] = useState(false);

  // Early return if no scholarship data
  if (!scholarship) {
    return null;
  }

  // Format amount to PHP currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get type badge color with glass-like effect
  const getTypeBadgeColor = (type) => {
    const baseClasses = "px-1 py-0.5 rounded-full text-[8px] font-medium bg-white/10 backdrop-blur-sm text-gray-200";
    switch (type) {
      case "merit_based":
        return `${baseClasses} border border-blue-300/30`;
      case "skill_based":
        return `${baseClasses} border border-green-300/30`;
      default:
        return `${baseClasses} border border-gray-300/30`;
    }
  };

  // Get purpose badge color with glass-like effect
  const getPurposeBadgeColor = (purpose) => {
    const baseClasses = "px-1 py-0.5 rounded-full text-[8px] font-medium bg-white/10 backdrop-blur-sm text-gray-200";
    switch (purpose) {
      case "tuition":
        return `${baseClasses} border border-purple-300/30`;
      case "allowance":
        return `${baseClasses} border border-orange-300/30`;
      default:
        return `${baseClasses} border border-gray-300/30`;
    }
  };

  // Get urgency color based on days remaining
  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 7) return "text-red-500";
    if (daysRemaining <= 30) return "text-yellow-500";
    return "text-green-500";
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Check if there's an uploaded image
  const hasUploadedImage = scholarship?.bannerUrl;
  
  const getImageSource = () => {
    if (scholarship?.bannerUrl) return scholarship.bannerUrl;
    return null;
  };

  const imageSource = getImageSource();

  return (
    <>
      {/* Scholarship Card - Fixed width */}
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] hover:translate-y-[-2px]"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="bg-gradient-to-r h-[8rem] rounded-md from-blue-600 to-blue-700 text-white">
          <div className="flex items-start h-full pr-5 justify-between">
            {/* Left: image + title & school */}
            <div className="flex items-center h-full gap-3 min-w-0 flex-1">
              {/* Square image */}
              <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-white/10 relative">
                {hasUploadedImage ? (
                  <img
                    src={imageSource}
                    alt={`${scholarship.selectedSchool} banner`}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-md">
                    <Building className="w-8 h-8 text-white/70" />
                  </div>
                )}
              </div>

              {/* Title and school stacked */}
              <div className="min-w-0 h-full flex flex-col justify-around flex-1">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold leading-tight truncate">
                    {scholarship.title}
                  </h3>
                  <div className="flex gap-1 items-end">
                    <span className={getTypeBadgeColor(scholarship.scholarshipType)}>
                      {scholarship.scholarshipType?.replace('_', ' ')}
                    </span>
                    <span className={getPurposeBadgeColor(scholarship.purpose)}>
                      {scholarship.purpose?.charAt(0).toUpperCase() + scholarship.purpose?.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center text-blue-100 text-[10px] font-medium">
                    <Calendar className="w-3 h-3 mr-1"/>
                    <span>{formatDate(scholarship.applicationDeadline)}</span>
                  </div>
                  <div className="flex items-center text-blue-100 text-[10px] font-medium truncate">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{scholarship.selectedSchool}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Days remaining indicator */}
            <div className="flex-shrink-0 text-right mt-2">
              <div className="bg-white/20 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 mx-auto mb-1" />
                <div className="text-[10px] font-medium">
                  <span className={getUrgencyColor(scholarship.daysRemaining)}>
                    {scholarship.daysRemaining}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-1">
          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-3 mb-3 mt-2.5">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-[11px] text-green-600 font-medium">Amount</span>
              </div>
              <p className="text-green-800 font-bold text-xs">
                {formatAmount(scholarship.amountPerScholar)}
              </p>
              <p className="text-green-600 text-[11px]">per scholar</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Users className="w-3 h-3 text-blue-600 mr-1" />
                <span className="text-[11px] text-blue-600 font-medium">Slots</span>
              </div>
              <p className="text-blue-800 font-bold text-xs">
                {scholarship.totalScholars}
              </p>
              <p className="text-blue-600 text-[11px]">available</p>
            </div>
          </div>

          {/* Fixed Grid Layout for Criteria and Documents */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Criteria Tags - Left Column */}
            <div className="min-h-[60px]">
              <h4 className="text-[10.5px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Criteria
              </h4>
              {scholarship.criteriaTags?.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.criteriaTags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10.5px] rounded-full leading-tight"
                      >
                        {tag}
                      </span>
                    ))}
                    {scholarship.criteriaTags.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full leading-tight">
                        +{scholarship.criteriaTags.length - 2} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Required Documents - Right Column */}
            <div className="min-h-[60px]">
              <h4 className="text-[10.5px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Required Documents
              </h4>
              {scholarship.requiredDocuments?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {scholarship.requiredDocuments.slice(0, 2).map((doc, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10.5px] rounded-full leading-tight"
                    >
                      {doc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  ))}
                  {scholarship.requiredDocuments.length > 2 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full leading-tight">
                      +{scholarship.requiredDocuments.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                    {hasUploadedImage ? (
                      <img
                        src={imageSource}
                        alt={`${scholarship.selectedSchool} banner`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/20">
                        <Building className="w-6 h-6 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">{scholarship.title}</h2>
                    <div className="flex gap-2 mb-2">
                      <span className={getTypeBadgeColor(scholarship.scholarshipType)}>
                        {scholarship.scholarshipType?.replace('_', ' ')}
                      </span>
                      <span className={getPurposeBadgeColor(scholarship.purpose)}>
                        {scholarship.purpose?.charAt(0).toUpperCase() + scholarship.purpose?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{scholarship.description}</p>
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{scholarship.selectedSchool}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Deadline: {formatDate(scholarship.applicationDeadline)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <span className={`font-medium ${getUrgencyColor(scholarship.daysRemaining)}`}>
                        {scholarship.daysRemaining} days remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Financial Details</h3>
                  <div className="bg-green-50 p-4 rounded-lg mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">Amount per Scholar</span>
                      <span className="text-green-800 font-bold text-lg">
                        {formatAmount(scholarship.amountPerScholar)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium">Total Slots</span>
                      <span className="text-blue-800 font-bold text-lg">
                        {scholarship.totalScholars}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Criteria */}
              {scholarship.criteriaTags?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Eligibility Criteria</h3>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.criteriaTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {scholarship.requiredDocuments?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scholarship.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-blue-700 text-sm font-medium">
                          {doc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sponsor Information */}
              {scholarship.sponsor && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Sponsor</h3>
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {scholarship.sponsor.logo ? (
                        <img
                          src={scholarship.sponsor.logo}
                          alt={scholarship.sponsor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{scholarship.sponsor.name}</h4>
                      <p className="text-sm text-gray-600">Scholarship Sponsor</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Apply Now
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};