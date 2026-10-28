import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../components/AdminNav';
import { useAuth } from '../context/AuthContext';
import {
  getAdminUsers,
  updateAdminUserStatus,
} from '../services/adminService';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  Calendar,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Action modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'suspend' | 'restore'
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUsers({
        role: roleFilter,
        status: statusFilter,
        q: searchQuery,
      });
      if (res.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openActionModal = (u, type) => {
    setSelectedUser(u);
    setActionType(type);
    setActionReason('');
    setModalError(null);
  };

  const closeActionModal = () => {
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
    setModalError(null);
  };

  const handleExecuteUserAction = async (e) => {
    e.preventDefault();
    if (!selectedUser || !actionType) return;

    const userId = selectedUser.id || selectedUser._id;

    // Self-lockout check on client
    if (userId === (currentAdmin?.id || currentAdmin?._id) && actionType === 'suspend') {
      setModalError('You cannot suspend your own administrative account.');
      return;
    }

    if (actionType === 'suspend' && !actionReason.trim()) {
      setModalError('An explicit reason is required to suspend an account.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const res = await updateAdminUserStatus(userId, {
        action: actionType,
        reason: actionReason.trim(),
      });

      if (res.success) {
        setSuccessMessage(`Account for "${selectedUser.name}" has been ${actionType === 'suspend' ? 'suspended' : 'restored'}.`);
        closeActionModal();
        await fetchUsers();
      }
    } catch (err) {
      setModalError(err.message || `Failed to ${actionType} account`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            User Accounts & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit registered shopper, vendor, and administrator accounts, manage suspensions, and enforce access safeguards.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
          <span className="text-xs text-slate-500 font-medium">Role:</span>
          {[
            { key: 'all', label: 'All Roles' },
            { key: 'customer', label: 'Customers' },
            { key: 'vendor', label: 'Vendors' },
            { key: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          {[
            { key: 'all', label: 'All Statuses' },
            { key: 'active', label: 'Active' },
            { key: 'suspended', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RotateCcw className="h-6 w-6 animate-spin text-primary-500" />
            <span>Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const userId = u.id || u._id;
                  const isCurrentAdmin =
                    userId === (currentAdmin?.id || currentAdmin?._id);

                  return (
                    <tr key={userId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary-100 text-primary-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : u.role === 'vendor'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.accountStatus === 'suspended' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            <ShieldAlert className="h-3 w-3 mr-1" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {u.accountStatus === 'suspended' ? (
                          <button
                            onClick={() => openActionModal(u, 'restore')}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Restore Access</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(u, 'suspend')}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? 'You cannot suspend your own account' : 'Suspend Account'}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend / Restore Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                {actionType === 'suspend' ? (
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                ) : (
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                )}
                <h2 className="text-base font-bold text-slate-900 font-display">
                  {actionType === 'suspend' ? 'Suspend Account' : 'Restore Account Access'}
                </h2>
              </div>
              <button
                onClick={closeActionModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteUserAction} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  {modalError}
                </div>
              )}

              <p className="text-slate-600 leading-relaxed">
                You are about to{' '}
                <strong className={actionType === 'suspend' ? 'text-red-700' : 'text-emerald-700'}>
                  {actionType}
                </strong>{' '}
                the account for <strong className="text-slate-900">{selectedUser.name}</strong> (
                {selectedUser.email}).
              </p>

              {actionType === 'suspend' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Reason for Suspension <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Provide justification (e.g. Terms of service violation, repeated fraudulent reports)..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Suspended users will be immediately rejected upon attempting login and blocked from API interactions.
                  </p>
                </div>
              )}

              {actionType === 'restore' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Reinstatement Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g. Account cleared following review..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 ${
                    actionType === 'suspend'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {submitting
                    ? 'Processing...'
                    : actionType === 'suspend'
                    ? 'Confirm Suspension'
                    : 'Restore Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
