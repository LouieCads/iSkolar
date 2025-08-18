// services/schoolKycApprovalService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Add authorization header to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export interface Verification {
  _id: string;
  userId: string;
  personaType: "student";
  status: "pending" | "pre_approved" | "denied";
  submittedAt: string;
  verifiedAt?: string;
  denialReason?: string;
  verifiedBy?: string;
  student?: {
    fullName: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
    };
    email?: string;
    mobileNumber?: string;
    gender?: string;
    age?: number;
    civilStatus?: string;
    nationality?: string;
    studentIdNumber?: string;
    schoolName?: string;
    schoolEmail?: string;
    yearLevel?: string;
    course?: string;
    semestersPerYear?: number;
    dateOfBirth?: string;
    placeOfBirth?: string;
    address?: {
      country?: string;
      province?: string;
      city?: string;
      barangay?: string;
      street?: string;
      zipCode?: string;
    };
    educationalBackground?: {
      elementary?: { name?: string; yearGraduated?: number };
      juniorHigh?: { name?: string; yearGraduated?: number };
      seniorHigh?: { name?: string; yearGraduated?: number };
      college?: { name?: string; expectedGraduation?: number };
    };
  };
  schoolId?: string;
  documents?: Array<{
    type: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    isVerified: boolean;
  }>;
  fileNames?: string[];
}

export interface QueueItem {
  verificationId: string;
  studentName: string;
  schoolName: string;
  status: "pending" | "pre_approved" | "denied";
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  verification?: Verification; // Optional populated verification
}

export interface SchoolKycQueueResponse {
  queue: QueueItem[];
  kycVerifications: Verification[];
  count: number;
  schoolName?: string;
}

export const schoolKycApprovalService = {
  async getSchoolKycQueue(): Promise<SchoolKycQueueResponse> {
    try {
      const response = await axios.get(`${API_URL}/kyc-kyb-verification/school/queue`);
      console.log('Service received API response:', response.data);
      return {
        queue: response.data.queue || [],
        kycVerifications: response.data.kycVerifications || [],
        count: response.data.count || 0,
        schoolName: response.data.schoolName || '',
      };
    } catch (error: any) {
      console.error('Service error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch school KYC queue');
    }
  },

  async preApproveStudent(id: string, data: { reviewerNotes?: string }): Promise<{ message: string; verification: Verification }> {
    try {
      const response = await axios.post(`${API_URL}/kyc-kyb-verification/pre-approve/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to pre-approve student');
    }
  },

  async denyStudent(id: string, data: { denialReason: string; reviewerNotes?: string }): Promise<{ message: string; verification: Verification }> {
    try {
      const response = await axios.post(`${API_URL}/kyc-kyb-verification/school-deny/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to deny student');
    }
  },

  async getVerificationById(id: string): Promise<{ verification: Verification }> {
    try {
      const response = await axios.get(`${API_URL}/kyc-kyb-verification/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch verification');
    }
  },
};