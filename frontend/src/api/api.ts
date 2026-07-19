import axios from 'axios';
import { API_URLS } from '../constants/apiUrls';

// Auth Service instance
export const authApi = axios.create({
  baseURL: API_URLS.AUTH_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Match Service instance
export const matchApi = axios.create({
  baseURL: API_URLS.MATCH_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Fantasy Service instance
export const fantasyApi = axios.create({
  baseURL: API_URLS.FANTASY_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Vote Service instance
export const voteApi = axios.create({
  baseURL: API_URLS.VOTE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Prediction Service instance
export const predictionApi = axios.create({
  baseURL: API_URLS.PREDICTION_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Notification Service instance
export const notificationApi = axios.create({
  baseURL: API_URLS.NOTIFICATION_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
const attachToken = async (config: any) => {
  const { useAuthStore } = await import('../store/authStore');
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachToken);
matchApi.interceptors.request.use(attachToken);
fantasyApi.interceptors.request.use(attachToken);
voteApi.interceptors.request.use(attachToken);
predictionApi.interceptors.request.use(attachToken);
notificationApi.interceptors.request.use(attachToken);
