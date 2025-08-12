import { Calendar, MapPin, Users, DollarSign, X } from "lucide-react";
import Image from "next/image";

export default function ScholarshipBanner({ scholarship, isPreview = false }) {
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

  // Get selection mode text
  const getSelectionModeText = (mode) => {
    return mode === "auto" ? "School Selection" : "Sponsor Selection";
  };

  // Default values for preview
  const bannerData = {
    title: scholarship?.title || "Title",
    description: scholarship?.description || "Description",
    scholarshipType: scholarship?.scholarshipType || "Type",
    purpose: scholarship?.purpose || "Purpose",
    totalScholars: scholarship?.totalScholars || 0,
    amountPerScholar: scholarship?.amountPerScholar || 0,
    totalAmount: scholarship?.totalAmount || 0,
    selectedSchool: scholarship?.selectedSchool || "School",
    selectionMode: scholarship?.selectionMode || "Mode",
    applicationDeadline: scholarship?.applicationDeadline,
    criteriaTags: scholarship?.criteriaTags || [],
    requiredDocuments: scholarship?.requiredDocuments || [],
    status: scholarship?.status || "active",
  };

  // Check if there's an uploaded image
  const hasUploadedImage = scholarship?.imageUrl || scholarship?.bannerImagePreview || scholarship?.bannerImage || scholarship?.image;
  
  const getImageSource = () => {
    if (scholarship?.imageUrl) return scholarship.imageUrl;
    if (scholarship?.bannerImagePreview) return scholarship.bannerImagePreview;
    if (scholarship?.bannerImage) return scholarship.bannerImage;
    if (scholarship?.image) return scholarship.image;
    return null;
  };

  const imageSource = getImageSource();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r h-[8rem] rounded-md from-blue-600 to-blue-700 text-white">
        <div className="flex items-start h-full pr-5 justify-between">
          {/* Left: image + title & school */}
          <div className="flex items-center h-full gap-3 min-w-0">
            {/* Square image */}
            <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-white/10 relative">
              {hasUploadedImage ? (
                <img
                  src={imageSource}
                  alt={`${bannerData.selectedSchool} banner`}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-md">
                  <div className="text-center">
                    <div className="text-2xl font-bold flex align-center justify-center text-white mb-1">
                      <X/>
                    </div>
                    <div className="text-xs text-white/70">
                      Upload Image
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Title and school stacked */}
            <div className="min-w-0 h-full flex flex-col justify-around">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-tight truncate">
                  {bannerData.title}
                </h3>
                <div className="flex gap-1 items-end">
                  <span
                    className={getTypeBadgeColor(bannerData.scholarshipType)}
                  >
                    {bannerData.scholarshipType}
                  </span>
                  <span
                    className={getPurposeBadgeColor(bannerData.purpose)}
                  >
                    {bannerData.purpose.charAt(0).toUpperCase() + bannerData.purpose.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center text-blue-100 text-[10px] font-medium">
                  <Calendar className="w-3 h-3 mr-1"/>
                  <span>{formatDate(bannerData.applicationDeadline)}</span>
                </div>
                <div className="flex items-center text-blue-100 text-[10px] font-medium truncate">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{bannerData.selectedSchool}</span>
                </div>
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
              {formatAmount(bannerData.amountPerScholar)}
            </p>
            <p className="text-green-600 text-[11px]">per scholar</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Users className="w-3 h-3 text-blue-600 mr-1" />
              <span className="text-[11px] text-blue-600 font-medium">Slots</span>
            </div>
            <p className="text-blue-800 font-bold text-xs">
              {bannerData.totalScholars}
            </p>
            <p className="text-blue-600 text-[11px]">available</p>
          </div>
        </div>

        {/* Fixed Grid Layout for Criteria and Documents */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Criteria Tags - Left Column */}
          <div className="min-h-[60px]">
            {bannerData.criteriaTags.length > 0 && (
              <>
                <h4 className="text-[10.5px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Criteria
                </h4>
                <div className="flex flex-wrap gap-1">
                  {bannerData.criteriaTags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10.5px] rounded-full leading-tight"
                    >
                      {tag}
                    </span>
                  ))}
                  {bannerData.criteriaTags.length > 2 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full leading-tight">
                      +{bannerData.criteriaTags.length - 2} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Required Documents - Right Column */}
          <div className="min-h-[60px]">
            {bannerData.requiredDocuments.length > 0 && (
              <>
                <h4 className="text-[10.5px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Required Documents
                </h4>
                <div className="flex flex-wrap gap-1">
                  {bannerData.requiredDocuments.slice(0, 2).map((doc, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10.5px] rounded-full leading-tight"
                    >
                      {doc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  ))}
                  {bannerData.requiredDocuments.length > 2 && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] rounded-full leading-tight">
                      +{bannerData.requiredDocuments.length - 2} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Button for non-preview */}
      {!isPreview && (
        <div className="px-4 pb-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );
}