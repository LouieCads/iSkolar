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
  document: {
    type: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  };
}

export interface SchoolData {
  declarationsAndConsent: boolean;
  school: {
    schoolName: string;
    schoolType: string;
    campusAddress: {
      country: string;
      province: string;
      city: string;
      barangay: string;
      street: string;
      zipCode: string;
    };
    officialEmail: string;
    contactNumbers: string[];
    website?: string;
    businessVerification: {
      accreditationCertificate?: string;
      businessPermit?: string;
      tin: string;
      schoolIdNumber: string;
    };
    authorizedRepresentative: {
      fullName: string;
      position: string;
      email: string;
      contactNumber: string;
      nationality: string;
      idType: string;
      idNumber: string;
      schoolId: string;
    };
  };
  documents: string[]; // File names array for initial submission
}

export const kycKybService = {
  // Get KYC/KYB status
  async getStatus(): Promise<KycKybStatus> {
    const response = await axios.get(`${API_URL}/identity-verification/status`);
    return response.data;
  },

  // Submit Individual Sponsor KYB
  async submitIndividualSponsorKyb(formData: any) {
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
  },

  // Submit Corporate Sponsor KYB 
  async submitCorporateSponsorKyb(formData: any) {
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
  },

  // Submit School KYB
  async submitSchoolKyb(schoolData: SchoolData) {
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
  async deleteDocument(documentId: string) {
    const response = await axios.delete(
      `${API_URL}/identity-verification/document/${documentId}`);
    return response.data;
  }
};