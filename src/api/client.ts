import axios from 'axios';

// Initialize Axios client with base URL pointing to the unified backend endpoint
// Assuming standard proxying or running on a predefined URL.
export const apiClient = axios.create({
  baseURL: '/api/v1/ui',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import type { AxiosResponse, AxiosError } from 'axios';

// Optionally, add interceptors here to globally handle auth errors or response formatting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
