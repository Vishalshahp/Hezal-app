import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNav from '../components/AdminNav';
import {
  getDashboardMetrics,
  getAdminVendors,
  getAdminAuditLogs,
} from '../services/adminService';
import {
  Store,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Shield,
  Activity,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, vendorsRes, logsRes] = await Promise.all([
        getDashboardMetrics(),
        getAdminVendors({ status: 'pending', limit: 5 }),
        getAdminAuditLogs({ limit: 8 }),
      ]);

      if (metricsRes.success) {
        setMetrics(metricsRes.data.metrics);
      }
      if (vendorsRes.success) {
        setPendingVendors(vendorsRes.data.vendors || []);
      }
      if (logsRes.success) {
        setRecentLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AdminNav metrics={metrics} />

      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl shadow-xs">
            <Shield className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Admin Control Center
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.email}) • Super Admin Access
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Shoppers & Users</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {metrics ? metrics.totalCustomers : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered customers ({metrics ? metrics.totalUsers : 0} total accounts)
            </p>
          </div>
        </div>

        {/* Pending Vendor Approvals */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-display">
              {metrics ? metrics.pendingVendors : '—'}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-amber-700 font-medium">Stalls awaiting review</p>
              <Link
                to="/admin/vendors?status=pending"
                className="text-xs text-amber-800 font-bold hover:underline inline-flex items-center"
              >
                Review <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Approved Active Stalls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Stalls
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display">
              {metrics ? metrics.approvedVendors : '—'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Discoverable on public map ({metrics ? metrics.totalProducts : 0} items)
            </p>
          </div>
        </div>

        {/* Unresolved Reports */}
        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs flex flex-col justify-between bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Listing Reports</span>
            <div className="h-9 w-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-red-800 font-display">
              {metrics ? metrics.unresolvedReports : '—'}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-red-700 font-medium">Flagged by community</p>
              <Link
                to="/admin/reports"
                className="text-xs text-red-800 font-bold hover:underline inline-flex items-center"
              >
                Inspect <ArrowRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Status Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stall Moderation Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Vendor Status Breakdown</h3>
            <span className="text-xs text-slate-500">{metrics?.totalVendors || 0} total</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-emerald-700 font-medium">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approved & Active
              </span>
              <span className="font-bold text-slate-900">{metrics?.approvedVendors || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-amber-700 font-medium">
                <Clock className="h-4 w-4 mr-1.5" /> Pending Review
              </span>
              <span className="font-bold text-slate-900">{metrics?.pendingVendors || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-blue-700 font-medium">
                <RotateCcw className="h-4 w-4 mr-1.5" /> Changes Requested
              </span>
              <span className="font-bold text-slate-900">{metrics?.changesRequestedVendors || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-red-700 font-medium">
                <XCircle className="h-4 w-4 mr-1.5" /> Suspended Stalls
              </span>
              <span className="font-bold text-slate-900">{metrics?.suspendedVendors || 0}</span>
            </div>
          </div>
        </div>

        {/* Catalog & Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Categories & Products</h3>
            <Link to="/admin/categories" className="text-xs text-primary-600 font-bold hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Categories Configured</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {metrics?.totalCategories || 0}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-slate-300" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Products Listed</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {metrics?.totalProducts || 0}
                </p>
              </div>
              <Store className="h-8 w-8 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Moderator Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/admin/vendors?status=pending"
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold flex flex-col justify-between transition-colors"
            >
              <Clock className="h-5 w-5 text-amber-700 mb-2" />
              <span>Review Queue</span>
            </Link>
            <Link
              to="/admin/reports"
              className="p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-semibold flex flex-col justify-between transition-colors"
            >
              <AlertTriangle className="h-5 w-5 text-red-700 mb-2" />
              <span>Report Desk</span>
            </Link>
            <Link
              to="/admin/categories"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold flex flex-col justify-between transition-colors"
            >
              <ShoppingBag className="h-5 w-5 text-slate-700 mb-2" />
              <span>Categories</span>
            </Link>
            <Link
              to="/admin/users"
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-semibold flex flex-col justify-between transition-colors"
            >
              <Users className="h-5 w-5 text-blue-700 mb-2" />
              <span>User Accounts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Applications Review Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Pending Vendor Applications</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {pendingVendors.length} in queue
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Newly registered vendor stalls waiting for administrative verification before appearing in search.
            </p>
          </div>

          <Link
            to="/admin/vendors?status=pending"
            className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition-colors self-start sm:self-auto"
          >
            <span>Open Full Review Desk</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pendingVendors.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Pending Applications</p>
            <p className="text-xs text-slate-400">All vendor stalls have been reviewed and adjudicated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Stall Name & Type</th>
                  <th className="py-3 px-4">Location / Area</th>
                  <th className="py-3 px-4">Categories</th>
                  <th className="py-3 px-4">Owner Info</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingVendors.map((vendor) => (
                  <tr key={vendor.id || vendor._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{vendor.stallName}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Type: {vendor.stallType || 'permanent'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{vendor.address?.area || '—'}</div>
                      <div className="text-[11px] text-slate-400">{vendor.address?.city || 'Ahmedabad'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {vendor.categories?.map((cat) => (
                          <span
                            key={cat.id || cat._id}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{vendor.vendorId?.name || vendor.contactPublic?.phone || '—'}</div>
                      <div className="text-[11px] text-slate-400">{vendor.vendorId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/vendors?review=${vendor.id || vendor._id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Moderation Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-primary-600" />
              <span>Recent Administrative Audit Stream</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of all approval, suspension, category, and report actions executed by administrators.
            </p>
          </div>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No audit records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Details / Reason</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.targetName || '—'}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {log.targetType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{log.adminId?.name || 'Admin'}</div>
                      <div className="text-[10px] text-slate-400">{log.adminId?.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.reason || '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
