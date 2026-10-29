import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import VendorCard from '../components/VendorCard';
import {
  Search,
  Navigation,
  Store,
  Compass,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  Coffee,
  Apple,
  UtensilsCrossed,
  Palette,
  Shirt,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [catRes, vendorRes] = await Promise.allSettled([
          vendorService.getCategories(),
          vendorService.searchVendors({ limit: 6 })
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data?.categories) {
          setCategories(catRes.value.data.categories);
        }

        if (vendorRes.status === 'fulfilled' && vendorRes.value?.data?.vendors) {
          setFeaturedVendors(vendorRes.value.data.vendors);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // Handle "Near Me" Location Detection
  const handleNearMeClick = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your current browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;
        navigate(
          `/explore?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}&nearby=true`
        );
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === 1) {
          setGeoError(
            'Location permission was denied. You can still discover stalls using the search bar or area filter below.'
          );
        } else if (error.code === 2) {
          setGeoError('Location position is unavailable. Please try an area search.');
        } else {
          setGeoError('Location request timed out. Please try again or search by area.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Category Icon & Color Theme Matcher
  const getCategoryTheme = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('food') || lower.includes('chaat') || lower.includes('snack')) {
      return {
        icon: <UtensilsCrossed className="h-5 w-5" />,
        bg: 'bg-amber-50 group-hover:bg-amber-500',
        text: 'text-amber-600 group-hover:text-white',
        border: 'hover:border-amber-400',
        badge: 'Street Food'
      };
    }
    if (lower.includes('fruit') || lower.includes('veg') || lower.includes('organic')) {
      return {
        icon: <Apple className="h-5 w-5" />,
        bg: 'bg-emerald-50 group-hover:bg-emerald-500',
        text: 'text-emerald-600 group-hover:text-white',
        border: 'hover:border-emerald-400',
        badge: 'Fresh Daily'
      };
    }
    if (lower.includes('tea') || lower.includes('chai') || lower.includes('coffee') || lower.includes('beverage')) {
      return {
        icon: <Coffee className="h-5 w-5" />,
        bg: 'bg-orange-50 group-hover:bg-orange-500',
        text: 'text-orange-600 group-hover:text-white',
        border: 'hover:border-orange-400',
        badge: 'Hot & Fresh'
      };
    }
    if (lower.includes('craft') || lower.includes('art') || lower.includes('pottery') || lower.includes('handmade')) {
      return {
        icon: <Palette className="h-5 w-5" />,
        bg: 'bg-rose-50 group-hover:bg-rose-500',
        text: 'text-rose-600 group-hover:text-white',
        border: 'hover:border-rose-400',
        badge: 'Handcrafted'
      };
    }
    if (lower.includes('cloth') || lower.includes('apparel') || lower.includes('fashion') || lower.includes('textile')) {
      return {
        icon: <Shirt className="h-5 w-5" />,
        bg: 'bg-indigo-50 group-hover:bg-indigo-500',
        text: 'text-indigo-600 group-hover:text-white',
        border: 'hover:border-indigo-400',
        badge: 'Local Wear'
      };
    }
    return {
      icon: <Store className="h-5 w-5" />,
      bg: 'bg-teal-50 group-hover:bg-teal-500',
      text: 'text-teal-600 group-hover:text-white',
      border: 'hover:border-teal-400',
      badge: 'Local Stall'
    };
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero & Search Section */}
      <section className="relative rounded-3xl gradient-hero text-white px-6 py-16 sm:py-24 overflow-hidden shadow-2xl border border-emerald-800/40">
        {/* Ambient background blur elements */}
        <div className="absolute top-0 -left-12 w-80 h-80 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto text-center space-y-7">
          {/* Tag badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Hyper-Local Marketplace Discovery</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-tight">
            Discover Local. <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">Shop Nearby.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed font-sans">
            Find small roadside vendors, artisan stalls, and fresh pushcarts near you with
            verified self-reported coordinates and direct walking directions.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pani Puri, Clay Pots, Navrangpura, Fruits..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-3 focus:ring-emerald-400 shadow-lg font-sans transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-bold shadow-lg shadow-primary-900/40 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              <span>Search Stalls</span>
            </button>
          </form>

          {/* Quick Actions (Location detection & Explore) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleNearMeClick}
              disabled={geoLoading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold backdrop-blur-md transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
              ) : (
                <Navigation className="h-4 w-4 text-emerald-300" />
              )}
              <span>{geoLoading ? 'Detecting Location...' : 'Find Stalls Near Me'}</span>
            </button>

            <Link
              to="/explore"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 font-semibold backdrop-blur-md transition-all hover:scale-[1.02]"
            >
              <Compass className="h-4 w-4 text-amber-300" />
              <span>Browse All Vendors</span>
            </Link>
          </div>

          {/* Value props micro-pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-emerald-100/90 border-t border-white/10 max-w-lg mx-auto">
            <span className="flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
              Live Self-Reported GPS
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-300 mr-1.5" />
              100% Free for Street Sellers
            </span>
            <span className="flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-300 mr-1.5" />
              Direct Walking Directions
            </span>
          </div>

          {/* Geolocation Notice / Error */}
          {geoError && (
            <div className="max-w-lg mx-auto bg-amber-500/20 border border-amber-300/40 rounded-xl p-3 text-amber-200 text-xs flex items-center space-x-2 text-left animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-300" />
              <span>{geoError}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Popular Categories Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-primary-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Market Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover street vendors by their trade, spices, crafts, and fresh produce
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center space-x-1.5 group"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => {
              const theme = getCategoryTheme(cat.name);
              return (
                <Link
                  key={cat.id || cat._id}
                  to={`/explore?category=${cat.slug}`}
                  className={`group p-4 rounded-2xl bg-white border border-slate-200/90 ${theme.border} hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center space-x-3.5`}
                >
                  <div className={`h-11 w-11 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center transition-all duration-300 shrink-0 shadow-2xs`}>
                    {theme.icon}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-sm font-bold text-slate-900 group-hover:text-primary-600 truncate transition-colors">
                      {cat.name}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-medium">Browse stalls</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
            Categories taxonomy loading or not configured yet.
          </div>
        )}
      </section>

      {/* 3. Featured Verified Vendors */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Near & Verified</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Verified Local Stalls
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Approved street vendors with active schedules and physical locations
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center space-x-1.5 group"
          >
            <span>See More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : featuredVendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onSelect={() => navigate(`/vendors/${vendor.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
            <Store className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">
              No Approved Vendor Stalls Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vendors are currently registering their profiles. For local development, seed
              sample stalls using <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">npm run seed:vendors</code>.
            </p>
            <div className="pt-2">
              <Link
                to="/register/vendor"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 shadow-sm"
              >
                <span>Register as First Vendor</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Vendor Call-to-Action Banner */}
      <section className="relative rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-700 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/25">
              <Sparkles className="h-3 w-3 mr-1.5 text-amber-200" /> For Local Vendors & Stalls
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Are you a local street seller or stall operator?
            </h3>
            <p className="text-xs sm:text-sm text-amber-50 max-w-xl leading-relaxed">
              Publish your stall coordinates, operating hours, and daily catalogue for free.
              Help local customers find you and navigate straight to your stall.
            </p>
          </div>

          <Link
            to="/register/vendor"
            className="px-7 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-50 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all shrink-0 flex items-center space-x-2 group hover:scale-[1.03]"
          >
            <span>Register Your Stall</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 5. Architectural Non-Scope Boundaries Box */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Hezal Market — Discovery Platform Architecture</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-950 block mb-1">
              📍 Discovery, Not Delivery
            </span>
            Directs shoppers to physical street vendors via self-reported GPS coordinates.
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <span className="font-bold text-indigo-950 block mb-1">
              🛡️ Ephemeral Location Access
            </span>
            Browser coordinates are used strictly on-demand for nearby search and never tracked in the background.
          </div>
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <span className="font-bold text-amber-950 block mb-1">
              ⛔ Strict Scope Limits
            </span>
            No payment gateways, commissions, order checkouts, or continuous GPS surveillance.
          </div>
        </div>
      </section>
    </div>
  );
}
