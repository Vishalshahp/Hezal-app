import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import VendorCard from '../components/VendorCard';
import { getStallCoverImage } from '../utils/stallImages';
import {
  Search,
  Navigation,
  Store,
  Compass,
  ArrowRight,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  Apple,
  Palette,
  Shirt,
  Flower2,
  HeartHandshake
} from 'lucide-react';

// Category icon helper
function getCategoryIcon(slug = '', name = '') {
  const s = (slug + ' ' + name).toLowerCase();
  if (s.includes('food') || s.includes('chaat') || s.includes('snack') || s.includes('street')) {
    return <UtensilsCrossed className="h-5 w-5" />;
  }
  if (s.includes('chai') || s.includes('tea') || s.includes('beverage') || s.includes('coffee')) {
    return <Coffee className="h-5 w-5" />;
  }
  if (s.includes('fruit') || s.includes('vegetable') || s.includes('produce') || s.includes('sabzi')) {
    return <Apple className="h-5 w-5" />;
  }
  if (s.includes('craft') || s.includes('pottery') || s.includes('artisan') || s.includes('clay')) {
    return <Palette className="h-5 w-5" />;
  }
  if (s.includes('cloth') || s.includes('apparel') || s.includes('textile') || s.includes('garment')) {
    return <Shirt className="h-5 w-5" />;
  }
  if (s.includes('flower') || s.includes('pooja') || s.includes('plant')) {
    return <Flower2 className="h-5 w-5" />;
  }
  return <Store className="h-5 w-5" />;
}

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
          vendorService.searchVendors({ limit: 9 })
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

  // Sample or live vendor for hero showcase
  const heroVendor = featuredVendors[0] || {
    id: 'sample-1',
    stallName: 'MG Road Fresh Chaat Corner',
    tagline: 'Famous spicy pani puri, sev puri and dahi bhalla made fresh daily.',
    stallType: 'mobile',
    availabilityStatus: 'open',
    address: { area: 'MG Road', city: 'Ahmedabad' },
    distanceKm: 0.4
  };

  const heroImage = getStallCoverImage(heroVendor);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Two-Column Modern Hero Section */}
      <section className="bg-white rounded-3xl border border-[#E5EAE5] p-6 sm:p-10 lg:p-12 shadow-card relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#EDF7EF] rounded-full blur-3xl pointer-events-none opacity-60 animate-pulse-glow"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#FAFAF5] rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline, Search, and Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EDF7EF] border border-[#D1EAD7] text-[#16803D] text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16803D]"></span>
              </span>
              <span>Your neighborhood street marketplace</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display text-[#17231D] tracking-tight leading-[1.12]">
                Find Local Stalls <br className="hidden sm:inline" />
                <span className="text-[#16803D]">Near You.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#647067] max-w-xl leading-relaxed">
                Discover roadside sellers, seasonal fruit carts, traditional crafts, and neighborhood street vendors with verified locations and walking directions.
              </p>
            </div>

            {/* Prominent Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 bg-white sm:p-1.5 rounded-2xl sm:border sm:border-[#E5EAE5] sm:shadow-xs focus-within:border-[#16803D] focus-within:ring-2 focus-within:ring-[#16803D]/20 transition-all">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#647067]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, stalls, or local areas..."
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border sm:border-0 border-[#E5EAE5] bg-transparent text-sm text-[#17231D] placeholder:text-[#647067] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-sm font-semibold shadow-xs hover:shadow-sm transition-all shrink-0 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>

              {/* Supporting Secondary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleNearMeClick}
                  disabled={geoLoading}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] hover:bg-[#EDF7EF] hover:border-[#D1EAD7] text-[#17231D] font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
                >
                  {geoLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#16803D]" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 text-[#16803D]" />
                  )}
                  <span>{geoLoading ? 'Detecting coordinates...' : 'Find Stalls Near Me'}</span>
                </button>

                <Link
                  to="/explore"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-[#647067] hover:text-[#16803D] font-semibold transition-colors group"
                >
                  <Compass className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform duration-300" />
                  <span>Browse all listings</span>
                </Link>
              </div>

              {/* Popular Gujarat Localities & Khau Galli quick tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px]">
                <span className="text-[#647067] font-bold flex items-center mr-1">
                  <Sparkles className="h-3 w-3 mr-1 text-[#16803D]" /> Gujarat Hubs:
                </span>
                {[
                  { label: 'Manek Chowk', area: 'Manek Chowk' },
                  { label: 'Law Garden', area: 'Law Garden' },
                  { label: 'Vastrapur Lake', area: 'Vastrapur' },
                  { label: 'SG Highway', area: 'S.G. Highway' },
                  { label: 'Adajan (Surat)', area: 'Adajan' },
                  { label: 'Sayajigunj (Baroda)', area: 'Sayajigunj' },
                  { label: 'Race Course (Rajkot)', area: 'Yagnik Road' },
                  { label: 'Sector 21 (Gandhinagar)', area: 'Sector 21' },
                ].map((spot) => (
                  <button
                    key={spot.label}
                    type="button"
                    onClick={() => navigate(`/explore?area=${encodeURIComponent(spot.area)}`)}
                    className="px-2.5 py-1 rounded-full bg-[#FAFAF5] hover:bg-[#EDF7EF] border border-[#E5EAE5] hover:border-[#A3D5AF] text-[#17231D] hover:text-[#16803D] font-medium transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                  >
                    {spot.label}
                  </button>
                ))}
              </div>

              {geoError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{geoError}</span>
                </div>
              )}
            </form>

            {/* Direct Market Discovery Affirmation */}
            <p className="text-xs text-[#647067] pt-2 border-t border-[#E5EAE5]">
              Connecting local residents directly with independent street stalls and neighborhood artisans without markups.
            </p>
          </div>

          {/* Right Column: Realistic Marketplace Visual Preview with Subtle Floating Animation */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAFAF5] border border-[#E5EAE5] rounded-3xl p-5 sm:p-6 space-y-4 shadow-card relative animate-float-slow">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#16803D] text-white flex items-center justify-center shadow-xs">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#17231D] block leading-tight">Live Discovery Preview</span>
                    <span className="text-[11px] text-[#647067]">Neighborhood street stalls</span>
                  </div>
                </div>
                <span className="inline-flex items-center text-[11px] font-semibold text-[#16803D] bg-[#EDF7EF] border border-[#D1EAD7] px-2.5 py-0.5 rounded-full">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16803D]"></span>
                  </span>
                  Active Now
                </span>
              </div>

              {/* Sample Real Stall Preview Card with Real Photo */}
              <div className="bg-white rounded-2xl border border-[#E5EAE5] p-5 sm:p-6 space-y-4 shadow-card hover:border-[#16803D]/40 transition-all overflow-hidden group">
                {/* Stall Cover Image */}
                <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden shadow-xs">
                  <img
                    src={heroImage}
                    alt={heroVendor.stallName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#EDF7EF]/95 backdrop-blur-xs text-[#16803D] border border-[#D1EAD7]/80 shadow-2xs">
                      Street Food & Snacks
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#14532D] text-white shadow-2xs">
                      <Navigation className="h-3 w-3 mr-1 text-[#22C55E]" />
                      400 m
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#17231D] font-display">
                    {heroVendor.stallName}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#647067] line-clamp-2 leading-relaxed mt-1.5">
                    {heroVendor.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-[#E5EAE5] text-xs sm:text-sm">
                  <div className="flex items-center text-[#647067] space-x-1.5">
                    <MapPin className="h-4 w-4 text-[#16803D]" />
                    <span className="font-semibold text-[#17231D]">{heroVendor.address?.area || 'MG Road, Main Market'}</span>
                  </div>
                  <Link
                    to="/explore"
                    className="text-[#16803D] font-bold inline-flex items-center space-x-1 hover:text-[#14532D] transition-colors group/link"
                  >
                    <span>View Stall</span>
                    <ArrowRight className="h-3.5 w-3.5 group-link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Discovery Pillars */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#E5EAE5] space-y-0.5 hover:border-[#16803D]/30 transition-colors">
                  <span className="font-bold text-[#17231D] flex items-center text-[11px]">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-[#16803D]" /> Direct Directions
                  </span>
                  <span className="text-[11px] text-[#647067] block">Opens in Google Maps</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#E5EAE5] space-y-0.5 hover:border-[#16803D]/30 transition-colors">
                  <span className="font-bold text-[#17231D] flex items-center text-[11px]">
                    <Clock className="h-3.5 w-3.5 mr-1 text-[#16803D]" /> Operating Hours
                  </span>
                  <span className="text-[11px] text-[#647067] block">Updated by sellers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Section A — Browse Categories with Micro-animations */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#16803D] uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#17231D] tracking-tight">
              Browse Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
              Discover street vendors by product, trade, and daily essentials
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-[#16803D] hover:text-[#14532D] inline-flex items-center space-x-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-[#E5EAE5] animate-pulse"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id || cat._id}
                to={`/explore?category=${cat.slug}`}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-[#E5EAE5] hover:border-[#16803D] hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3.5 cursor-pointer"
              >
                <div className="h-11 w-11 rounded-xl bg-[#EDF7EF] text-[#16803D] group-hover:bg-[#16803D] group-hover:text-white group-hover:rotate-6 group-hover:scale-110 flex items-center justify-center transition-all duration-300 shrink-0 shadow-2xs">
                  {getCategoryIcon(cat.slug, cat.name)}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-sm font-bold text-[#17231D] group-hover:text-[#16803D] truncate transition-colors">
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-[#647067] group-hover:translate-x-0.5 transition-transform">
                    Browse stalls →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-[#E5EAE5] text-center text-xs text-[#647067]">
            No categories available yet.
          </div>
        )}
      </section>

      {/* 3. Section B — Nearby / Verified Vendors */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#16803D] uppercase tracking-wider mb-1">
              <Store className="h-3 w-3" />
              <span>Live Street Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#17231D] tracking-tight">
              Nearby Vendors & Stalls
            </h2>
            <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
              Verified local sellers with active schedules and confirmed locations
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-[#16803D] hover:text-[#14532D] inline-flex items-center space-x-1 transition-colors group"
          >
            <span>See More</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-[#E5EAE5] animate-pulse"
              />
            ))}
          </div>
        ) : featuredVendors.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onSelect={() => navigate(`/vendors/${vendor.id}`)}
                />
              ))}
            </div>
            <div className="text-center pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white border border-[#E5EAE5] hover:border-[#16803D] text-[#17231D] hover:text-[#16803D] font-bold text-sm shadow-card hover:shadow-card-hover transition-all group"
              >
                <span>Explore All Stalls Across Gujarat</span>
                <ArrowRight className="h-4 w-4 text-[#16803D] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E5EAE5] bg-white p-8 sm:p-12 text-center space-y-3 shadow-subtle">
            <Store className="h-10 w-10 text-[#A3D5AF] mx-auto" />
            <h3 className="font-bold text-base text-[#17231D]">
              No Stalls Published in This Area Yet
            </h3>
            <p className="text-xs text-[#647067] max-w-md mx-auto leading-relaxed">
              Vendors are registering their profiles. If you operate a stall, be the first to publish your location on Hezal Market.
            </p>
            <div className="pt-2">
              <Link
                to="/register/vendor"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#16803D] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs transition-colors"
              >
                <span>Register Your Stall</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Section C — How Hezal Market Works */}
      <section className="bg-white rounded-3xl border border-[#E5EAE5] p-6 sm:p-10 lg:p-12 shadow-card space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#16803D] uppercase tracking-wider mb-1">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Community Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#17231D] tracking-tight">
            How Hezal Market Works
          </h2>
          <p className="text-xs sm:text-sm text-[#647067] mt-1 leading-relaxed">
            Connecting you directly with roadside and seasonal stall owners in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAFAF5] border border-[#E5EAE5] space-y-3 hover:border-[#16803D]/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] font-extrabold text-sm flex items-center justify-center border border-[#D1EAD7] shadow-2xs">
              01
            </div>
            <h3 className="font-bold text-base text-[#17231D]">
              Search for Products or Stalls
            </h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              Look up street food, fresh produce, seasonal fruits, or artisan crafts in your neighborhood with real-time availability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAFAF5] border border-[#E5EAE5] space-y-3 hover:border-[#16803D]/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] font-extrabold text-sm flex items-center justify-center border border-[#D1EAD7] shadow-2xs">
              02
            </div>
            <h3 className="font-bold text-base text-[#17231D]">
              Check Published Stall Location
            </h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              View exact stall locations, operating schedules, and direct walking routes on the interactive map.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAFAF5] border border-[#E5EAE5] space-y-3 hover:border-[#16803D]/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] font-extrabold text-sm flex items-center justify-center border border-[#D1EAD7] shadow-2xs">
              03
            </div>
            <h3 className="font-bold text-base text-[#17231D]">
              Visit the Stall in Person
            </h3>
            <p className="text-xs text-[#647067] leading-relaxed">
              Buy directly from local vendors with zero middleman markups, platform cuts, or delivery commissions.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 border-t border-[#E5EAE5] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#647067]">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#16803D] shrink-0" />
            <span><strong>0% Commission:</strong> Every rupee goes directly to vendors</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#16803D] shrink-0" />
            <span><strong>Verified Profiles:</strong> Vetted street sellers across Gujarat</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#16803D] shrink-0" />
            <span><strong>Direct Contact:</strong> Free WhatsApp and Phone communication</span>
          </div>
        </div>
      </section>

      {/* 5. Section D — Vendor Onboarding Call to Action */}
      <section className="bg-gradient-to-br from-[#EDF7EF] via-[#EDF7EF] to-[#D1EAD7]/40 rounded-3xl border border-[#D1EAD7] p-8 sm:p-12 shadow-card relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#16803D] text-white shadow-2xs">
              For Stall Owners & Street Vendors
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold font-display text-[#14532D] tracking-tight">
              Bring Your Stall Online.
            </h3>
            <p className="text-xs sm:text-sm text-[#17231D]/80 leading-relaxed">
              Help thousands of nearby customers discover your stall, your products, and where you operate today. Free to register, zero transaction fees, and simple to manage on mobile.
            </p>
          </div>

          <Link
            to="/register/vendor"
            className="px-6 py-3.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all shrink-0 flex items-center space-x-2 active:scale-95 group"
          >
            <span>Register Your Stall</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
