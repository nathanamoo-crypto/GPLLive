import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { AUTH_URL } from '../constants/apiUrls';

// The shared backend runs on Render's free tier, which spins the instance
// down after 15 minutes of no traffic. The next request wakes it back up,
// but that can take 20-50s (cold JVM boot + Neon's own DB auto-resume on
// top). 15s was too tight and killed the very first request after any idle
// period - bumped so a cold start has room to actually finish instead of
// always erroring out once before the retry below saves it.
const COLD_START_TIMEOUT_MS = 45000;

const api = axios.create({
  baseURL: AUTH_URL,
  timeout: COLD_START_TIMEOUT_MS,
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
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    // A timeout on the FIRST attempt is most likely the Render instance (or
    // Neon DB behind it) waking up from an idle spin-down rather than a real
    // connectivity problem - one retry gives the now-warm backend a chance
    // to answer instead of surfacing a raw "timeout of 45000ms exceeded" to
    // the user immediately.
    const config = error.config as (AxiosRequestConfig & { _retriedAfterTimeout?: boolean }) | undefined;
    if (error.code === 'ECONNABORTED' && config && !config._retriedAfterTimeout) {
      config._retriedAfterTimeout = true;
      return api(config);
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError.code === 'ECONNABORTED') {
    return 'The server is waking up from being idle - this can take up to a minute on the free tier. Please try again.';
  }
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
