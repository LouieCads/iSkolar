import { useState, useEffect } from 'react';

interface ScholarshipDetails {
  types: string[];
  purposes: string[];
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useScholarshipDetails = () => {
  const [details, setDetails] = useState<ScholarshipDetails>({
    types: [],
    purposes: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchScholarshipDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/scholarship-details/scholarship-details`);
        if (!response.ok) throw new Error('Failed to fetch scholarship details');
        const data = await response.json();
        
        setDetails({
          types: data.types || [],
          purposes: data.purposes || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setDetails(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    fetchScholarshipDetails();
  }, []);

  return details;
};