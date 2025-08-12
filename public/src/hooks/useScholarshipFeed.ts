import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  scholarshipFeedService, 
  ScholarshipFeedItem, 
  ScholarshipFilters,
  ScholarshipFeedResponse 
} from '@/services/scholarshipFeedService';

interface UseScholarshipFeedReturn {
  // Data
  scholarships: ScholarshipFeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // State
  loading: boolean;
  error: string | null;
  filters: ScholarshipFilters;
  
  // Actions
  setFilters: (filters: ScholarshipFilters) => void;
  refreshData: () => void;
  changePage: (page: number) => void;
  clearError: () => void;
  
  // Computed values
  totalSlots: number;
  totalValue: number;
  urgentCount: number;
  hasActiveFilters: boolean;
}

export const useScholarshipFeed = (initialFilters?: Partial<ScholarshipFilters>): UseScholarshipFeedReturn => {
  const [scholarships, setScholarships] = useState<ScholarshipFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFiltersState] = useState<ScholarshipFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  // Fetch scholarships function
  const fetchScholarships = useCallback(async (currentFilters: ScholarshipFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ScholarshipFeedResponse = await scholarshipFeedService.getScholarshipFeed(currentFilters);
      
      setScholarships(response.data.scholarships);
      setPagination(response.data.pagination);
      
    } catch (err: any) {
      console.error('Error fetching scholarships:', err);
      setError(err.message || 'Failed to load scholarships');
      
      // Only clear scholarships if it's the first load
      if (scholarships.length === 0) {
        setScholarships([]);
      }
    } finally {
      setLoading(false);
    }
  }, [scholarships.length]);

  // Effect to fetch data when filters change
  useEffect(() => {
    fetchScholarships(filters);
  }, [filters, fetchScholarships]);

  // Actions
  const setFilters = useCallback((newFilters: ScholarshipFilters) => {
    setFiltersState(newFilters);
  }, []);

  const refreshData = useCallback(() => {
    fetchScholarships(filters);
  }, [fetchScholarships, filters]);

  const changePage = useCallback((page: number) => {
    setFilters({
      ...filters,
      page,
    });
  }, [filters, setFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const computedValues = useMemo(() => {
    const totalSlots = scholarships.reduce((sum, s) => sum + s.totalScholars, 0);
    const totalValue = scholarships.reduce((sum, s) => sum + s.totalAmount, 0);
    const urgentCount = scholarships.filter(s => s.daysRemaining <= 30).length;
    
    const hasActiveFilters = !!(
      filters.search ||
      (filters.scholarshipType && filters.scholarshipType !== 'all') ||
      (filters.purpose && filters.purpose !== 'all') ||
      filters.school
    );

    return {
      totalSlots,
      totalValue,
      urgentCount,
      hasActiveFilters,
    };
  }, [scholarships, filters]);

  return {
    // Data
    scholarships,
    pagination,
    
    // State
    loading,
    error,
    filters,
    
    // Actions
    setFilters,
    refreshData,
    changePage,
    clearError,
    
    // Computed values
    ...computedValues,
  };
};