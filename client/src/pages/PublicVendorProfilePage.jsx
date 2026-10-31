import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import InteractiveMap from '../components/InteractiveMap';
import ReportModal from '../components/ReportModal';
import { getImageUrl } from '../utils/imageUrl';
import { getStallCoverImage, getProductCoverImage } from '../utils/stallImages';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Search,
  ShieldCheck,
  Truck,
  Sparkles
} from 'lucide-react';

export default function PublicVendorProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    async function loadStall() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await vendorService.getPublicProfile(id);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setProducts(res.data.products || []);
        } else {
          setErrorMsg(res.message || 'Vendor stall not found.');
        }
      } catch (err) {
        console.error('Failed to load vendor stall profile:', err);
        setErrorMsg(
          err.message || 'This vendor stall is currently not publicly available or pending review.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadStall();
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 rounded-3xl bg-white border border-[#E5EAE5] flex flex-col items-center justify-center space-y-3 shadow-card">
        <Loader2 className="h-8 w-8 animate-spin text-[#16803D]" />
        <span className="text-xs font-semibold text-[#647067]">
          Loading vendor stall details...
        </span>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-2xl mx-auto my-12 rounded-3xl bg-white border border-[#E5EAE5] p-10 sm:p-14 text-center space-y-4 shadow-card">
        <div className="h-16 w-16 rounded-2xl bg-[#FAFAF5] text-[#647067] border border-[#E5EAE5] flex items-center justify-center mx-auto">
          <Store className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#17231D]">
          Vendor Stall Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-[#647067] leading-relaxed max-w-md mx-auto">
          {errorMsg || 'The requested vendor stall profile is not available or has not yet been approved.'}
        </p>
        <div className="pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#16803D] text-white text-xs sm:text-sm font-semibold hover:bg-[#14532D] shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Explore Stalls</span>
          </Link>
        </div>
      </div>
    );
  }

  // Directions URL
  const getDirectionsUrl = () => {
    if (profile.location?.coordinates && profile.location.coordinates.length === 2) {
      const [lng, lat] = profile.location.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const addressStr = [profile.address?.street, profile.address?.area, profile.address?.city]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr)}`;
  };

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Check today's day of week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = daysOfWeek[new Date().getDay()];

  // Filter products by keyword
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#647067] hover:text-[#16803D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* 1. Stall Hero & Identification Card */}
      <div className="bg-white rounded-3xl border border-[#E5EAE5] overflow-hidden shadow-card">
        {/* Cover Photo */}
        <div className="relative h-60 sm:h-80 lg:h-96 bg-[#14532D] overflow-hidden group">
          {getStallCoverImage(profile) ? (
            <img
              src={getStallCoverImage(profile)}
              alt={profile.stallName}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.classList.remove('hidden');
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : null}

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30 pointer-events-none"></div>

          {/* Artistic Fallback Cover */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center text-white p-6 bg-gradient-to-br from-[#14532D] via-[#16803D] to-[#0E3B20] relative ${
              getStallCoverImage(profile) ? 'hidden' : ''
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.15),transparent)] pointer-events-none"></div>
            <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3">
              <Store className="h-10 w-10 text-[#22C55E]" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              Verified Local Street Stall
            </span>
            <span className="text-xs text-white/75 mt-1 flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-[#22C55E]" /> Hyperlocal Community Directory
            </span>
          </div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex flex-wrap items-center gap-2">
              {profile.availabilityStatus === 'open' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#16803D] text-white shadow-sm">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Open Now
                </span>
              )}
              {profile.availabilityStatus === 'away' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Away Temporarily
                </span>
              )}
              {profile.availabilityStatus === 'closed' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#17231D]/90 backdrop-blur text-white shadow-sm">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Closed
                </span>
              )}

              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur text-white">
                {profile.stallType === 'mobile' ? (
                  <>
                    <Truck className="h-3.5 w-3.5 mr-1.5 text-[#22C55E]" />
                    Mobile Pushcart / Stall
                  </>
                ) : (
                  <>
                    <Store className="h-3.5 w-3.5 mr-1.5 text-[#22C55E]" />
                    Fixed Kiosk / Stand
                  </>
                )}
              </span>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur border border-white/30 text-white">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-[#22C55E]" />
              Verified Vendor
            </span>
          </div>
        </div>

        {/* Stall Details Header */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Category chips */}
              {profile.categories && profile.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.categories.map((c) => (
                    <span
                      key={c.id || c._id}
                      className="px-3 py-1 rounded-lg bg-[#EDF7EF] border border-[#D1EAD7] text-[#16803D] text-xs font-bold"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#17231D] tracking-tight leading-tight">
                {profile.stallName}
              </h1>

              {profile.tagline && (
                <p className="text-sm sm:text-base font-semibold text-[#16803D]">
                  {profile.tagline}
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#647067] leading-relaxed pt-1">
                {profile.description}
              </p>
            </div>

            {/* Quick Actions (Directions & Contact) */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[240px]">
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Walking Directions</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/70" />
              </a>

              {profile.contactPublic?.whatsapp && (
                <a
                  href={`https://wa.me/${profile.contactPublic.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-[#D1EAD7] bg-[#EDF7EF] text-[#16803D] hover:bg-[#D1EAD7]/60 text-xs sm:text-sm font-bold transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-[#16803D]" />
                  <span>WhatsApp Inquiry</span>
                </a>
              )}

              {profile.contactPublic?.phone && (
                <a
                  href={`tel:${profile.contactPublic.phone}`}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] hover:bg-[#FAFAF5] text-xs sm:text-sm font-semibold transition-all"
                >
                  <Phone className="h-4 w-4 text-[#16803D]" />
                  <span>Call: {profile.contactPublic.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Location & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Map & Physical Stall Location */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5EAE5] p-6 sm:p-8 space-y-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#EDF7EF] text-[#16803D] flex items-center justify-center border border-[#D1EAD7]">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#17231D] font-display">
                  Published Physical Stall Location
                </h3>
              </div>

              {profile.locationUpdatedAt && (
                <span className="text-[11px] text-[#647067] font-medium">
                  Updated: {formatLastUpdated(profile.locationUpdatedAt)}
                </span>
              )}
            </div>

            {/* Address Details */}
            <div className="p-4 rounded-2xl bg-[#FAFAF5] border border-[#E5EAE5] text-xs text-[#17231D] space-y-1.5">
              <p className="font-bold text-[#17231D] text-sm">{profile.address?.street}</p>
              <p className="text-[#647067]">
                {profile.address?.area}, {profile.address?.city}, {profile.address?.state}{' '}
                {profile.address?.postalCode}
              </p>
              {profile.address?.landmark && (
                <p className="text-[#16803D] font-medium flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" /> Landmark: {profile.address.landmark}
                </p>
              )}
            </div>

            {/* Interactive Leaflet Map */}
            {profile.location?.coordinates && (
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden border border-[#E5EAE5]">
                  <InteractiveMap
                    vendors={[profile]}
                    height="340px"
                    selectedVendor={profile}
                  />
                </div>
                <p className="text-[11px] text-[#647067] text-center">
                  Walking directions open directly in your device Google Maps app.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5EAE5] p-6 sm:p-8 space-y-5 shadow-card">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#EDF7EF] text-[#16803D] flex items-center justify-center border border-[#D1EAD7]">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#17231D] font-display">
                Weekly Operating Hours
              </h3>
            </div>

            <div className="divide-y divide-[#E5EAE5] text-xs">
              {profile.openingHours && profile.openingHours.length > 0 ? (
                profile.openingHours.map((h, idx) => {
                  const isToday =
                    h.day?.toLowerCase().startsWith(todayStr.toLowerCase()) ||
                    todayStr.toLowerCase().startsWith(h.day?.toLowerCase() || '');
                  return (
                    <div
                      key={idx}
                      className={`py-3 flex items-center justify-between px-2 rounded-lg transition-colors ${
                        isToday ? 'bg-[#EDF7EF]/60 font-semibold text-[#14532D]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-16 ${isToday ? 'font-bold text-[#14532D]' : 'font-medium text-[#17231D]'}`}>
                          {h.day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] uppercase font-extrabold bg-[#16803D] text-white px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>

                      {h.isClosed ? (
                        <span className="text-red-600 font-semibold">Closed</span>
                      ) : (
                        <span className={`font-mono ${isToday ? 'text-[#14532D] font-bold' : 'text-[#647067]'}`}>
                          {h.open} — {h.close}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#647067] py-3">Schedule not specified.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Catalogue Section */}
      <div className="bg-white rounded-3xl border border-[#E5EAE5] p-6 sm:p-8 lg:p-10 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#EDF7EF] text-[#16803D] flex items-center justify-center border border-[#D1EAD7]">
                <Package className="h-4 w-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#17231D]">
                Stall Product Catalogue
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#647067] mt-1">
              Browse available items currently offered at this stall
            </p>
          </div>

          {/* Product Search */}
          {products.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#647067]" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] text-xs text-[#17231D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-all"
              />
            </div>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-[#E5EAE5] bg-white p-5 space-y-3.5 hover:border-[#16803D]/40 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {prod.image || getProductCoverImage(prod) ? (
                    <div className="h-44 rounded-xl overflow-hidden bg-[#FAFAF5]">
                      <img
                        src={prod.image ? getImageUrl(prod.image) : getProductCoverImage(prod)}
                        alt={prod.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-gradient-to-br from-[#EDF7EF] to-[#FAFAF5] border border-[#D1EAD7]/50 flex items-center justify-center text-[#16803D]">
                      <Package className="h-8 w-8 opacity-70" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center text-[10px] font-bold text-[#16803D] bg-[#EDF7EF] border border-[#D1EAD7] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> In Stock
                    </span>

                    {prod.category?.name && (
                      <span className="text-[10px] font-semibold text-[#647067] bg-[#FAFAF5] border border-[#E5EAE5] px-2.5 py-0.5 rounded-md">
                        {prod.category.name}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-[#17231D] leading-tight font-display">
                    {prod.name}
                  </h4>

                  {prod.description && (
                    <p className="text-xs text-[#647067] line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5EAE5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#647067]">Price</span>
                  {prod.price !== null && prod.price !== undefined ? (
                    <span className="font-bold text-lg text-[#16803D]">₹{prod.price}</span>
                  ) : (
                    <span className="text-xs font-medium text-[#647067] italic">
                      Price on request / variable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#FAFAF5] rounded-2xl border border-[#E5EAE5] space-y-2">
            <Package className="h-8 w-8 text-[#647067]/40 mx-auto" />
            <p className="text-xs text-[#647067]">
              {productSearch
                ? `No products match "${productSearch}".`
                : 'This vendor has not published any active items to their catalogue yet.'}
            </p>
          </div>
        )}

        {/* Community Moderation Footer */}
        <div className="pt-6 border-t border-[#E5EAE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#647067] gap-3">
          <span>Notice something wrong with this stall's location or listing?</span>
          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center space-x-1.5 text-[#17231D] hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg border border-[#E5EAE5] hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span>Report Inaccurate Listing</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetVendorId={id}
        stallName={profile?.stallName || 'Vendor Stall'}
      />
    </div>
  );
}
