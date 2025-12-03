import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '@/config/api';

interface User {
  id: number;
  email: string;
  name: string;
  is_staff: boolean;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return data.access;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return null;
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      login(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        token = await refreshToken();
      }
      if (token) {
        fetchUserData(token);
      }
    };

    initializeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};