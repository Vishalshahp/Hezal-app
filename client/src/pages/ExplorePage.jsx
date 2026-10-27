import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import vendorService from '../services/vendorService';
import VendorCard from '../components/VendorCard';
import InteractiveMap from '../components/InteractiveMap';
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
  ChevronRight
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

  // Geolocation handling state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  // Load category taxonomy once
  useEffect(() => {
    async function fetchTaxonomy() {
      try {
        const res = await vendorService.getCategories();
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchTaxonomy();
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
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Explore Local Stalls
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse approved roadside vendors, discover nearby products, and get directions.
            </p>
          </div>

          {/* View Toggle (List / Map / Split on desktop) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-center">
            <button
              onClick={() => setViewMode('split')}
              title="Split View"
              className={`hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Map View"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Search Inputs Row */}
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100"
        >
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, stall name, item..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  updateUrlParams({ q: undefined, page: 1 });
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Area / Locality Search */}
          <div className="sm:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              onBlur={() => updateUrlParams({ area: selectedArea.trim() || undefined, page: 1 })}
              placeholder="Locality (e.g. Navrangpura, Vastrapur)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {selectedArea && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('');
                  updateUrlParams({ area: undefined, page: 1 });
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Submit Search Button */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>

            {(searchTerm || selectedCategory || selectedArea || userLocation) && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-800">
                <Navigation className="h-3.5 w-3.5 text-primary-600" />
                <span className="font-semibold">Location Active</span>
                <div className="flex items-center space-x-1 pl-1 border-l border-primary-200">
                  <span className="text-slate-500">Radius:</span>
                  <select
                    value={radiusKm}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value);
                      setRadiusKm(r);
                      setPage(1);
                      updateUrlParams({ radius: r, page: 1 });
                    }}
                    className="bg-transparent font-bold text-primary-900 focus:outline-none cursor-pointer"
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
                  className="p-0.5 text-primary-600 hover:text-primary-900 rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={geoLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary-400 bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {geoLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
                ) : (
                  <Navigation className="h-3.5 w-3.5 text-primary-600" />
                )}
                <span>{geoLoading ? 'Detecting coordinates...' : 'Use My Current Location'}</span>
              </button>
            )}

            {/* Area fallback indicator */}
            {selectedArea && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs">
                <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                Area: {selectedArea}
              </span>
            )}
          </div>

          {/* Results Count */}
          <div className="text-slate-500 font-medium">
            Found <span className="font-bold text-slate-900">{pagination.total}</span> approved stall{pagination.total === 1 ? '' : 's'}
          </div>
        </div>

        {/* Geolocation Notice Banner */}
        {geoNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-center justify-between">
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
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
        <div className="h-96 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="text-xs font-semibold text-slate-500">
            Discovering verified vendor stalls...
          </span>
        </div>
      ) : errorMsg ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">{errorMsg}</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Unable to connect to the discovery service. Please ensure the backend is running.
          </p>
          <button
            onClick={fetchResults}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700"
          >
            Retry Search
          </button>
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center space-y-4">
          <Store className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">No Matching Stalls Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            We couldn't find any approved vendors matching your current search criteria or distance
            radius. Try expanding your search radius, selecting a different category, or clearing
            filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
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
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="pt-4 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const p = Math.max(1, page - 1);
                          setPage(p);
                          updateUrlParams({ page: p });
                        }}
                        disabled={page <= 1}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const p = Math.min(pagination.totalPages, page + 1);
                          setPage(p);
                          updateUrlParams({ page: p });
                        }}
                        disabled={page >= pagination.totalPages}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Interactive Map */}
              <div className="lg:col-span-6 lg:sticky lg:top-24">
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
                <div className="pt-4 flex items-center justify-center space-x-3 text-xs text-slate-600">
                  <button
                    onClick={() => {
                      const p = Math.max(1, page - 1);
                      setPage(p);
                      updateUrlParams({ page: p });
                    }}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <span className="font-semibold">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const p = Math.min(pagination.totalPages, page + 1);
                      setPage(p);
                      updateUrlParams({ page: p });
                    }}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1"
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
            <div className="space-y-4">
              <InteractiveMap
                vendors={vendors}
                userLocation={userLocation}
                selectedVendor={selectedVendor}
                onSelectVendor={handleVendorSelect}
                height="650px"
              />
              <p className="text-[11px] text-center text-slate-400">
                Click any stall pin on the map to view stall name, status, categories, and direct walking directions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
