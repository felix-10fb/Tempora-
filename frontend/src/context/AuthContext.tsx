import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    const savedToken = localStorage.getItem('tempora_token');
    const savedUser = localStorage.getItem('tempora_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with backend
        api.getMe()
          .then((currentUser) => {
            setUser(currentUser);
            localStorage.setItem('tempora_user', JSON.stringify(currentUser));
          })
          .catch(() => {
            // Token expired or invalid
            logout();
          })
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      // Default to demo customer for immediate delightful exploration if none logged in
      const defaultDemoUser: User = {
        id: "demo-customer-uuid",
        name: "Rahul Sundaram",
        email: "customer@tempora.io",
        phone: "+91 94440 98765",
        role: "CUSTOMER",
        is_verified: true,
        is_active: true,
        trust_score: 94,
        profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Exploring temporary living & sustainable gear in Chennai."
      };
      setUser(defaultDemoUser);
      setIsLoading(false);
    }
  }, []);

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

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tempora_token');
    localStorage.removeItem('tempora_user');
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
