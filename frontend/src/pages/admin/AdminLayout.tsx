import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, AlertTriangle,
  MapPin, BarChart3, ShieldCheck, ArrowLeft, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Listing Moderation', path: '/admin/listings', icon: Layers },
    { name: 'Dispute Resolution Center', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Operations Map', path: '/admin/map', icon: MapPin },
    { name: 'Marketplace Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo & Admin Badge */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold font-display text-white">
                T
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                TEMPORA
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-950/80 border border-violet-800 text-[10px] font-bold text-violet-300 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Operations Portal</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-glow-violet'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
