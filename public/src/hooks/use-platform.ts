import { useState, useEffect } from 'react';
import axios from 'axios';

interface Platform {
  name: string;
  email?: string;
  phoneNumber?: string;
  logoUrl?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchPlatform = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${API_BASE_URL}/platform/name`);
      setPlatform(data.platform);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch platform information');
    } finally {
      setLoading(false);
    }
  };

  const updatePlatform = async (
    fields: {
      name: string;
      email?: string;
      phoneNumber?: string;
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    },
    token?: string
  ) => {
    try {
      setUpdating(true);
      setError(null);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const { data } = await axios.put(`${API_BASE_URL}/platform/change-name`, fields, { headers });
      setPlatform(data.platform);
      return data.platform;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to update platform');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      setUpdating(true);
      setError(null);
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await axios.post(`${API_BASE_URL}/platform/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refetch platform info to get the new logoUrl
      await fetchPlatform();
      return data.logoUrl;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to upload logo');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchPlatform();
  }, []);

  return { 
    platform, 
    loading, 
    error, 
    updating,
    updatePlatform,
    refetch: fetchPlatform,
    uploadLogo
  };
}; 