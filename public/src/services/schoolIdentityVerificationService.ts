// /services/kybService.ts

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

export interface KycKybStatus {
  status: 'unverified' | 'pending' | 'verified' | 'denied';
  personaType?: 'student' | 'sponsor' | 'school';
  submittedAt?: string;
  verifiedAt?: string;
  denialReason?: string;
  cooldownUntil?: string;
  resubmissionCount?: number;
  proofOfIdentity?: any;
}

export interface SchoolKybData {
  declarationsAndConsent: boolean;
  proofOfIdentity: {
    fullName: {
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    dateOfBirth: string;
    nationality: string;
    contactEmail: string;
    contactNumber: string;
    address: {
      country: string;
      stateOrProvince: string;
      city: string;
      districtOrBarangay: string;
      street: string;
      postalCode: string;
    };
    idDetails: {
      idType: string;
      frontImageUrl: string;
      backImageUrl: string;
      idNumber: string;
      expiryDate: string;
    };
    selfiePhotoUrl: string;
  };
}

export const kycKybService = {
  // Get KYC/KYB status for current user
  async getKycStatus(): Promise<KycKybStatus> {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/status`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error fetching KYC/KYB status');
    }
  },

  // Submit School KYB
  async submitSchoolKyb(schoolData: SchoolKybData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/school/submit`,
        schoolData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error submitting School KYB');
    }
  },

  // Upload document
  async uploadDocument(file: File, documentType: string) {
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
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error uploading document');
    }
  },

  // Delete document
  async deleteDocument(filePath: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/identity-verification/delete-document`,
        {
          data: { filePath }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error deleting document');
    }
  },

  // Get verification history
  async getVerificationHistory() {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/history`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error fetching verification history');
    }
  },

  // Resubmit verification
  async resubmitVerification(updateData: any) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/resubmit`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error resubmitting verification');
    }
  },
};