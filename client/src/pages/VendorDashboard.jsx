import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Package,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorService.getVendorStats();
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load vendor operational statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleQuickAvailability = async (newStatus) => {
    if (!stats?.hasProfile || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      await vendorService.updateAvailability({ availabilityStatus: newStatus });
      setStats((prev) => ({ ...prev, availabilityStatus: newStatus }));
    } catch (err) {
      alert(err.message || 'Failed to update availability status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Live & Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            <span>Under Review (Pending Approval)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Changes Requested (Rejected)</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAFAF5] text-[#647067] border border-[#E5EAE5]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Suspended</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span>Profile Not Created</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-13 w-13 rounded-2xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center p-3 shadow-sm">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-[#17231D]">
                {stats?.hasProfile ? stats.stallName : user?.name}
              </h1>
              {stats && getApprovalBadge(stats.approvalStatus)}
            </div>
            <p className="text-xs text-[#647067] mt-0.5">
              Vendor Dashboard • {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 rounded-lg text-[#647067] hover:bg-[#FAFAF5] border border-[#E5EAE5] transition-colors cursor-pointer"
            title="Refresh stats"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] border border-[#E5EAE5] transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-[#647067]">
          <Loader2 className="h-8 w-8 animate-spin text-[#16803D]" />
          <p className="text-xs">Loading stall operational status...</p>
        </div>
      ) : (
        <>
          {/* Missing Profile Callout */}
          {stats && !stats.hasProfile && (
            <div className="bg-[#EDF7EF] border border-[#D1EAD7] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#14532D]">
                  You haven&apos;t created your Stall Profile yet!
                </h3>
                <p className="text-xs text-[#16803D]">
                  Set up your business name, categories, public contact, and physical stall address to start publishing items.
                </p>
              </div>
              <Link
                to="/vendor/profile"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Create Stall Profile</span>
              </Link>
            </div>
          )}

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Completion */}
            <div className="bg-white rounded-xl border border-[#E5EAE5] p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs text-[#647067]">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Profile Setup</span>
                <Layers className="h-4 w-4 text-[#16803D]" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-[#17231D]">
                  {stats?.completionPercentage ?? 0}%
                </span>
                <span className="text-xs text-[#647067] block mt-0.5">Completion score</span>
              </div>
              <div className="w-full bg-[#FAFAF5] border border-[#E5EAE5] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#16803D] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.completionPercentage ?? 0}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Total Products */}
            <div className="bg-white rounded-xl border border-[#E5EAE5] p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs text-[#647067]">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Catalogue</span>
                <Package className="h-4 w-4 text-[#16803D]" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-[#17231D]">
                  {stats?.totalProducts ?? 0}
                </span>
                <span className="text-xs text-[#647067] block mt-0.5">Total menu items</span>
              </div>
              <Link
                to="/vendor/products"
                className="text-xs font-semibold text-[#16803D] hover:text-[#14532D] inline-flex items-center space-x-1"
              >
                <span>Manage products</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Metric 3: Active Stock */}
            <div className="bg-white rounded-xl border border-[#E5EAE5] p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs text-[#647067]">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Availability</span>
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              </div>
              <div>
                <span className="text-2xl font-bold font-display text-[#16803D]">
                  {stats?.availableProducts ?? 0}
                </span>
                <span className="text-xs text-[#647067] block mt-0.5">
                  Available ({stats?.unavailableProducts ?? 0} out-of-stock)
                </span>
              </div>
              <span className="text-[11px] text-[#647067]">Items visible to customers</span>
            </div>

            {/* Metric 4: Real-time Operating Status */}
            <div className="bg-white rounded-xl border border-[#E5EAE5] p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs text-[#647067]">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Stall Status</span>
                <Clock className="h-4 w-4 text-[#647067]" />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAvailability('open')}
                  disabled={!stats?.hasProfile || updatingStatus}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    stats?.availabilityStatus === 'open'
                      ? 'bg-[#16803D] text-white shadow-sm'
                      : 'bg-[#FAFAF5] text-[#647067] hover:bg-[#EDF7EF]'
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAvailability('away')}
                  disabled={!stats?.hasProfile || updatingStatus}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    stats?.availabilityStatus === 'away'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-[#FAFAF5] text-[#647067] hover:bg-amber-50'
                  }`}
                >
                  Away
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAvailability('closed')}
                  disabled={!stats?.hasProfile || updatingStatus}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    stats?.availabilityStatus === 'closed'
                      ? 'bg-[#17231D] text-white shadow-sm'
                      : 'bg-[#FAFAF5] text-[#647067] hover:bg-slate-200'
                  }`}
                >
                  Closed
                </button>
              </div>
              <span className="text-[11px] text-[#647067] block">
                {updatingStatus ? 'Updating status...' : 'Instant customer status'}
              </span>
            </div>
          </div>

          {/* Quick Management Hub */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Stall Profile */}
            <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-[#16803D]/40 transition-colors">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#17231D] font-display">Stall Profile</h3>
                <p className="text-xs text-[#647067] leading-relaxed">
                  Update your business name, tagline, description, cover photo, and customer contact numbers.
                </p>
              </div>
              <Link
                to="/vendor/profile"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#16803D] bg-[#EDF7EF] hover:bg-[#E2F3E6] border border-[#D1EAD7] p-3 rounded-xl transition-colors"
              >
                <span>{stats?.hasProfile ? 'Edit Profile' : 'Setup Profile'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 2: Products Catalogue */}
            <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-[#16803D]/40 transition-colors">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#17231D] font-display">Product Catalogue</h3>
                <p className="text-xs text-[#647067] leading-relaxed">
                  Add products, set optional prices, upload photos, and toggle live stock availability.
                </p>
              </div>
              <Link
                to="/vendor/products"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#16803D] bg-[#EDF7EF] hover:bg-[#E2F3E6] border border-[#D1EAD7] p-3 rounded-xl transition-colors"
              >
                <span>Manage Catalogue ({stats?.totalProducts ?? 0} items)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 3: Location & Hours */}
            <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-[#16803D]/40 transition-colors">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#17231D] font-display">Stall Location & Hours</h3>
                <p className="text-xs text-[#647067] leading-relaxed">
                  Publish your stall coordinates, operating street address, and weekly opening schedule.
                </p>
              </div>
              <Link
                to="/vendor/location"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#16803D] bg-[#EDF7EF] hover:bg-[#E2F3E6] border border-[#D1EAD7] p-3 rounded-xl transition-colors"
              >
                <span>Update Location & Schedule</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
