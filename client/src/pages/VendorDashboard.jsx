import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import authService from '../services/authService';
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
  Plus,
  QrCode,
  Printer,
  Navigation,
  X,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [standeeOpen, setStandeeOpen] = useState(false);
  const [gpsUpdating, setGpsUpdating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState(null);

  // 2FA Google Authenticator state
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleOpen2FAModal = async () => {
    setTwoFactorModalOpen(true);
    setTwoFactorError('');
    setTwoFactorSuccess(false);
    setTwoFactorCode('');
    setTwoFactorLoading(true);
    try {
      const res = await authService.get2FASetup();
      if (res.success && res.data) {
        setTwoFactorData(res.data);
      }
    } catch (err) {
      setTwoFactorError(err.message || 'Failed to initiate 2FA setup');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorCode.trim() || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code from Google Authenticator.');
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      await authService.verify2FASetup(twoFactorData.secret, twoFactorCode.trim());
      setTwoFactorSuccess(true);
    } catch (err) {
      setTwoFactorError(err.message || 'Invalid 6-digit code. Please check your app.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleQuickLocationUpdate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsUpdating(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await vendorService.updateLocation({
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          });
          setGpsNotice(
            `Spot location updated successfully! Coordinates: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`
          );
          fetchStats();
        } catch (err) {
          alert(err.message || 'Failed to update stall coordinates.');
        } finally {
          setGpsUpdating(false);
        }
      },
      (err) => {
        setGpsUpdating(false);
        alert('Could not access current location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
                  onClick={() => handleQuickAvailability('sold_out')}
                  disabled={!stats?.hasProfile || updatingStatus}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    stats?.availabilityStatus === 'sold_out'
                      ? 'bg-rose-700 text-white shadow-sm'
                      : 'bg-[#FAFAF5] text-rose-700 hover:bg-rose-50'
                  }`}
                  title="Mark today's fresh batch as sold out"
                >
                  Sold Out
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

          {/* Pushcart Instant GPS Update & Counter QR Standee Generator */}
          {stats?.hasProfile && (
            <div className="bg-gradient-to-r from-[#14532D] via-[#16803D] to-[#0E3B20] text-white rounded-2xl p-5 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#86EFAC] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Street Vendor On-Spot Tools</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-display">
                  Live Thela Parking & Printable Counter Standee
                </h3>
                <p className="text-xs text-white/80 max-w-xl">
                  Moved your pushcart to an evening market spot? Lock your live GPS coordinates in 1 tap, or generate a counter QR poster for your stall.
                </p>
                {gpsNotice && (
                  <p className="text-xs text-[#86EFAC] font-semibold pt-1 flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {gpsNotice}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickLocationUpdate}
                  disabled={gpsUpdating}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#14532D] hover:bg-[#FAFAF5] text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {gpsUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#16803D]" />
                  ) : (
                    <Navigation className="h-4 w-4 text-[#16803D]" />
                  )}
                  <span>{gpsUpdating ? 'Detecting...' : 'Lock My Spot Now (1-Tap GPS)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStandeeOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-white border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Printer className="h-4 w-4 text-[#86EFAC]" />
                  <span>Print Stall QR Standee</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpen2FAModal}
                  className="px-4 py-2.5 rounded-xl bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-white border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Smartphone className="h-4 w-4 text-[#86EFAC]" />
                  <span>Google Authenticator (2FA)</span>
                </button>
              </div>
            </div>
          )}

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

      {/* 1-Click Printable Counter Standee Modal */}
      {standeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E5EAE5] text-center relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setStandeeOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Counter Poster Card */}
            <div className="border-4 border-[#16803D] rounded-2xl p-6 bg-gradient-to-b from-[#FAFAF5] to-white space-y-4 shadow-sm">
              <div className="flex items-center justify-center space-x-2 text-[#16803D] font-bold text-xs uppercase tracking-widest">
                <Store className="h-4 w-4" />
                <span>Hezal Verified Street Stall</span>
              </div>

              <div>
                <h2 className="text-2xl font-black font-display text-[#17231D]">
                  {stats?.stallName || user?.name}
                </h2>
                <p className="text-xs text-[#16803D] font-bold mt-0.5">
                  Direct Street Counter • 0% Delivery Markup
                </p>
              </div>

              {/* QR Code */}
              <div className="h-52 w-52 mx-auto rounded-2xl bg-white p-3 border-2 border-dashed border-[#16803D] flex items-center justify-center shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    (typeof window !== 'undefined' ? window.location.origin : 'https://hezal-market.vercel.app') +
                      '/vendors/' +
                      (stats?.profileId || stats?.id || 'public')
                  )}`}
                  alt="Stall Menu QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-extrabold text-[#17231D] block">
                  Scan to View Live Menu & Counter Prices
                </span>
                <span className="text-[#647067] block text-[11px]">
                  Pay Directly via UPI QR or Cash • No Middleman Commission
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setStandeeOpen(false)}
                className="flex-1 py-3 rounded-xl border border-[#E5EAE5] text-xs font-bold text-[#17231D] hover:bg-[#FAFAF5]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Authenticator 2FA Setup Modal */}
      {twoFactorModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5EAE5] space-y-5 text-[#17231D] relative">
            <button
              type="button"
              onClick={() => setTwoFactorModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center shadow-2xs">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold font-display text-lg sm:text-xl text-[#17231D]">
                  Google Authenticator 2FA
                </h3>
                <p className="text-xs text-[#647067]">
                  Log in with 6-digit phone code without typing passwords
                </p>
              </div>
            </div>

            {twoFactorError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{twoFactorError}</span>
              </div>
            )}

            {twoFactorSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-base text-[#17231D]">2FA Activated Successfully!</h4>
                <p className="text-xs text-[#647067] max-w-xs mx-auto">
                  From now on, you can sign in directly using your 6-digit Google Authenticator code without typing a password every time.
                </p>
                <button
                  type="button"
                  onClick={() => setTwoFactorModalOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#16803D] text-white text-xs font-bold hover:bg-[#14532D] shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : twoFactorLoading && !twoFactorData ? (
              <div className="text-center py-10 space-y-2">
                <Loader2 className="h-7 w-7 text-[#16803D] animate-spin mx-auto" />
                <p className="text-xs text-[#647067]">Generating secure 2FA keys...</p>
              </div>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-3 text-center">
                  <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-[#16803D]/30 inline-block shadow-2xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        twoFactorData?.otpAuthUri || ''
                      )}`}
                      alt="Google Authenticator QR Code"
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-[#647067]">
                    1. Open <strong>Google Authenticator</strong> on your phone and tap <strong>+ (Scan QR code)</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#647067]">
                    Can't scan? Enter key manually:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={twoFactorData?.secret || ''}
                      className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-[#E5EAE5] rounded-xl text-slate-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(twoFactorData?.secret || '');
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="px-3 py-2 rounded-xl border border-[#E5EAE5] text-xs font-bold text-[#17231D] hover:bg-[#FAFAF5] flex items-center space-x-1"
                    >
                      {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-[#17231D]">
                    2. Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-2.5 px-3 text-center text-lg font-mono font-bold tracking-[0.3em] bg-white border border-[#E5EAE5] rounded-xl text-[#16803D] focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={twoFactorLoading || twoFactorCode.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {twoFactorLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Verify Code & Enable Passwordless Login</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
