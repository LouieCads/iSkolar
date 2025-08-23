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

// Types
export interface KycKybStatus {
  status: 'unverified' | 'pending' | 'pre-approved' | 'verified' | 'denied';
  documents?: any[];
  denialReason?: string;
  cooldownUntil?: string;
}

export interface DocumentUploadResponse {
  message: string;
  fileUrl: string;
  documentType: string;
  fileName: string;
}

export interface ProofOfIdentity {
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
}

export interface IndividualSponsorData {
  declarationsAndConsent: boolean;
  proofOfIdentity: ProofOfIdentity;
}

export interface CorporateSponsorData {
  declarationsAndConsent: boolean;
  proofOfIdentity: ProofOfIdentity;
}

export interface SchoolData {
  declarationsAndConsent: boolean;
  proofOfIdentity: ProofOfIdentity;
}

export const kycKybService = {
  // Get KYC/KYB status
  async getStatus(): Promise<KycKybStatus> {
    const response = await axios.get(`${API_URL}/identity-verification/status`);
    return response.data;
  },

  // Submit Individual Sponsor KYB
  async submitIndividualSponsorKyb(data: IndividualSponsorData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/individual-sponsor/submit`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in again');
      }
      throw new Error(error.response?.data?.message || 'Error submitting Individual Sponsor KYB');
    }
  },

  // Submit Corporate Sponsor KYB 
  async submitCorporateSponsorKyb(data: CorporateSponsorData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/corporate-sponsor/submit`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in again');
      }
      throw new Error(error.response?.data?.message || 'Error submitting Corporate Sponsor KYB');
    }
  },

  // Submit School KYB
  async submitSchoolKyb(data: SchoolData) {
    try {
      const response = await axios.post(
        `${API_URL}/identity-verification/school/submit`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please log in again');
      }
      throw new Error(error.response?.data?.message || 'Error submitting School KYB');
    }
  },

  // Upload document
  async uploadDocument(file: File, documentType: string): Promise<DocumentUploadResponse> {
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
  },

  // Delete document
  async deleteDocument(filePath: string) {
    const response = await axios.delete(
      `${API_URL}/identity-verification/delete-document`,
      {
        data: { filePath }
      }
    );
    return response.data;
  }
};