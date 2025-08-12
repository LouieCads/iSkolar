import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add authorization header to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types for scholarship feed
// export interface ScholarshipSponsor {
//   id: string;
//   name: string;
//   logo?: string;
//   contactInfo?: any;
//   website?: string;
// }

export interface ScholarshipFeedItem {
  id: string;
  bannerUrl: string;
  title: string;
  description: string;
  scholarshipType: 'merit_based' | 'skill_based';
  purpose: 'tuition' | 'allowance';
  selectionMode: 'auto' | 'manual';
  totalScholars: number;
  amountPerScholar: number;
  totalAmount: number;
  selectedSchool: string;
  applicationDeadline: string;
  criteriaTags: string[];
  requiredDocuments: string[];
  applicationCount: number;
  availableSlots: number;
  sponsor: /* ScholarshipSponsor || */ null;
  createdAt: string;
  daysRemaining: number;
}

export interface ScholarshipFeedResponse {
  success: boolean;
  data: {
    scholarships: ScholarshipFeedItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      scholarshipType?: string;
      purpose?: string;
      search?: string;
      school?: string;
      sortBy?: string;
      sortOrder?: string;
    };
  };
}

export interface ScholarshipDetailResponse {
  success: boolean;
  data: ScholarshipFeedItem;
}

export interface ScholarshipFilters {
  page?: number;
  limit?: number;
  scholarshipType?: 'merit_based' | 'skill_based' | 'all';
  purpose?: 'tuition' | 'allowance' | 'all';
  search?: string;
  school?: string;
  sortBy?: 'createdAt' | 'applicationDeadline' | 'amountPerScholar' | 'totalScholars';
  sortOrder?: 'desc' | 'asc';
}

export const scholarshipFeedService = {
  // Get all scholarship banners for feed
  async getScholarshipFeed(filters: ScholarshipFilters = {}): Promise<ScholarshipFeedResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/scholarship-banner/feed`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view scholarships');
      }
      throw new Error(error.response?.data?.message || 'Error fetching scholarships');
    }
  },

  // Get detailed scholarship information
  async getScholarshipDetails(scholarshipId: string): Promise<ScholarshipDetailResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/scholarship-banner/feed/${scholarshipId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to view scholarship details');
      }
      if (error.response?.status === 404) {
        throw new Error('Scholarship not found or no longer available');
      }
      throw new Error(error.response?.data?.message || 'Error fetching scholarship details');
    }
  },

  // Search scholarships
  async searchScholarships(query: string, filters: Omit<ScholarshipFilters, 'search'> = {}): Promise<ScholarshipFeedResponse> {
    return this.getScholarshipFeed({
      ...filters,
      search: query,
    });
  },

  // Get scholarships by type
  async getScholarshipsByType(
    type: 'merit_based' | 'skill_based',
    filters: Omit<ScholarshipFilters, 'scholarshipType'> = {}
  ): Promise<ScholarshipFeedResponse> {
    return this.getScholarshipFeed({
      ...filters,
      scholarshipType: type,
    });
  },

  // Get scholarships by purpose
  async getScholarshipsByPurpose(
    purpose: 'tuition' | 'allowance',
    filters: Omit<ScholarshipFilters, 'purpose'> = {}
  ): Promise<ScholarshipFeedResponse> {
    return this.getScholarshipFeed({
      ...filters,
      purpose: purpose,
    });
  },

  // Get scholarships by school
  async getScholarshipsBySchool(
    school: string,
    filters: Omit<ScholarshipFilters, 'school'> = {}
  ): Promise<ScholarshipFeedResponse> {
    return this.getScholarshipFeed({
      ...filters,
      school: school,
    });
  },
};