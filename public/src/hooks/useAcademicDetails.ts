import { useState, useEffect } from 'react';

interface AcademicDetails {
  course: string[];
  semester: string[];
  yearLevel: string[];
  school: string[];
  isLoading: boolean;
  error: string | null;
}

interface VerifiedSchool {
  name: string;
  type: string;
}

interface VerifiedSchoolsData {
  schools: VerifiedSchool[];
  isLoading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useAcademicDetails = () => {
  const [details, setDetails] = useState<AcademicDetails>({
    course: [],
    semester: [],
    yearLevel: [],
    school: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAcademicDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/academic-details/academic-details`);
        if (!response.ok) throw new Error('Failed to fetch academic details');
        const data = await response.json();
        
        setDetails({
          course: data.course || [],
          semester: data.semester || [],
          yearLevel: data.yearLevel || [],
          school: data.school || [],
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

    fetchAcademicDetails();
  }, []);

  return details;
};

// Hook to fetch verified schools for student KYC
export const useVerifiedSchools = () => {
  const [verifiedSchools, setVerifiedSchools] = useState<VerifiedSchoolsData>({
    schools: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchVerifiedSchools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/academic-details/verified-schools`);
        if (!response.ok) throw new Error('Failed to fetch verified schools');
        const data = await response.json();
        
        setVerifiedSchools({
          schools: data.schools || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setVerifiedSchools(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    fetchVerifiedSchools();
  }, []);

  return verifiedSchools;
};