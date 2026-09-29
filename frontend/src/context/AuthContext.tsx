import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string, phone?: string) => Promise<void>;
  googleLogin: (credential: string, email?: string, name?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'CUSTOMER' | 'OWNER' | 'ADMIN') => void;
  isAdmin: boolean;
  isOwner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Define logout first so it's stable when referenced inside useEffect
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tempora_token');
    localStorage.removeItem('tempora_user');
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('tempora_token');
    const savedUser = localStorage.getItem('tempora_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Silently verify token is still valid with backend
        api.getMe()
          .then((currentUser) => {
            setUser(currentUser);
            localStorage.setItem('tempora_user', JSON.stringify(currentUser));
          })
          .catch(() => logout())
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [logout]);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('tempora_token', data.access_token);
    localStorage.setItem('tempora_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, pass: string, role: string = 'CUSTOMER', phone?: string) => {
    const data = await api.register(name, email, pass, role, phone);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('tempora_token', data.access_token);
    localStorage.setItem('tempora_user', JSON.stringify(data.user));
  };

  const googleLogin = async (credential: string, email?: string, name?: string) => {
    const data = await api.googleAuth(credential, email, name);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('tempora_token', data.access_token);
    localStorage.setItem('tempora_user', JSON.stringify(data.user));
  };

  const switchRole = (role: 'CUSTOMER' | 'OWNER' | 'ADMIN') => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('tempora_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        switchRole,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
        isOwner: user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
