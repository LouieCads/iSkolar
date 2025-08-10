import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 second timeout for file uploads
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interface for scholarship data
interface ScholarshipData {
  title?: string;
  description?: string;
  scholarshipType?: string;
  purpose?: string;
  totalScholars?: number | string;
  amountPerScholar?: number | string;
  selectedSchool?: string;
  selectionMode?: string;
  applicationDeadline?: string | Date;
  criteriaTags?: string[];
  requiredDocuments?: string[];
}

// Interface for getScholarships params
interface GetScholarshipsParams {
  page?: number;
  limit?: number;
  status?: string;
  scholarshipType?: string;
  purpose?: string;
  search?: string;
}

// Interface for API response (adjust based on your actual API response structure)
interface ScholarshipResponse {
  data: any; // Replace with more specific type if known
  message?: string;
  errors?: string[];
}

class ScholarshipBannerService {
  /**
   * Create a new scholarship
   * @param scholarshipData - Scholarship form data
   * @param bannerImage - Optional banner image file
   * @returns Created scholarship data
   */
  async createScholarship(scholarshipData: ScholarshipData, bannerImage: File | null = null): Promise<ScholarshipResponse> {
    try {
      const formData = new FormData();
      
      // Add scholarship data to form
      Object.keys(scholarshipData).forEach((key) => {
        const value = scholarshipData[key as keyof ScholarshipData];
        
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add banner image if provided
      if (bannerImage instanceof File) {
        formData.append('bannerImage', bannerImage);
      }
      
      const response = await api.post('/scholarship-banner/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to create scholarship');
    }
  }

  /**
   * Get all scholarships for the authenticated sponsor
   * @param params - Query parameters
   * @returns Scholarships data with pagination
   */
  async getScholarships(params: GetScholarshipsParams = {}): Promise<ScholarshipResponse> {
    try {
      const response = await api.get('/scholarship-banner', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch scholarships');
    }
  }

  /**
   * Get a single scholarship by ID
   * @param id - Scholarship ID
   * @returns Scholarship data
   */
  async getScholarship(id: string): Promise<ScholarshipResponse> {
    try {
      if (!id) {
        throw new Error('Scholarship ID is required');
      }
      
      const response = await api.get(`/scholarship-banner/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to fetch scholarship');
    }
  }

  /**
   * Update a scholarship
   * @param id - Scholarship ID
   * @param updateData - Data to update
   * @param bannerImage - Optional new banner image
   * @returns Updated scholarship data
   */
  async updateScholarship(id: string, updateData: ScholarshipData, bannerImage: File | null = null): Promise<ScholarshipResponse> {
    try {
      if (!id) {
        throw new Error('Scholarship ID is required');
      }
      
      const formData = new FormData();
      
      // Add update data to form
      Object.keys(updateData).forEach((key) => {
        const value = updateData[key as keyof ScholarshipData];
        
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add banner image if provided
      if (bannerImage instanceof File) {
        formData.append('bannerImage', bannerImage);
      }
      
      const response = await api.put(`/scholarship-banner/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to update scholarship');
    }
  }

  /**
   * Delete a scholarship
   * @param id - Scholarship ID
   * @returns Success response
   */
  async deleteScholarship(id: string): Promise<ScholarshipResponse> {
    try {
      if (!id) {
        throw new Error('Scholarship ID is required');
      }
      
      const response = await api.delete(`/scholarship-banner/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'Failed to delete scholarship');
    }
  }

  /**
   * Validate scholarship data before submission
   * @param data - Scholarship data to validate
   * @returns Validation result with isValid and errors
   */
  validateScholarshipData(data: ScholarshipData): { isValid: boolean; errors: Partial<Record<keyof ScholarshipData, string>> } {
    const errors: Partial<Record<keyof ScholarshipData, string>> = {};
    
    // Required fields validation
    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!data.scholarshipType) {
      errors.scholarshipType = 'Scholarship type is required';
    }
    
    if (!data.purpose) {
      errors.purpose = 'Purpose is required';
    }
    
    if (!data.selectedSchool) {
      errors.selectedSchool = 'School selection is required';
    }
    
    if (!data.applicationDeadline) {
      errors.applicationDeadline = 'Application deadline is required';
    } else {
      // Validate that deadline is in the future
      const deadline = new Date(data.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline <= today) {
        errors.applicationDeadline = 'Deadline must be in the future';
      }
    }
    
    // Number validations
    const totalScholars = Number(data.totalScholars);
    if (!data.totalScholars || totalScholars < 1) {
      errors.totalScholars = 'Number of scholars must be at least 1';
    }
    
    const amountPerScholar = Number(data.amountPerScholar);
    if (!data.amountPerScholar || amountPerScholar <= 0) {
      errors.amountPerScholar = 'Amount must be greater than 0';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Format scholarship data for API submission
   * @param formData - Form data from component
   * @returns Formatted data for API
   */
  formatScholarshipData(formData: ScholarshipData): ScholarshipData {
    return {
      title: formData.title?.trim(),
      description: formData.description?.trim() || '', // Make description optional
      scholarshipType: formData.scholarshipType,
      purpose: formData.purpose,
      totalScholars: parseInt(String(formData.totalScholars)) || 0,
      amountPerScholar: parseFloat(String(formData.amountPerScholar)) || 0,
      selectedSchool: formData.selectedSchool,
      selectionMode: formData.selectionMode || 'auto',
      applicationDeadline: formData.applicationDeadline,
      criteriaTags: Array.isArray(formData.criteriaTags) ? formData.criteriaTags : [],
      requiredDocuments: Array.isArray(formData.requiredDocuments) ? formData.requiredDocuments : [],
    };
  }

  /**
   * Handle API errors consistently
   * @param error - Error object from API
   * @param defaultMessage - Default error message
   * @throws Formatted error
   */
  handleError(error: any, defaultMessage: string): never {
    console.error(`ScholarshipBannerService Error:`, error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.response?.data?.errors?.length > 0) {
      throw new Error(error.response.data.errors.join(', '));
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error(defaultMessage);
  }

  /**
   * Get full URL for banner image
   * @param bannerUrl - Relative banner URL from API
   * @returns Full URL or empty string
   */
  getBannerImageUrl(bannerUrl?: string): string {
    if (!bannerUrl) return '';
    
    if (bannerUrl.startsWith('http')) {
      return bannerUrl;
    }
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${API_URL}${bannerUrl}`;
  }
}

// Create and export a singleton instance
const scholarshipBannerService = new ScholarshipBannerService();
export default scholarshipBannerService;