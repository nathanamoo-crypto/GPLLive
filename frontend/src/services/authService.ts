import { authApi } from '../api/api';

// POST /auth/register
export const register = async (name: string, email: string, password: string) => {
  const response = await authApi.post('/auth/register', { name, email, password });
  return response.data;
};

// POST /auth/login
export const login = async (email: string, password: string) => {
  const response = await authApi.post('/auth/login', { email, password });
  return response.data;
};

// POST /auth/demo
export const demoLogin = async () => {
  const response = await authApi.post('/auth/demo');
  return response.data;
};

// POST /auth/forgot-password
export const forgotPassword = async (email: string) => {
  const response = await authApi.post('/auth/forgot-password', { email });
  return response.data;
};

// GET /auth/me
export const getMe = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

// PATCH /auth/users/me
export const updateMe = async (data: { favouriteClubId?: string }) => {
  const response = await authApi.patch('/auth/users/me', data);
  return response.data;
};
