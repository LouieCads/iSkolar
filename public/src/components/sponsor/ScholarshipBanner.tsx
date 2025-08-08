import { Calendar, MapPin, Users, DollarSign, Award, GraduationCap, Clock } from "lucide-react";
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

  // Image source
  const imageUrl =
    scholarship?.imageUrl || scholarship?.bannerImage || scholarship?.image ||
    `https://via.placeholder.com/96x96.png?text=${encodeURIComponent(
      (bannerData.selectedSchool || "School").split(" ")[0].slice(0, 2)
    )}`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r h-[8rem] rounded-md from-blue-600 to-blue-700 text-white">
        <div className="flex items-start h-full pr-5 justify-between">
          {/* Left: image + title & school */}
          <div className="flex items-center h-full gap-3 min-w-0">
            {/* Square image */}
            <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-white/10 relative">
              <Image
                src="/bg.jpg"
                alt={`${bannerData.selectedSchool} banner`}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
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
        {/* Description */}
        <p className="text-gray-600 text-xs mb-4 mt-2 line-clamp-3">
          {bannerData.description}
        </p>

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600 font-medium">Amount</span>
            </div>
            <p className="text-green-800 font-bold text-sm">
              {formatAmount(bannerData.amountPerScholar)}
            </p>
            <p className="text-green-600 text-xs">per scholar</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <Users className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-xs text-blue-600 font-medium">Slots</span>
            </div>
            <p className="text-blue-800 font-bold text-sm">
              {bannerData.totalScholars}
            </p>
            <p className="text-blue-600 text-xs">available</p>
          </div>
        </div>

        {/* Criteria Tags */}
        {bannerData.criteriaTags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Criteria
            </h4>
            <div className="flex flex-wrap gap-1">
              {bannerData.criteriaTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {bannerData.criteriaTags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{bannerData.criteriaTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {bannerData.requiredDocuments.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Required Documents
            </h4>
            <div className="flex flex-wrap gap-1">
              {bannerData.requiredDocuments.slice(0, 2).map((doc, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {doc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              ))}
              {bannerData.requiredDocuments.length > 2 && (
                <span className="px-2 py-1 bg-blue-50 text-blue-500 text-xs rounded-full">
                  +{bannerData.requiredDocuments.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        {/* <div className="border-t border-gray-100 pt-3 mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            
            <div className="flex items-center">
              <Award className="w-3 h-3 mr-1" />
              <span>{getSelectionModeText(bannerData.selectionMode)}</span>
            </div>
          </div>

          {!isPreview && (
            <div className="flex items-center justify-between mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bannerData.status === "active"
                    ? "bg-green-100 text-green-800"
                    : bannerData.status === "closed"
                    ? "bg-red-100 text-red-800"
                    : bannerData.status === "archived"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {bannerData.status.charAt(0).toUpperCase() + bannerData.status.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                Total: {formatAmount(bannerData.totalAmount)}
              </span>
            </div>
          )}
        </div> */}
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