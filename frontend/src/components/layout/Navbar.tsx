import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, Search, PlusCircle, Bell, User as UserIcon,
  ShieldCheck, Heart, MessageSquare, LayoutDashboard,
  LogOut, Moon, Sun, Layers, Compass, ChevronDown, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-extrabold text-xl font-display tracking-wider">T</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                  TEMPORA
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Own Less. Live More.
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/search"
                className={`px-3.5 py-2 rounded-xl transition ${
                  isActive('/search')
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Explore
                </span>
              </Link>
              
              <Link
                to="/setup-builder"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 ${
                  isActive('/setup-builder')
                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold'
                    : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Tell Us What You Need</span>
                <span className="text-[10px] uppercase font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              </Link>

              <Link
                to="/clothing-mode"
                className={`px-3.5 py-2 rounded-xl transition ${
                  isActive('/clothing-mode')
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Clothing Mode
              </Link>

              <Link
                to="/furniture-mode"
                className={`px-3.5 py-2 rounded-xl transition ${
                  isActive('/furniture-mode')
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Furniture Mode
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3">
            
            {/* Role Switcher Pill (Dev / Testing Utility) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                title="Switch active role demo preview"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Role: {user?.role || 'CUSTOMER'}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-2 z-50">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1.5">
                    Preview As Role
                  </div>
                  {(['CUSTOMER', 'OWNER', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setIsRoleMenuOpen(false);
                        if (r === 'ADMIN') navigate('/admin');
                        else if (r === 'OWNER') navigate('/owner');
                        else navigate('/dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        user?.role === r
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{r} View</span>
                      {user?.role === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </Link>

            {/* List Something CTA */}
            <Link
              to="/add-listing"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>List Something</span>
            </Link>

            {/* User Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={user?.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"}
                  alt={user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-2 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    
                    {/* Trust Score Badge */}
                    <div className="mt-2.5 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Trust Score
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                        {user?.trust_score || 94} / 100
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Customer Dashboard
                    </Link>

                    {isOwner && (
                      <Link
                        to="/owner"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <Layers className="w-4 h-4 text-emerald-500" />
                        Owner Platform
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-violet-950/40 hover:bg-violet-100/60 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-violet-500" />
                        Admin Operations Portal
                      </Link>
                    )}

                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      Saved Wishlist
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      Messages
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
