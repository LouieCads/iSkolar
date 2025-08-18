//services/kycKybApprovalService.ts

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

export interface Verification {
  _id: string;
  userId: string;
  personaType: "student" | "sponsor" | "school";
  status: "unverified" | "pending" | "pre_approved" | "verified" | "denied";
  submittedAt: string;
  verifiedAt?: string;
  denialReason?: string;
  verifiedBy?: string;
  student?: any;
  individualSponsor?: any;
  corporateSponsor?: any;
  school?: any;
  documents?: any[];
  fileNames?: string[];
  user?: {
    email: string;
  };
}

export interface VerificationResponse {
  verifications: Verification[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const kycKybApprovalService = {
  // Get all verifications with pagination and filters
  async getAllVerifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    personaType?: string;
  }): Promise<VerificationResponse> {
    const response = await axios.get(`${API_URL}/kyc-kyb-verification/all`, {
      params
    });
    return response.data;
  },

  // Get verification by ID
  async getVerificationById(id: string): Promise<{ verification: Verification }> {
    const response = await axios.get(`${API_URL}/kyc-kyb-verification/${id}`);
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
    const response = await axios.put(`${API_URL}/kyc-kyb-verification/${id}/status`, data);
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
    const response = await axios.get(`${API_URL}/kyc-kyb-verification/stats`);
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
    const response = await axios.post(`${API_URL}/kyc-kyb-verification/bulk-update`, {
      verificationIds,
      ...data
    });
    return response.data;
  }
};

