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
  AlertCircle
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

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero & Search Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-primary-900 via-primary-800 to-slate-900 text-white px-6 py-16 sm:py-20 overflow-hidden shadow-xl">
        {/* Background decorative blur shapes */}
        <div className="absolute top-0 -left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 -right-10 w-80 h-80 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          {/* Tag badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-primary-200 text-xs font-semibold">
            <Compass className="h-4 w-4 text-primary-300" />
            <span>Hyper-Local Marketplace Discovery</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
            Discover Local. <span className="text-primary-300">Shop Nearby.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Find small roadside vendors, artisan stalls, and fresh pushcarts near you with
            verified self-reported coordinates and direct walking directions.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pani Puri, Clay Pots, Navrangpura, Fruits..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-md font-sans"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
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
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold backdrop-blur transition-all disabled:opacity-50 cursor-pointer"
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-300" />
              ) : (
                <Navigation className="h-4 w-4 text-primary-300" />
              )}
              <span>{geoLoading ? 'Detecting Location...' : 'Find Stalls Near Me'}</span>
            </button>

            <Link
              to="/explore"
              className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 font-semibold transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>Browse All Vendors</span>
            </Link>
          </div>

          {/* Geolocation Notice / Error */}
          {geoError && (
            <div className="max-w-lg mx-auto bg-amber-500/20 border border-amber-300/30 rounded-xl p-3 text-amber-200 text-xs flex items-center space-x-2 text-left">
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
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover street vendors by their trade and products
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
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
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id || cat._id}
                to={`/explore?category=${cat.slug}`}
                className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-primary-400 hover:shadow-md transition-all flex items-center space-x-3.5"
              >
                <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-sm font-bold text-slate-900 group-hover:text-primary-600 truncate">
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-slate-400">Browse stalls</span>
                </div>
              </Link>
            ))}
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
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Verified Local Stalls
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Approved street vendors with active schedules and physical locations
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center space-x-1"
          >
            <span>See More</span>
            <ArrowRight className="h-4 w-4" />
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
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700"
              >
                <span>Register as First Vendor</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Vendor Call-to-Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-primary-600 text-white p-8 sm:p-10 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              <Sparkles className="h-3 w-3 mr-1" /> For Local Vendors
            </span>
            <h3 className="text-2xl font-bold font-display text-white">
              Are you a local street seller or stall operator?
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Publish your stall coordinates, operating hours, and daily catalogue for free.
              Help local customers find you and navigate straight to your stall.
            </p>
          </div>

          <Link
            to="/register/vendor"
            className="px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-bold text-sm shadow-md transition-all shrink-0 flex items-center space-x-2"
          >
            <span>Register Your Stall</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 5. Architectural Non-Scope Boundaries Box */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Hezal Market — Discovery Platform Architecture</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">
              📍 Discovery, Not Delivery
            </span>
            Directs shoppers to physical street vendors via self-reported GPS coordinates.
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">
              🛡️ Ephemeral Location Access
            </span>
            Browser coordinates are used strictly on-demand for nearby search and never tracked in the background.
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">
              ⛔ Strict Scope Limits
            </span>
            No payment gateways, commissions, order checkouts, or continuous GPS surveillance.
          </div>
        </div>
      </section>
    </div>
  );
}
