import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { mockUsers } from '../../shared/data/mockData';
import { api } from '../../shared/services/api';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (api.isEnabled) {
      try {
        const { token, user } = await api.login(email, password);
        try { localStorage.setItem('auth_token', token); } catch {}
        setCurrentUser(user as User);
        return true;
      } catch (e) {
        setCurrentUser(null);
        return false;
      }
    } else {
      const user = mockUsers.find(u => u.email === email);
      if (!user) return false;
      const pass = (user as any).password;
      const ok = pass ? password === pass : password === 'password';
      if (ok) {
        setCurrentUser(user);
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
