import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export const kycKybService = {
  // Get KYC/KYB status
  async getStatus(): Promise<KycKybStatus> {
    const response = await axios.get(`${API_URL}/kyc-kyb-verification/status`);
    return response.data;
  },

  // Submit Individual Sponsor KYB
  async submitIndividualSponsorKyb(formData: any) {
    const response = await axios.post(
      `${API_URL}/kyc-kyb-verification/individual-sponsor/submit`,
      formData
    );
    return response.data;
  },

  // Submit Corporate Sponsor KYB
  async submitCorporateSponsorKyb(formData: any) {
    const response = await axios.post(
      `${API_URL}/kyc-kyb-verification/corporate-sponsor/submit`,
      formData
    );
    return response.data;
  },

  // Upload document
  async uploadDocument(file: File, documentType: string): Promise<DocumentUploadResponse> {
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

  // Delete document
  async deleteDocument(documentId: string) {
    const response = await axios.delete(
      `${API_URL}/kyc-kyb-verification/document/${documentId}`
    );
    return response.data;
  }
};