import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, DollarSign, ChevronRight, Building, Clock } from "lucide-react";

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

  // Get type badge color
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

  // Get purpose badge color
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

  // Get urgency color
  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 7) return "text-red-500";
    if (daysRemaining <= 30) return "text-yellow-500";
    return "text-green-500";
  };

  const handleCardClick = () => {
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle escape key and cleanup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Image source logic
  const hasUploadedImage = scholarship?.bannerUrl;
  const getImageSource = () => {
    if (scholarship?.bannerUrl) return scholarship.bannerUrl;
    return null;
  };
  const imageSource = getImageSource();

  // Modal Header Component
  const ModalHeader = () => (
    <div className="flex items-center p-3 border-b border-gray-200 flex-shrink-0">
      <button
        onClick={handleCloseModal}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors mr-2"
      >
        <ChevronRight className="w-4 h-4 cursor-pointer text-gray-600" />
      </button>
      <h2 className="text-base font-semibold text-gray-900 truncate">
        Scholarship Details
      </h2>
    </div>
  );

  // Modal Content Component
  const ModalContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
      {/* Centered Square Banner Image */}
      <div className="w-65 h-65 mx-auto rounded-lg overflow-hidden relative mt-2">
        {hasUploadedImage ? (
          <img
            src="/placeholder.jpg"
            alt={`${scholarship.selectedSchool} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building className="w-12 h-12 text-gray-500" />
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-3">
        {/* Title and Badges */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{scholarship.title}</h3>
          <div className="flex gap-1.5 mb-2">
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              {scholarship.scholarshipType?.replace('_', ' ')}
            </span>
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
              {scholarship.purpose?.charAt(0).toUpperCase() + scholarship.purpose?.slice(1)}
            </span>
          </div>
        </div>

        {/* Key Information */}
        <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span>{scholarship.selectedSchool}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span>Deadline: {formatDate(scholarship.applicationDeadline)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span className={`font-medium ${getUrgencyColor(scholarship.daysRemaining)}`}>
              {scholarship.daysRemaining} days remaining
            </span>
          </div>
        </div>

        {/* Financial Details */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-1.5">Financial Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="flex items-center mb-0.5">
                <DollarSign className="w-3.5 h-3.5 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">Amount</span>
              </div>
              <p className="text-green-800 font-bold text-sm">
                {formatAmount(scholarship.amountPerScholar)}
              </p>
              <p className="text-green-600 text-sm">per scholar</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="flex items-center mb-0.5">
                <Users className="w-3.5 h-3.5 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Slots</span>
              </div>
              <p className="text-blue-800 font-bold text-sm">
                {scholarship.totalScholars}
              </p>
              <p className="text-blue-600 text-sm">available</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-1.5">Description</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{scholarship.description}</p>
        </div>

        {/* Criteria */}
        {scholarship.criteriaTags?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Eligibility Criteria</h4>
            <div className="flex flex-wrap gap-1">
              {scholarship.criteriaTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {scholarship.requiredDocuments?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Required Documents</h4>
            <div className="space-y-1">
              {scholarship.requiredDocuments.map((doc, index) => (
                <div key={index} className="flex items-center p-1.5 bg-blue-50 rounded-lg">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 flex-shrink-0"></div>
                  <span className="text-blue-700 text-xs font-medium">
                    {doc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sponsor Information */}
        {scholarship.sponsor && (
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-1.5">Sponsor</h4>
            <div className="flex items-center p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                {scholarship.sponsor.logo ? (
                  <img
                    src={scholarship.sponsor.logo}
                    alt={scholarship.sponsor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Building className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div>
                <h5 className="font-medium text-gray-900 text-sm">{scholarship.sponsor.name}</h5>
                <p className="text-[10px] text-gray-600">Scholarship Sponsor</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Modal Footer Component
  const ModalFooter = () => (
    <div className="p-3 border-t border-gray-200 flex-shrink-0">
      <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-xs">
        Apply Now
      </button>
    </div>
  );

  return (
    <>
      {/* Scholarship Card */}
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] hover:translate-y-[-2px]"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="bg-gradient-to-r h-[8rem] rounded-md from-blue-600 to-blue-700 text-white">
          <div className="flex items-start h-full pr-5 justify-between">
            <div className="flex items-center h-full gap-3 min-w-0 flex-1">
              <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-white/10 relative">
                {hasUploadedImage ? (
                  <img
                    src="/placeholder.jpg"
                    alt={`${scholarship.selectedSchool} banner`}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-md">
                    <Building className="w-8 h-8 text-white/70" />
                  </div>
                )}
              </div>
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
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(scholarship.applicationDeadline)}</span>
                  </div>
                  <div className="flex items-center text-blue-100 text-[10px] font-medium truncate">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{scholarship.selectedSchool}</span>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="min-h-[60px]">
              <h4 className="text-[10.5px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Criteria
              </h4>
              {scholarship.criteriaTags?.length > 0 && (
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
              )}
            </div>
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

      {/* Right-Side Sliding Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex h-full  items-center justify-end"
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-1.5rem)] flex flex-col mr-3"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader />
              <ModalContent />
              <ModalFooter />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}