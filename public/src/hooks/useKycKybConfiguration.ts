import { useState, useEffect } from 'react';

interface KycKybConfiguration {
  idTypes: string[];
  employmentType: string[];
  natureOfWork: string[];
  sourceOfIncome: string[];
  organizationType: string[];
  industrySector: string[];
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useKycKybConfiguration = () => {
  const [config, setConfig] = useState<KycKybConfiguration>({
    idTypes: [],
    employmentType: [],
    natureOfWork: [],
    sourceOfIncome: [],
    organizationType: [],
    industrySector: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/kyc-kyb-configuration/kyc-kyb-configuration`);
        if (!response.ok) throw new Error('Failed to fetch KYC/KYB configuration');
        
        const data = await response.json();
        setConfig({
          idTypes: data.idTypes || [],
          employmentType: data.employmentType || [],
          natureOfWork: data.natureOfWork || [],
          sourceOfIncome: data.sourceOfIncome || [],
          organizationType: data.organizationType || [],
          industrySector: data.industrySector || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setConfig(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    fetchConfiguration();
  }, []);

  return config;
};