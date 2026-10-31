import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import vendorService from '../services/vendorService';
import VendorCard from '../components/VendorCard';
import InteractiveMap from '../components/InteractiveMap';
import { filterGujaratLocations } from '../data/gujaratLocations';
import {
  Search,
  MapPin,
  Navigation,
  X,
  Loader2,
  Store,
  Map as MapIcon,
  List as ListIcon,
  Columns,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles
} from 'lucide-react';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states from URL or defaults
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const areaParam = searchParams.get('area') || '';
  const latParam = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
  const lngParam = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
  const radiusParam = searchParams.get('radius') ? parseFloat(searchParams.get('radius')) : 5;
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedArea, setSelectedArea] = useState(areaParam);
  const [radiusKm, setRadiusKm] = useState(radiusParam);
  const [page, setPage] = useState(pageParam);

  // User detected coordinates (ephemeral)
  const [userLocation, setUserLocation] = useState(
    latParam && lngParam ? { latitude: latParam, longitude: lngParam } : null
  );

  // UI view layout mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('split');
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Data states
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const areaWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (areaWrapperRef.current && !areaWrapperRef.current.contains(e.target)) {
        setShowAreaSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geolocation handling state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  // Load categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await vendorService.getCategories();
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Sync internal state when URL search params change externally
  useEffect(() => {
    setSearchTerm(qParam);
    setSelectedCategory(categoryParam);
    setSelectedArea(areaParam);
    if (latParam && lngParam) {
      setUserLocation({ latitude: latParam, longitude: lngParam });
    }
  }, [qParam, categoryParam, areaParam, latParam, lngParam]);

  // Update URL search parameters
  const updateUrlParams = useCallback(
    (newParams) => {
      const current = Object.fromEntries(searchParams.entries());
      const merged = { ...current, ...newParams };

      // Clean empty keys
      const cleaned = {};
      for (const [k, v] of Object.entries(merged)) {
        if (v !== undefined && v !== null && v !== '') {
          cleaned[k] = v;
        }
      }
      setSearchParams(cleaned);
    },
    [searchParams, setSearchParams]
  );

  // Main vendor fetch function
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let res;
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Geospatial Nearby Search
        res = await vendorService.getNearbyVendors({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: radiusKm,
          q: searchTerm.trim() || undefined,
          category: selectedCategory || undefined,
          page,
          limit: 12
        });
      } else {
        // Standard Discovery / Area Search
        res = await vendorService.searchVendors({
          q: searchTerm.trim() || undefined,
          category: selectedCategory || undefined,
          area: selectedArea.trim() || undefined,
          page,
          limit: 12
        });
      }

      if (res.success && res.data) {
        setVendors(res.data.vendors || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else {
        setErrorMsg('Failed to retrieve vendor results.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMsg(err.message || 'Unable to connect to marketplace service.');
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusKm, searchTerm, selectedCategory, selectedArea, page]);

  // Execute fetch on search criteria changes
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Trigger Browser Geolocation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;
        const coords = { latitude, longitude };
        setUserLocation(coords);
        setPage(1);

        updateUrlParams({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          radius: radiusKm,
          page: 1
        });
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoNotice(
            'Location permission denied. You can continue discovering stalls using manual area or keyword search.'
          );
        } else if (err.code === 2) {
          setGeoNotice('Position unavailable. Try entering an area or locality name.');
        } else {
          setGeoNotice('Location request timed out. Please retry or search by area.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Clear Location (Switch back to general discovery)
  const handleClearLocation = () => {
    setUserLocation(null);
    setGeoNotice(null);
    setPage(1);

    const nextParams = Object.fromEntries(searchParams.entries());
    delete nextParams.lat;
    delete nextParams.lng;
    delete nextParams.radius;
    delete nextParams.nearby;
    nextParams.page = 1;
    setSearchParams(nextParams);
  };

  // Handle Search Input Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ q: searchTerm.trim() || undefined, page: 1 });
  };

  // Clear All Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedArea('');
    setUserLocation(null);
    setRadiusKm(5);
    setPage(1);
    setGeoNotice(null);
    setSelectedVendor(null);
    setSearchParams({});
  };

  // Category chip toggle
  const handleCategoryClick = (slug) => {
    const nextCat = selectedCategory === slug ? '' : slug;
    setSelectedCategory(nextCat);
    setPage(1);
    updateUrlParams({ category: nextCat || undefined, page: 1 });
  };

  // Handle Vendor Card selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Search Controls Bar */}
      <div className="bg-white rounded-3xl border border-[#E5EAE5] p-5 sm:p-7 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#16803D] uppercase tracking-wider mb-1">
              <Store className="h-3.5 w-3.5" />
              <span>Hyperlocal Stalls & Carts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#17231D] tracking-tight">
              Explore Local Stalls
            </h1>
            <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
              Browse approved roadside vendors, discover nearby products, and get direct directions.
            </p>
          </div>

          {/* View Toggle (List / Map / Split on desktop) */}
          <div className="flex items-center bg-[#FAFAF5] border border-[#E5EAE5] p-1 rounded-xl self-start md:self-center shadow-2xs">
            <button
              onClick={() => setViewMode('split')}
              title="Split View"
              className={`hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-[#17231D] shadow-xs border border-[#E5EAE5]'
                  : 'text-[#647067] hover:text-[#17231D]'
              }`}
            >
              <Columns className="h-3.5 w-3.5 text-[#16803D]" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#17231D] shadow-xs border border-[#E5EAE5]'
                  : 'text-[#647067] hover:text-[#17231D]'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5 text-[#16803D]" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Map View"
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-[#17231D] shadow-xs border border-[#E5EAE5]'
                  : 'text-[#647067] hover:text-[#17231D]'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 text-[#16803D]" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Gujarat City Hub Quick Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs pt-1">
          <span className="text-[#647067] font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center">
            <Building2 className="h-3.5 w-3.5 mr-1 text-[#16803D]" /> Gujarat Hubs:
          </span>
          {['All Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'].map((c) => {
            const isSelected =
              selectedArea.toLowerCase() === c.toLowerCase() ||
              (c === 'All Gujarat' && !selectedArea);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const targetArea = c === 'All Gujarat' ? '' : c;
                  setSelectedArea(targetArea);
                  setPage(1);
                  updateUrlParams({ area: targetArea || undefined, page: 1 });
                }}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#16803D] text-white shadow-xs'
                    : 'bg-[#FAFAF5] text-[#17231D] hover:bg-[#EDF7EF] border border-[#E5EAE5] hover:border-[#A3D5AF]'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Search Inputs Row */}
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#E5EAE5]"
        >
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#647067]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, stall name, item..."
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5]/50 focus:bg-white text-xs sm:text-sm text-[#17231D] placeholder:text-[#647067] focus:outline-none focus:border-[#16803D] focus:ring-2 focus:ring-[#16803D]/20 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  updateUrlParams({ q: undefined, page: 1 });
                }}
                className="absolute right-3 top-3.5 text-[#647067] hover:text-[#17231D]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Area / Locality Search with Gujarat Autocomplete */}
          <div ref={areaWrapperRef} className="sm:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#647067]" />
            <input
              type="text"
              value={selectedArea}
              onFocus={() => setShowAreaSuggestions(true)}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setShowAreaSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  updateUrlParams({ area: selectedArea.trim() || undefined, page: 1 });
                }, 200);
              }}
              placeholder="Locality (e.g. Navrangpura, Vastrapur)..."
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5]/50 focus:bg-white text-xs sm:text-sm text-[#17231D] placeholder:text-[#647067] focus:outline-none focus:border-[#16803D] focus:ring-2 focus:ring-[#16803D]/20 transition-all"
            />
            {selectedArea && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('');
                  updateUrlParams({ area: undefined, page: 1 });
                }}
                className="absolute right-3 top-3.5 text-[#647067] hover:text-[#17231D]"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Gujarat Suggestions Dropdown */}
            {showAreaSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#E5EAE5] shadow-card-hover max-h-64 overflow-y-auto divide-y divide-[#E5EAE5]">
                <div className="px-3.5 py-2 bg-[#FAFAF5] text-[10px] font-bold text-[#647067] uppercase tracking-wider flex items-center justify-between">
                  <span>Gujarat Areas & Landmarks</span>
                  <span className="text-[#16803D] flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> Quick Pick
                  </span>
                </div>
                {filterGujaratLocations(selectedArea, '', 7).map((item, idx) => (
                  <button
                    key={`${item.name}-${idx}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelectedArea(item.name);
                      setShowAreaSuggestions(false);
                      setPage(1);
                      if (item.coordinates && item.coordinates.length === 2) {
                        setUserLocation({ latitude: item.coordinates[1], longitude: item.coordinates[0] });
                      }
                      updateUrlParams({
                        area: item.name,
                        lat: item.coordinates ? item.coordinates[1] : undefined,
                        lng: item.coordinates ? item.coordinates[0] : undefined,
                        page: 1
                      });
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#EDF7EF] transition-colors flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-[#17231D] group-hover:text-[#16803D]">
                        {item.name}
                      </span>
                      <span className="ml-1.5 text-[11px] text-[#647067]">
                        ({item.city})
                      </span>
                      {item.description && (
                        <p className="text-[11px] text-[#647067] line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-[#16803D] font-bold opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                      Pick →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Search Button */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

            {(searchTerm || selectedCategory || selectedArea || userLocation) && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2.5 sm:p-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] text-[#647067] hover:text-[#17231D] hover:bg-[#EDF7EF] transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Location & Radius Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {userLocation ? (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EDF7EF] border border-[#D1EAD7] text-[#16803D]">
                <Navigation className="h-3.5 w-3.5 text-[#16803D]" />
                <span className="font-bold">Location Active</span>
                <div className="flex items-center space-x-1 pl-2 border-l border-[#D1EAD7]">
                  <span className="text-[#647067]">Within:</span>
                  <select
                    value={radiusKm}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value);
                      setRadiusKm(r);
                      setPage(1);
                      updateUrlParams({ radius: r, page: 1 });
                    }}
                    className="bg-transparent font-bold text-[#14532D] focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 km</option>
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                  </select>
                </div>
                <button
                  onClick={handleClearLocation}
                  title="Remove location filter"
                  className="p-0.5 text-[#16803D] hover:text-[#14532D] rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={geoLoading}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-[#E5EAE5] hover:border-[#16803D] bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] hover:text-[#16803D] font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {geoLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#16803D]" />
                ) : (
                  <Navigation className="h-3.5 w-3.5 text-[#16803D]" />
                )}
                <span>{geoLoading ? 'Detecting coordinates...' : 'Use My Current Location'}</span>
              </button>
            )}

            {/* Area fallback indicator */}
            {selectedArea && (
              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#FAFAF5] border border-[#E5EAE5] text-[#17231D] font-medium text-xs">
                <MapPin className="h-3 w-3 mr-1 text-[#16803D]" />
                Area: {selectedArea}
              </span>
            )}
          </div>

          {/* Results Count */}
          <div className="text-[#647067] font-medium text-xs">
            Found <span className="font-bold text-[#17231D]">{pagination.total}</span> local stall{pagination.total === 1 ? '' : 's'}
          </div>
        </div>

        {/* Geolocation Notice Banner */}
        {geoNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{geoNotice}</span>
            </div>
            <button
              onClick={() => setGeoNotice(null)}
              className="text-amber-600 hover:text-amber-800 font-bold"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none text-xs">
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-4 py-2 rounded-full font-bold shrink-0 transition-all cursor-pointer border ${
                !selectedCategory
                  ? 'bg-[#16803D] text-white border-[#16803D] shadow-xs'
                  : 'bg-white border-[#E5EAE5] text-[#17231D] hover:bg-[#EDF7EF] hover:border-[#D1EAD7]'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat._id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-4 py-2 rounded-full font-bold shrink-0 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#16803D] text-white border-[#16803D] shadow-xs scale-[1.02]'
                      : 'bg-white border-[#E5EAE5] text-[#17231D] hover:bg-[#EDF7EF] hover:border-[#D1EAD7]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Main Discovery View: Split / List / Map */}
      {loading ? (
        <div className="h-96 rounded-3xl bg-white border border-[#E5EAE5] flex flex-col items-center justify-center space-y-3 shadow-subtle">
          <Loader2 className="h-8 w-8 animate-spin text-[#16803D]" />
          <span className="text-xs font-semibold text-[#647067]">
            Discovering verified vendor stalls...
          </span>
        </div>
      ) : errorMsg ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-8 sm:p-12 text-center space-y-3 shadow-subtle">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-[#17231D] text-base">{errorMsg}</h3>
          <p className="text-xs text-[#647067] max-w-md mx-auto">
            Unable to connect to the discovery service. Please ensure the backend is running.
          </p>
          <div className="pt-2">
            <button
              onClick={fetchResults}
              className="px-5 py-2.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-xs"
            >
              Retry Search
            </button>
          </div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#E5EAE5] p-10 sm:p-16 text-center space-y-4 shadow-subtle">
          <div className="h-16 w-16 rounded-2xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center mx-auto">
            <Store className="h-8 w-8" />
          </div>
          <h3 className="font-extrabold text-xl font-display text-[#17231D]">No Matching Stalls Found</h3>
          <p className="text-xs sm:text-sm text-[#647067] max-w-md mx-auto leading-relaxed">
            We couldn't find any vendors matching your current search criteria or distance. Try expanding your search distance, selecting a different category, or resetting filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Split Mode (Default for desktop) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Vendor Cards List */}
              <div className="lg:col-span-6 space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {vendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      isSelected={selectedVendor && selectedVendor.id === vendor.id}
                      onSelect={() => handleVendorSelect(vendor)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pt-4 flex items-center justify-between text-xs text-[#647067] border-t border-[#E5EAE5]">
                    <span>
                      Page <strong className="text-[#17231D]">{pagination.page}</strong> of <strong className="text-[#17231D]">{pagination.totalPages}</strong>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const p = Math.max(1, page - 1);
                          setPage(p);
                          updateUrlParams({ page: p });
                        }}
                        disabled={page <= 1}
                        className="p-2.5 rounded-xl border border-[#E5EAE5] bg-white hover:bg-[#FAFAF5] disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 text-[#17231D]" />
                      </button>
                      <button
                        onClick={() => {
                          const p = Math.min(pagination.totalPages, page + 1);
                          setPage(p);
                          updateUrlParams({ page: p });
                        }}
                        disabled={page >= pagination.totalPages}
                        className="p-2.5 rounded-xl border border-[#E5EAE5] bg-white hover:bg-[#FAFAF5] disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-[#17231D]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Interactive Map */}
              <div className="lg:col-span-6 lg:sticky lg:top-24 rounded-2xl overflow-hidden border border-[#E5EAE5] shadow-card">
                <InteractiveMap
                  vendors={vendors}
                  userLocation={userLocation}
                  selectedVendor={selectedVendor}
                  onSelectVendor={handleVendorSelect}
                  height="650px"
                />
              </div>
            </div>
          )}

          {/* List Only Mode */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    isSelected={selectedVendor && selectedVendor.id === vendor.id}
                    onSelect={() => handleVendorSelect(vendor)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center space-x-3 text-xs text-[#647067] border-t border-[#E5EAE5]">
                  <button
                    onClick={() => {
                      const p = Math.max(1, page - 1);
                      setPage(p);
                      updateUrlParams({ page: p });
                    }}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-xl border border-[#E5EAE5] bg-white hover:bg-[#FAFAF5] disabled:opacity-40 flex items-center space-x-1 font-semibold text-[#17231D]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <span className="font-bold text-[#17231D] px-2">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const p = Math.min(pagination.totalPages, page + 1);
                      setPage(p);
                      updateUrlParams({ page: p });
                    }}
                    disabled={page >= pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[#E5EAE5] bg-white hover:bg-[#FAFAF5] disabled:opacity-40 flex items-center space-x-1 font-semibold text-[#17231D]"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Map Only Mode */}
          {viewMode === 'map' && (
            <div className="space-y-3">
              <div className="rounded-3xl overflow-hidden border border-[#E5EAE5] shadow-card">
                <InteractiveMap
                  vendors={vendors}
                  userLocation={userLocation}
                  selectedVendor={selectedVendor}
                  onSelectVendor={handleVendorSelect}
                  height="680px"
                />
              </div>
              <p className="text-[11px] text-center text-[#647067]">
                Click any stall pin on the map to view stall name, status, categories, and direct walking directions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
