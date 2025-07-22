import axios from 'axios';

export async function getPlatformDetails(): Promise<{
  name: string;
  logoUrl?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const { data } = await axios.get(`${API_BASE_URL}/platform/name`);
    return {
      name: data.platform?.name || 'iSkolar',
      logoUrl: data.platform?.logoUrl,
      facebook: data.platform?.facebook,
      twitter: data.platform?.twitter,
      instagram: data.platform?.instagram,
      linkedin: data.platform?.linkedin,
    };
  } catch {
    return {
      name: 'iSkolar',
      logoUrl: '/iSkolar_logo.png',
      facebook: 'https://facebook.com/iskolarph',
      twitter: 'https://twitter.com/iskolarph',
      instagram: 'https://instagram.com/iskolarph',
      linkedin: 'https://linkedin.com/company/iskolarph',
    };
  }
} 