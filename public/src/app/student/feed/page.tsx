"use client";

import { ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import ScholarshipFeedCard from "@/components/ScholarshipFeedCard";
import ScholarshipFeedFilters from "@/components/ScholarshipFeedFilters";
import { useScholarshipFeed } from "@/hooks/useScholarshipFeed";

export default function StudentFeedPage() {
  const {
    scholarships,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    changePage,
    totalSlots,
    totalValue,
    urgentCount,
    hasActiveFilters,
  } = useScholarshipFeed();

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ 
      page: 1, 
      limit: filters.limit || 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  // Loading state
  if (loading && scholarships.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading scholarships...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && scholarships.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Scholarships
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Filters (3 columns) */}
          <div className="col-span-3">
            <div className="sticky top-23">
              <ScholarshipFeedFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalCount={pagination.total}
                vertical={true}
              />
            </div>
          </div>

          {/* Main Content - Scholarship Cards (6 columns) */}
          <div className="col-span-6">
            {/* Error Banner */}
            {error && scholarships.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                  <button
                    onClick={refreshData}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Loading overlay for filter changes */}
            {loading && scholarships.length > 0 && (
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Updating results...</span>
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {scholarships.length === 0 && !loading ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.548-1.146l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Scholarships Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "There are no active scholarships available at the moment."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Scholarship Grid */}
                <div className="space-y-6 mb-8 flex flex-col items-center">
                  {scholarships.map((scholarship) => (
                    <ScholarshipFeedCard
                      key={scholarship.id}
                      scholarship={scholarship}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
                    <div className="text-sm text-gray-700">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => changePage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                pageNum === pagination.page
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar - Quick Stats & Info (3 columns) */}
          <div className="col-span-3">
            <div className="sticky top-23 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {pagination.total}
                    </div>
                    <div className="text-xs text-gray-600">Active Scholarships</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {totalSlots}
                    </div>
                    <div className="text-xs text-gray-600">Total Slots Available</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                        notation: "compact",
                      }).format(totalValue)}
                    </div>
                    <div className="text-xs text-gray-600">Total Value</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {urgentCount}
                    </div>
                    <div className="text-xs text-gray-600">Ending Soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}