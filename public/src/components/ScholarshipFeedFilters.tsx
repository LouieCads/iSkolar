import { Search, Filter, SortDesc, X } from "lucide-react";
import { useState } from "react";
import { ScholarshipFilters } from "@/services/scholarshipFeedService";

interface ScholarshipFeedFiltersProps {
  filters: ScholarshipFilters;
  onFiltersChange: (filters: ScholarshipFilters) => void;
  totalCount?: number;
  className?: string;
  vertical?: boolean;
}

export default function ScholarshipFeedFilters({
  filters,
  onFiltersChange,
  totalCount,
  className = "",
  vertical = false
}: ScholarshipFeedFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key: keyof ScholarshipFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const handleSearchChange = (value: string) => {
    // Debounce search input
    handleFilterChange('search', value);
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      (filters.scholarshipType && filters.scholarshipType !== 'all') ||
      (filters.purpose && filters.purpose !== 'all') ||
      filters.school
    );
  };

  const getActiveFiltersCount = () => {
    return [filters.search, filters.scholarshipType !== 'all' ? filters.scholarshipType : null, 
      filters.purpose !== 'all' ? filters.purpose : null, filters.school]
      .filter(Boolean).length;
  };

  if (!vertical) {
    // Original horizontal layout with smaller, cuter text
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 ${className}`}>
        {/* Search and Quick Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search for scholarships ✨"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick Sort */}
          <div className="flex items-center gap-2 text-xs">
            <SortDesc className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">✨ Newest First</option>
              <option value="createdAt-asc">🕰️ Oldest First</option>
              <option value="applicationDeadline-asc">⏰ Deadline (Soon)</option>
              <option value="applicationDeadline-desc">📅 Deadline (Later)</option>
              <option value="amountPerScholar-desc">💰 Highest Amount</option>
              <option value="amountPerScholar-asc">💵 Lowest Amount</option>
              <option value="totalScholars-desc">👥 Most Slots</option>
              <option value="totalScholars-asc">👤 Least Slots</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-base ${
              showAdvancedFilters || hasActiveFilters()
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-0.5">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Scholarship Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Type 
                </label>
                <select
                  value={filters.scholarshipType || 'all'}
                  onChange={(e) => handleFilterChange('scholarshipType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="merit_based">🏆 Merit Based</option>
                  <option value="skill_based">⚡ Skill Based</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Purpose 🎯
                </label>
                <select
                  value={filters.purpose || 'all'}
                  onChange={(e) => handleFilterChange('purpose', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Purposes</option>
                  <option value="tuition">🎓 Tuition</option>
                  <option value="allowance">💸 Allowance</option>
                </select>
              </div>

              {/* School */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  School 🏫
                </label>
                <input
                  type="text"
                  placeholder="School name..."
                  value={filters.school || ''}
                  onChange={(e) => handleFilterChange('school', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Items per page */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Show 👀
                </label>
                <select
                  value={filters.limit || 20}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters ✨
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        {totalCount !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {totalCount === 0 ? (
                "No scholarships found 🥺"
              ) : (
                <>
                  Showing {totalCount} scholarship{totalCount !== 1 ? 's' : ''}
                  {hasActiveFilters() && " matching your filters"} ✨
                </>
              )}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Vertical layout for sidebar with smaller, cuter text
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            Filters 
          </h3>
          {/* {hasActiveFilters() && (
            <div className="mt-1.5">
              <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </span>
            </div>
          )} */}
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="p-3 border-b border-gray-200">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Sort By 
        </label>
        <div className="relative">
          <SortDesc className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <select
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="applicationDeadline-asc">Deadline (Soon)</option>
            <option value="applicationDeadline-desc">Deadline (Later)</option>
            <option value="amountPerScholar-desc">Highest Amount</option>
            <option value="amountPerScholar-asc">Lowest Amount</option>
            <option value="totalScholars-desc">Most Slots</option>
            <option value="totalScholars-asc">Least Slots</option>
          </select>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-3 space-y-3">
        {/* Scholarship Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Scholarship Type
          </label>
          <select
            value={filters.scholarshipType || 'all'}
            onChange={(e) => handleFilterChange('scholarshipType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="merit_based">Merit Based</option>
            <option value="skill_based">Skill Based</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Purpose
          </label>
          <select
            value={filters.purpose || 'all'}
            onChange={(e) => handleFilterChange('purpose', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Purposes</option>
            <option value="tuition">Tuition</option>
            <option value="allowance">Allowance</option>
          </select>
        </div>

        {/* School */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            School
          </label>
          <input
            type="text"
            placeholder="School name..."
            value={filters.school || ''}
            onChange={(e) => handleFilterChange('school', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>  
    </div>
  );
}