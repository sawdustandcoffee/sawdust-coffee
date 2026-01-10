import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import type { User, ApiError } from '../types';

interface CustomerAuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get<{ user: User | null }>('/customer/user');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await api.post<{ user: User; message: string }>('/customer/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      setUser(response.data.user);
    } catch (error: any) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError?.message || 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ user: User; message: string }>('/customer/login', {
        email,
        password,
      });
      setUser(response.data.user);
    } catch (error: any) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/customer/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await api.put<{ user: User; message: string }>('/customer/profile', data);
      setUser(response.data.user);
    } catch (error: any) {
      const apiError = error.response?.data as ApiError;
      throw new Error(apiError?.message || 'Profile update failed');
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
