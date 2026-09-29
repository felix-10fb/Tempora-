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

const DEMO_USERS: Record<string, { password: string; token: string; user: User }> = {
  'customer@tempora.io': {
    password: 'customer123',
    token: 'demo-customer-token',
    user: {
      id: 'demo-customer-uuid',
      name: 'Customer Demo',
      email: 'customer@tempora.io',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer-demo',
      is_verified: true,
      is_active: true,
      trust_score: 91,
      bio: 'Demo customer account for local testing.',
      created_at: new Date().toISOString(),
    }
  },
  'owner@tempora.io': {
    password: 'owner123',
    token: 'demo-owner-token',
    user: {
      id: 'demo-owner-uuid',
      name: 'Owner Demo',
      email: 'owner@tempora.io',
      phone: '+91 91234 56789',
      role: 'OWNER',
      profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner-demo',
      is_verified: true,
      is_active: true,
      trust_score: 96,
      bio: 'Demo owner account for local testing.',
      created_at: new Date().toISOString(),
    }
  },
  'admin@tempora.io': {
    password: 'admin123',
    token: 'demo-admin-token',
    user: {
      id: 'demo-admin-uuid',
      name: 'Admin Demo',
      email: 'admin@tempora.io',
      phone: '+91 90000 00000',
      role: 'ADMIN',
      profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin-demo',
      is_verified: true,
      is_active: true,
      trust_score: 99,
      bio: 'Demo admin account for local testing.',
      created_at: new Date().toISOString(),
    }
  }
};

const applyDemoSession = (userData: User, tokenValue: string, setTokenState: (token: string | null) => void, setUserState: (user: User | null) => void) => {
  setTokenState(tokenValue);
  setUserState(userData);
  localStorage.setItem('tempora_token', tokenValue);
  localStorage.setItem('tempora_user', JSON.stringify(userData));
};

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
    try {
      const data = await api.login(email, pass);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('tempora_token', data.access_token);
      localStorage.setItem('tempora_user', JSON.stringify(data.user));
      return;
    } catch (error) {
      const normalizedEmail = email.trim().toLowerCase();
      const demoUser = DEMO_USERS[normalizedEmail];
      if (demoUser && demoUser.password === pass) {
        applyDemoSession(demoUser.user, demoUser.token, setToken, setUser);
        return;
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, pass: string, role: string = 'CUSTOMER', phone?: string) => {
    try {
      const data = await api.register(name, email, pass, role, phone);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('tempora_token', data.access_token);
      localStorage.setItem('tempora_user', JSON.stringify(data.user));
      return;
    } catch (error) {
      const normalizedEmail = email.trim().toLowerCase();
      const createdUser: User = {
        id: `demo-${role.toLowerCase()}-${Date.now()}`,
        name: name || 'Demo User',
        email: normalizedEmail,
        phone,
        role: role === 'OWNER' ? 'OWNER' : 'CUSTOMER',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'demo-user'}`,
        is_verified: true,
        is_active: true,
        trust_score: 90,
        bio: 'Demo account created for local testing.',
        created_at: new Date().toISOString(),
      };
      applyDemoSession(createdUser, 'demo-register-token', setToken, setUser);
    }
  };

  const googleLogin = async (credential: string, email?: string, name?: string) => {
    try {
      const data = await api.googleAuth(credential, email, name);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('tempora_token', data.access_token);
      localStorage.setItem('tempora_user', JSON.stringify(data.user));
      return;
    } catch (error) {
      const fallbackEmail = (email || 'user@tempora.io').trim().toLowerCase();
      const fallbackUser: User = {
        id: 'demo-google-user-uuid',
        name: name || 'Tempora Member',
        email: fallbackEmail,
        phone: '+91 90000 00000',
        role: 'CUSTOMER',
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackEmail}`,
        is_verified: true,
        is_active: true,
        trust_score: 90,
        bio: 'Demo Google sign-in for local testing.',
        created_at: new Date().toISOString(),
      };
      applyDemoSession(fallbackUser, 'demo-google-token', setToken, setUser);
    }
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
