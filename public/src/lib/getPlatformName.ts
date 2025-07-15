import axios from 'axios';

export async function getPlatformName(): Promise<string> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const { data } = await axios.get(`${API_BASE_URL}/platform/name`);
    return data.platform?.name || 'iSkolar';
  } catch {
    return 'iSkolar';
  }
} 