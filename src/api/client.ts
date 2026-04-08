import axios from 'axios';

// Initialize Axios client with base URL pointing to the unified backend endpoint
// Assuming standard proxying or running on a predefined URL.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1/ui',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import type { AxiosResponse, AxiosError } from 'axios';

export interface Agent {
  id: string;
  hostname: string;
  os_info: string;
  status: 'online' | 'offline';
  online: boolean;
  last_seen: string;
}

export interface ScanFinding {
  id: string;
  scan_id: string;
  agent_id: string;
  severity: 'warning' | 'suggestion';
  test_id: string;
  description: string;
}

export interface Scan {
  id: string;
  agent_id: string;
  hardening_index: number;
  raw_data: Record<string, string>;
  created_at: string;
  findings: ScanFinding[];
}

// Optionally, add interceptors here to globally handle auth errors or response formatting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
