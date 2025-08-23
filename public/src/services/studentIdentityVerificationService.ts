// services/kycService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add authorization header to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface KycStatus {
  id?: string;
  status: 'unverified' | 'pending' | 'verified' | 'denied';
  personaType?: 'student' | 'school' | 'sponsor';
  submittedAt?: string;
  verifiedAt?: string;
  denialReason?: string;
  cooldownUntil?: string;
  resubmissionCount?: number;
  proofOfIdentity?: any;
}

export interface VerificationHistory {
  verifications: KycStatus[];
}

export interface DocumentUploadResponse {
  message: string;
  fileUrl: string;
  documentType: string;
  fileName: string;
}

export interface KycSubmissionResponse {
  message: string;
  verification: KycStatus;
  nextStep?: string;
}

export const kycService = {
  /**
   * Get current KYC status for the authenticated user
   */
  async getKycStatus(): Promise<KycStatus> {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  },

  /**
   * Submit Student KYC verification (goes directly to admin for review)
   */
  async submitStudentKyc(formData: any): Promise<KycSubmissionResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/student/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting Student KYC:', error);
      throw error;
    }
  },

  /**
   * Submit Individual Sponsor KYB verification
   */
  async submitIndividualSponsorKyb(formData: any): Promise<KycSubmissionResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/individual-sponsor/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting Individual Sponsor KYB:', error);
      throw error;
    }
  },

  /**
   * Submit Corporate Sponsor KYB verification
   */
  async submitCorporateSponsorKyb(formData: any): Promise<KycSubmissionResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/corporate-sponsor/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting Corporate Sponsor KYB:', error);
      throw error;
    }
  },

  /**
   * Submit School KYB verification
   */
  async submitSchoolKyb(formData: any): Promise<KycSubmissionResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/school/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting School KYB:', error);
      throw error;
    }
  },

  /**
   * Upload document for identity verification
   * @param file - File to upload
   * @param documentType - Type of document ('idFront', 'idBack', 'selfie')
   */
  async uploadDocument(file: File, documentType: string): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await axios.post(
        `${API_URL}/identity-verification/upload-document`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  /**
   * Delete a document by file path
   * @param filePath - The file path returned from upload (e.g., '/public/documents/filename.jpg')
   */
  async deleteDocument(filePath: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/identity-verification/document/delete`, {
        data: { filePath },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Get verification history for the current user
   */
  async getVerificationHistory(): Promise<VerificationHistory> {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification history:', error);
      throw error;
    }
  },

  /**
   * Resubmit a denied verification
   */
  async resubmitVerification(formData: any): Promise<KycSubmissionResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/resubmit`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error resubmitting verification:', error);
      throw error;
    }
  },

  // Admin-only methods (for completeness)
  
  /**
   * Get all verifications (Admin only)
   */
  async getAllVerifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    personaType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/all`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all verifications:', error);
      throw error;
    }
  },

  /**
   * Get verification by ID (Admin only)
   */
  async getVerificationById(verificationId: string) {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/${verificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification by ID:', error);
      throw error;
    }
  },

  /**
   * Update verification status (Admin only)
   */
  async updateVerificationStatus(verificationId: string, status: string, denialReason?: string) {
    try {
      const response = await axios.put(`${API_URL}/identity-verification/${verificationId}/status`, {
        status,
        denialReason,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  },

  /**
   * Bulk update verification status (Admin only)
   */
  async bulkUpdateStatus(verificationIds: string[], status: string, denialReason?: string) {
    try {
      const response = await axios.post(`${API_URL}/identity-verification/bulk-update`, {
        verificationIds,
        status,
        denialReason,
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating verification status:', error);
      throw error;
    }
  },

  /**
   * Get verification statistics (Admin only)
   */
  async getVerificationStats() {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }
  },
};