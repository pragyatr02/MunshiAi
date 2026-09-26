import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '../types';
import { authService, LoginCredentials, RegisterPayload } from '../services/authService';
import api, { getApiBaseUrl, setApiBaseUrl, formatApiError } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  backendUrl: string;
  backendConnected: boolean | null;
  checkingBackend: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  updateBackendUrl: (url: string) => void;
  checkBackendHealth: () => Promise<boolean>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [backendUrl, setBackendUrlState] = useState<string>(getApiBaseUrl());
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState<boolean>(false);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    setCheckingBackend(true);
    try {
      // Ping root or auth endpoint
      await api.get('/', { timeout: 4000 }).catch(async (err) => {
        // Even if 404/405/401 is returned, backend is alive!
        if (err.response && err.response.status !== 502 && err.response.status !== 503) {
          return { status: err.response.status };
        }
        // Try /dashboard or /auth/me
        return await api.get('/auth/me', { timeout: 3000 }).catch((innerErr) => {
          if (innerErr.response) return { status: innerErr.response.status };
          throw innerErr;
        });
      });
      setBackendConnected(true);
      return true;
    } catch {
      setBackendConnected(false);
      return false;
    } finally {
      setCheckingBackend(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  // Fetch current user if token exists
  const fetchCurrentUser = useCallback(async () => {
    const existingToken = authService.getToken();
    if (!existingToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      // If unauthorized, token is cleared by interceptor
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('munshi:unauthorized', handleUnauthorized);
    fetchCurrentUser();
    checkBackendHealth();

    return () => {
      window.removeEventListener('munshi:unauthorized', handleUnauthorized);
    };
  }, [fetchCurrentUser, checkBackendHealth]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const receivedToken = response.access_token || response.token;
      if (receivedToken) {
        authService.setToken(receivedToken);
        setToken(receivedToken);
      }
      if (response.user) {
        setUser(response.user);
      } else {
        // Try getting user profile
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch {
          // Fallback to minimal user info
          setUser({ email: credentials.email || credentials.username || 'User' });
        }
      }
      setBackendConnected(true);
      return response;
    } catch (err: unknown) {
      const msg = formatApiError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      const receivedToken = response.access_token || response.token;
      if (receivedToken) {
        authService.setToken(receivedToken);
        setToken(receivedToken);
      }
      if (response.user) {
        setUser(response.user);
      } else if (receivedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch {
          setUser({ email: payload.email, name: payload.name || payload.full_name });
        }
      }
      setBackendConnected(true);
      return response;
    } catch (err: unknown) {
      const msg = formatApiError(err);
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBackendUrl = (url: string) => {
    setApiBaseUrl(url);
    setBackendUrlState(getApiBaseUrl());
    checkBackendHealth();
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        authError,
        backendUrl,
        backendConnected,
        checkingBackend,
        login,
        register,
        logout,
        updateBackendUrl,
        checkBackendHealth,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
