import { api } from './httpClient';

export interface UserProfile {
  id: string;
  title: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export interface AuthUrlResponse {
  url: string;
}

export const authService = {
  getStatus: () => api.get<AuthStatusResponse>('/auth/status'),
  
  getAuthUrl: () => api.get<AuthUrlResponse>('/auth/url'),
  
  logout: () => api.post<{ message: string }>('/auth/logout'),
};
