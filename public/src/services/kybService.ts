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

export interface KybStatus {
  status: 'unverified' | 'pending' | 'pre-approved' | 'verified' | 'denied';
  personaType?: 'School' | 'Sponsor';
  documents?: any[];
  denialReason?: string;
  cooldownUntil?: string;
  submittedAt?: string;
  verifiedAt?: string;
  resubmissionCount?: number;
}

export interface IndividualSponsorData {
  declarationsAndConsent: boolean;
  individualSponsor: {
    fullName: {
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    email: string;
    mobileNumber: string;
    gender: string;
    age: number;
    civilStatus: string;
    nationality: string;
    dateOfBirth: string;
    placeOfBirth: string;
    address: {
      country: string;
      province: string;
      city: string;
      barangay: string;
      street: string;
      zipCode: string;
    };
    employment: {
      company: string;
      position: string;
      workAddress: string;
      monthlyIncome: number;
      yearsOfEmployment: number;
    };
    identification: {
      idType: string;
      idNumber: string;
    };
  };
  documents: File[];
}

export interface CorporateSponsorData {
  declarationsAndConsent: boolean;
  corporateSponsor: {
    corporateName: string;
    businessType: string;
    tin: string;
    businessRegistrationNumber: string;
    dateOfIncorporation: string;
    businessAddress: {
      country: string;
      province: string;
      city: string;
      barangay: string;
      street: string;
      zipCode: string;
    };
    contactEmail: string;
    contactNumbers: string[];
    website?: string;
    authorizedRepresentative: {
      fullName: string;
      position: string;
      email: string;
      contactNumber: string;
      nationality: string;
      idType: string;
      idNumber: string;
    };
    businessDetails: {
      industry: string;
      annualRevenue: number;
      numberOfEmployees: number;
      businessDescription: string;
    };
  };
  documents: File[];
}

export const kybService = {
  // Get KYB status for current user
  async getKybStatus(): Promise<KybStatus> {
    try {
      const response = await axios.get(`${API_URL}/identity-verification/status`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in');
      }
      throw new Error(error.response?.data?.message || 'Error fetching KYB status');
    }
  },

  // Submit Individual Sponsor KYB
  async submitIndividualSponsorKyb(sponsorData: IndividualSponsorData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/individual-sponsor/submit`,
        sponsorData,
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
      throw new Error(error.response?.data?.message || 'Error submitting Individual Sponsor KYB');
    }
  },

  // Submit Corporate Sponsor KYB
  async submitCorporateSponsorKyb(corporateData: CorporateSponsorData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/corporate-sponsor/submit`,
        corporateData,
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
      throw new Error(error.response?.data?.message || 'Error submitting Corporate Sponsor KYB');
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
  async deleteDocument(documentId: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/identity-verification/document/${documentId}`
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