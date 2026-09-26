import api from './api';
import { AuthResponse, User } from '../types';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  name?: string;
  full_name?: string;
  username?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: credentials.email || credentials.username || '',
      password: credentials.password || '',
    });

    return response.data;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name || data.full_name,
      full_name: data.full_name || data.name,
      username: data.username || data.email,
    });

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  setToken(token: string) {
    localStorage.setItem('munshi_token', token);
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return (
      localStorage.getItem('munshi_token') ||
      localStorage.getItem('token')
    );
  },

  logout() {
    localStorage.removeItem('munshi_token');
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('munshi:unauthorized'));
  },
};

export default authService;