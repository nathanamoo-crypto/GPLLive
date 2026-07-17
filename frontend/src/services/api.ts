import axios, { AxiosError } from 'axios';

import { AUTH_URL } from '../constants/apiUrls';

const api = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenGetter: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function configureApiAuth(
  getToken: () => string | null,
  onUnauthorized: () => void
): void {
  tokenGetter = getToken;
  unauthorizedHandler = onUnauthorized;
}

api.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.';
  }
  if (axiosError.message) {
    return axiosError.message;
  }
  return fallback;
}

export default api;
