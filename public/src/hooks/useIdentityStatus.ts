import { useState, useEffect } from 'react';
import { kycService, KycStatus } from '@/services/studentIdentityVerificationService';

export function useKycStatus() {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const data = await kycService.getKycStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching KYC status');
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, error, refetch: fetchKycStatus };
}