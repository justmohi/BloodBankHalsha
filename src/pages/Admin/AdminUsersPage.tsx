import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';
import { getAdminUsers, updateUserStatus } from '@/src/services/admin/adminService';
import { UserProfile } from '@/src/types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Dialog state for user suspension/reactivation
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended'>('suspended');
  const [actionReason, setActionReason] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const list = await getAdminUsers(search);
      setUsers(list);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setActionError(err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleExecuteStatusChange = async () => {
    if (!selectedUser) return;
    setActionLoadingId(selectedUser.uid);
    setActionError(null);

    try {
      await updateUserStatus(selectedUser.uid, targetStatus, actionReason);
      setUsers(prev => prev.map(u => u.uid === selectedUser.uid ? { ...u, status: targetStatus } : u));
      setSelectedUser(null);
      setActionReason('');
    } catch (err: any) {
      console.error('Status update error:', err);
      setActionError(err.message || 'Failed to update user account status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (statusFilter !== 'all' && (user.status || 'active') !== statusFilter) return false;
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>User Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of registered member accounts, authentication statuses, and security controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="donor">Donors</option>
            <option value="user">Standard Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p>Loading user accounts...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member Profile</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredUsers.map((u) => {
                  const isSuspended = u.status === 'suspended';
                  const isAdminRole = u.role === 'admin' || u.isAdmin;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.displayName || 'User'} className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0">
                              {u.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{u.displayName || 'Unnamed Member'}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdminRole 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : u.isDonor 
                              ? 'bg-rose-100 text-red-800' 
                              : 'bg-stone-100 text-stone-700'
                        }`}>
                          {isAdminRole ? 'Administrator' : u.isDonor ? 'Donor' : 'User'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`} />
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isAdminRole && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setTargetStatus(isSuspended ? 'active' : 'suspended');
                            }}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No users matched your query or filter criteria.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                targetStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {targetStatus === 'suspended' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {targetStatus === 'suspended' ? 'Suspend User Account' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{selectedUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {targetStatus === 'suspended'
                ? 'Suspending this account will block privileged operations and prevent blood request submissions until reactivated. This action will be permanently recorded in the administrative audit log.'
                : 'Reactivating will restore standard account permissions. This action will be logged in the audit trail.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason / Notes:</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter mandatory reason for audit trail..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                disabled={actionLoadingId !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                  targetStatus === 'suspended' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoadingId ? 'Processing...' : targetStatus === 'suspended' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
