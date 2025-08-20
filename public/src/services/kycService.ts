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
  status: 'unverified' | 'pending' | 'verified' | 'denied';
  documents?: any[];
  denialReason?: string;
  cooldownUntil?: string;
}

export const kycService = {
  async getKycStatus(): Promise<KycStatus> {
    const response = await axios.get(`${API_URL}/kyc-kyb-verification/status`);
    return response.data;
  },

  async submitStudentKyc(formData: any) {
    const response = await axios.post(
      `${API_URL}/kyc-kyb-verification/student/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async uploadDocument(file: File, documentType: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await axios.post(
      `${API_URL}/kyc-kyb-verification/upload-document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deleteDocument(documentId: string) {
    const response = await axios.delete(`${API_URL}/kyc-kyb-verification/document/${documentId}`);
    return response.data;
  },
};