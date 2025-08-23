//services/identityApprovalService.ts

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

export interface ProofOfIdentity {
  fullName: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  dateOfBirth?: Date;
  nationality?: string;
  contactEmail: string;
  contactNumber?: string;
  address?: {
    country?: string;
    stateOrProvince?: string;
    city?: string;
    districtOrBarangay?: string;
    street?: string;
    postalCode?: string;
  };
  idDetails?: {
    idType?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    idNumber?: string;
    expiryDate?: Date;
  };
  selfiePhotoUrl?: string;
}

export interface Verification {
  _id: string;
  userId: {
    _id: string;
    email: string;
    role?: string;
    status?: string;
  } | string;
  personaType: "student" | "sponsor" | "school";
  status: "unverified" | "pending" | "verified" | "denied";
  submittedAt: string;
  proofOfIdentity: ProofOfIdentity; // ✅ Add this
  resubmissionCount?: number;
  cooldownUntil?: Date;
  declarationsAndConsent: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  denialReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VerificationResponse {
  verifications: Verification[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const identityApprovalService = {
  // Get all verifications with pagination and filters
  async getAllVerifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    personaType?: string;
  }): Promise<VerificationResponse> {
    const response = await axios.get(`${API_URL}/identity-verification/all`, {
      params
    });
    return response.data;
  },

  // Get verification by ID
  async getVerificationById(id: string): Promise<{ verification: Verification }> {
    const response = await axios.get(`${API_URL}/identity-verification/${id}`);
    return response.data;
  },

  // Update verification status
  async updateVerificationStatus(
    id: string, 
    data: { 
      status: "verified" | "denied"; 
      denialReason?: string; 
    }
  ): Promise<{ message: string; verification: Verification }> {
    const response = await axios.put(`${API_URL}/identity-verification/${id}/status`, data);
    return response.data;
  },

  // Get verification statistics
  async getVerificationStats(): Promise<{
    overall: {
      total: number;
      unverified: number;
      pending: number;
      preApproved: number;
      verified: number;
      denied: number;
    };
    byPersonaType: Array<{
      _id: string;
      count: number;
      verified: number;
      pending: number;
    }>;
  }> {
    const response = await axios.get(`${API_URL}/identity-verification/stats`);
    return response.data;
  },

  // Bulk update verification status
  async bulkUpdateStatus(
    verificationIds: string[], 
    data: { 
      status: "verified" | "denied"; 
      denialReason?: string; 
    }
  ): Promise<{ message: string; modifiedCount: number }> {
    const response = await axios.post(`${API_URL}/identity-verification/bulk-update`, {
      verificationIds,
      ...data
    });
    return response.data;
  }
};