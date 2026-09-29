import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Check, X, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminUsers(query || undefined, roleFilter || undefined);
      setUsers(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleAction = async (userId: string, action: string, newRole?: string) => {
    try {
      await api.updateAdminUserStatus(userId, action, newRole);
      success(`User updated: ${action}`);
      fetchUsers();
    } catch (err: any) {
      error(err.message || "Failed to update user");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl text-white">
          User & Host Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review accounts, verify government identities, grant host permissions, and enforce trust scores.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="OWNER">Hosts / Owners</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={u.profile_image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-400">{u.trust_score} / 100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.is_active ? (
                      <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400">SUSPENDED</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {!u.is_verified && (
                      <button
                        onClick={() => handleAction(u.id, 'verify')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition font-bold text-[10px]"
                      >
                        Verify ID
                      </button>
                    )}
                    {u.is_active ? (
                      <button
                        onClick={() => handleAction(u.id, 'suspend')}
                        className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white transition font-bold text-[10px]"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(u.id, 'activate')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition font-bold text-[10px]"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
