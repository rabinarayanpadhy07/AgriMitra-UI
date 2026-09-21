import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => 
    localStorage.getItem('agrimitra_token') || localStorage.getItem('shopeasy_token')
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('agrimitra_user') || localStorage.getItem('shopeasy_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyStoredSession = async () => {
      const storedToken = localStorage.getItem('agrimitra_token') || localStorage.getItem('shopeasy_token');
      if (storedToken) {
        try {
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.data) {
            setUser(profileRes.data);
            localStorage.setItem('agrimitra_user', JSON.stringify(profileRes.data));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth state');
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyStoredSession();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (authToken, authUser) => {
    localStorage.setItem('agrimitra_token', authToken);
    localStorage.setItem('agrimitra_user', JSON.stringify(authUser));
    // Clean up old keys if present
    localStorage.removeItem('shopeasy_token');
    localStorage.removeItem('shopeasy_user');
    setToken(authToken);
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('agrimitra_token');
      localStorage.removeItem('agrimitra_user');
      localStorage.removeItem('shopeasy_token');
      localStorage.removeItem('shopeasy_user');
      setToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('agrimitra_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
