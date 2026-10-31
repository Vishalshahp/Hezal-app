import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import VendorCard from '../components/VendorCard';
import InteractiveMap from '../components/InteractiveMap';
import { filterGujaratLocations } from '../data/gujaratLocations';
import { FAMOUS_HUBS } from '../data/marketHubs';
import { calculateDistanceKm, getNavigationUrl } from '../utils/distance';
import { getStallCoverImage } from '../utils/stallImages';
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
  Sparkles,
  Flame,
  Footprints,
  Compass,
  ArrowUpDown,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search filter states from URL or defaults
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const areaParam = searchParams.get('area') || '';
  const hubParam = searchParams.get('hub') || '';
  const openParam = searchParams.get('open') === 'true';
  const latParam = searchParams.get('lat') ? parseFloat(searchParams.get('lat')) : null;
  const lngParam = searchParams.get('lng') ? parseFloat(searchParams.get('lng')) : null;
  const radiusParam = searchParams.get('radius') ? parseFloat(searchParams.get('radius')) : 5;
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedArea, setSelectedArea] = useState(areaParam);
  const [selectedHub, setSelectedHub] = useState(hubParam);
  const [onlyOpenNow, setOnlyOpenNow] = useState(openParam);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [radiusKm, setRadiusKm] = useState(radiusParam);
  const [page, setPage] = useState(pageParam);

  // User detected coordinates (ephemeral)
  const [userLocation, setUserLocation] = useState(
    latParam && lngParam ? { latitude: latParam, longitude: lngParam } : null
  );

  // UI view layout mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('split');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);

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
    setSelectedHub(hubParam);
    setOnlyOpenNow(openParam);
    if (latParam && lngParam) {
      setUserLocation({ latitude: latParam, longitude: lngParam });
      setSortByNearest(true);
    }
  }, [qParam, categoryParam, areaParam, hubParam, openParam, latParam, lngParam]);

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
          limit: 18
        });
      } else {
        // Standard Discovery / Area Search
        res = await vendorService.searchVendors({
          q: searchTerm.trim() || undefined,
          category: selectedCategory || undefined,
          area: selectedArea.trim() || undefined,
          page,
          limit: 18
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
        setSortByNearest(true);
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
    setSortByNearest(false);
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
    setSelectedHub('');
    setOnlyOpenNow(false);
    setUserLocation(null);
    setSortByNearest(false);
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

  // Famous Street Hub chip toggle
  const handleHubClick = (hub) => {
    if (selectedHub === hub.id) {
      setSelectedHub('');
      setSelectedArea('');
      updateUrlParams({ hub: undefined, area: undefined, page: 1 });
    } else {
      setSelectedHub(hub.id);
      setSelectedArea(hub.areaKeyword);
      setPage(1);
      updateUrlParams({ hub: hub.id, area: hub.areaKeyword, page: 1 });
    }
  };

  // Filter & Sort Vendors in memory
  const displayedVendors = useMemo(() => {
    let list = [...vendors];

    // Filter by Open Now
    if (onlyOpenNow) {
      list = list.filter((v) => v.availabilityStatus === 'open');
    }

    // Sort by nearest distance if enabled & userLocation known
    if (sortByNearest && userLocation?.latitude && userLocation?.longitude) {
      list.sort((a, b) => {
        const aCoords = a.location?.coordinates;
        const bCoords = b.location?.coordinates;
        const distA =
          aCoords && aCoords.length === 2
            ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, aCoords[1], aCoords[0])
            : 999999;
        const distB =
          bCoords && bCoords.length === 2
            ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, bCoords[1], bCoords[0])
            : 999999;
        return distA - distB;
      });
    }

    return list;
  }, [vendors, onlyOpenNow, sortByNearest, userLocation]);

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
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#16803D] uppercase tracking-wider mb-1">
              <Store className="h-3.5 w-3.5" />
              <span>Hyperlocal In-Person Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#17231D] tracking-tight">
              Explore Local Stalls
            </h1>
            <p className="text-xs sm:text-sm text-[#647067] mt-0.5">
              Check physical stall areas, live opening hours, menu prices, and get direct turn-by-turn walking directions.
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

        {/* Famous Street Hubs / Khau Galis Filter Strip */}
        <div className="pt-1 border-t border-[#E5EAE5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#17231D] uppercase tracking-wider flex items-center">
              <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" /> Famous Food Streets & Market Hubs:
            </span>
            {selectedHub && (
              <button
                onClick={() => {
                  setSelectedHub('');
                  setSelectedArea('');
                  updateUrlParams({ hub: undefined, area: undefined, page: 1 });
                }}
                className="text-[11px] text-[#16803D] hover:underline font-bold"
              >
                Clear Hub
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {FAMOUS_HUBS.map((hub) => {
              const isSelected = selectedHub === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => handleHubClick(hub)}
                  className={`px-3.5 py-2 rounded-2xl font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 border ${
                    isSelected
                      ? 'bg-[#14532D] text-white border-[#14532D] shadow-xs scale-102 ring-2 ring-[#22C55E]/40'
                      : 'bg-[#FAFAF5] text-[#17231D] hover:bg-[#EDF7EF] border-[#E5EAE5] hover:border-[#16803D]/40'
                  }`}
                >
                  <span className="text-base">{hub.icon}</span>
                  <div className="text-left">
                    <span className="block leading-tight">{hub.name}</span>
                    <span className={`block text-[10px] font-normal leading-tight ${isSelected ? 'text-[#86EFAC]' : 'text-[#647067]'}`}>
                      {hub.city} • {hub.stallCountHint}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gujarat City Quick Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs pt-1">
          <span className="text-[#647067] font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center">
            <Building2 className="h-3.5 w-3.5 mr-1 text-[#16803D]" /> Major Cities:
          </span>
          {['All Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bhuj'].map((c) => {
            const isSelected =
              selectedArea.toLowerCase() === c.toLowerCase() ||
              (c === 'All Gujarat' && !selectedArea && !selectedHub);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const targetArea = c === 'All Gujarat' ? '' : c;
                  setSelectedArea(targetArea);
                  setSelectedHub('');
                  setPage(1);
                  updateUrlParams({ area: targetArea || undefined, hub: undefined, page: 1 });
                }}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
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
              placeholder="Search product, stall name, item (pani puri, locho...)"
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
              placeholder="Locality / Landmark (e.g. Law Garden)..."
              className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5]/50 focus:bg-white text-xs sm:text-sm text-[#17231D] placeholder:text-[#647067] focus:outline-none focus:border-[#16803D] focus:ring-2 focus:ring-[#16803D]/20 transition-all"
            />
            {selectedArea && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('');
                  setSelectedHub('');
                  updateUrlParams({ area: undefined, hub: undefined, page: 1 });
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

          {/* Submit Search Button & Mobile Filter Sheet Trigger */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Search Stalls</span>
            </button>

            {/* Mobile Filter Sheet Button */}
            <button
              type="button"
              onClick={() => setMobileFilterSheetOpen(true)}
              className="sm:hidden py-2.5 px-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Open mobile filters"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#16803D]" />
              <span>Filters</span>
              {(selectedCategory || selectedArea || selectedHub || onlyOpenNow || userLocation) && (
                <span className="h-2 w-2 rounded-full bg-[#16803D]"></span>
              )}
            </button>

            {(searchTerm || selectedCategory || selectedArea || userLocation || selectedHub || onlyOpenNow) && (
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

        {/* Location, Distance & Open Now Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* GPS Location Pill */}
            {userLocation ? (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#EDF7EF] border border-[#D1EAD7] text-[#16803D]">
                <Footprints className="h-3.5 w-3.5 text-[#16803D]" />
                <span className="font-bold">Your Location Detected</span>
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
                    <option value={1}>1 km (Walking)</option>
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
                aria-label="Use My Current Location"
                title="Use My Current Location"
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-[#E5EAE5] hover:border-[#16803D] bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] hover:text-[#16803D] font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {geoLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#16803D]" />
                ) : (
                  <Navigation className="h-3.5 w-3.5 text-[#16803D]" />
                )}
                <span>{geoLoading ? 'Detecting your spot...' : 'Stalls Near Me'}</span>
              </button>
            )}

            {/* "Open Right Now" Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !onlyOpenNow;
                setOnlyOpenNow(next);
                updateUrlParams({ open: next ? 'true' : undefined, page: 1 });
              }}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                onlyOpenNow
                  ? 'bg-[#16803D] text-white border-[#16803D] shadow-xs'
                  : 'bg-[#FAFAF5] text-[#17231D] hover:bg-[#EDF7EF] border-[#E5EAE5]'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${onlyOpenNow ? 'bg-white' : 'bg-[#22C55E]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${onlyOpenNow ? 'bg-white' : 'bg-[#16803D]'}`}></span>
              </span>
              <span>Open Right Now</span>
            </button>

            {/* Sort by Nearest Toggle */}
            {userLocation && (
              <button
                type="button"
                onClick={() => setSortByNearest(!sortByNearest)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  sortByNearest
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-[#FAFAF5] text-[#17231D] border-[#E5EAE5]'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{sortByNearest ? 'Sorted: Nearest First' : 'Sort: Distance'}</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-[#647067] font-medium text-xs">
            Showing <span className="font-bold text-[#17231D]">{displayedVendors.length}</span> stall{displayedVendors.length === 1 ? '' : 's'}
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
            Locating verified physical vendor stalls...
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
      ) : displayedVendors.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#E5EAE5] p-10 sm:p-16 text-center space-y-4 shadow-subtle">
          <div className="h-16 w-16 rounded-2xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center mx-auto">
            <Store className="h-8 w-8" />
          </div>
          <h3 className="font-extrabold text-xl font-display text-[#17231D]">No Matching Stalls Found</h3>
          <p className="text-xs sm:text-sm text-[#647067] max-w-md mx-auto leading-relaxed">
            {onlyOpenNow
              ? 'There are no stalls open right now under your selected filters. Try unchecking "Open Right Now" to see operating hours and plan a visit.'
              : "We couldn't find any vendor stalls matching your search criteria. Try selecting a famous street hub or clearing filters."}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {onlyOpenNow && (
              <button
                onClick={() => setOnlyOpenNow(false)}
                className="px-5 py-2.5 rounded-xl bg-[#16803D] text-white text-xs font-bold shadow-xs hover:bg-[#14532D] transition-all cursor-pointer"
              >
                Show All Hours
              </button>
            )}
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] hover:bg-white text-xs font-bold text-[#17231D] transition-all cursor-pointer"
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
                  {displayedVendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      userLocation={userLocation}
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
                  vendors={displayedVendors}
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
                {displayedVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    userLocation={userLocation}
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
                  vendors={displayedVendors}
                  userLocation={userLocation}
                  selectedVendor={selectedVendor}
                  onSelectVendor={handleVendorSelect}
                  height="680px"
                />
              </div>
              <p className="text-[11px] text-center text-[#647067]">
                Click any stall pin on the map to view live opening status, address landmark, and get walking directions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Mobile View Switcher (Floating Pins <-> Cards Pill) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 lg:hidden">
        <button
          type="button"
          aria-label="Toggle mobile layout display"
          onClick={() => {
            setViewMode((prev) => (prev === 'map' ? 'list' : 'map'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#14532D] text-white font-bold text-xs shadow-xl active:scale-95 border border-[#22C55E]/40 ring-4 ring-black/10 cursor-pointer transition-transform"
        >
          {viewMode === 'map' ? (
            <>
              <ListIcon className="h-4 w-4 text-[#86EFAC]" />
              <span>Show Cards ({displayedVendors.length})</span>
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4 text-[#86EFAC]" />
              <span>Show Pins ({displayedVendors.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Floating Stall Preview Card on Pin Tap */}
      {selectedVendor && (
        <div className="fixed bottom-28 left-3 right-3 z-30 bg-white rounded-3xl border border-[#E5EAE5] p-4 shadow-2xl lg:hidden animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-[#E5EAE5]">
                <img
                  src={getStallCoverImage(selectedVendor)}
                  alt={selectedVendor.stallName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedVendor.availabilityStatus === 'open'
                        ? 'bg-[#EDF7EF] text-[#16803D]'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {selectedVendor.availabilityStatus === 'open' ? '🟢 Open Now' : 'Closed'}
                  </span>
                  {selectedVendor.stallType && (
                    <span className="text-[10px] text-[#647067] font-medium truncate">
                      • {selectedVendor.stallType === 'mobile' ? 'Mobile Thela' : 'Fixed Kiosk'}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-sm text-[#17231D] truncate">
                  {selectedVendor.stallName}
                </h4>
                <p className="text-xs text-[#647067] truncate">
                  {[selectedVendor.address?.area, selectedVendor.address?.city]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVendor(null)}
              className="p-1.5 rounded-full text-[#647067] hover:text-[#17231D] hover:bg-[#FAFAF5]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5EAE5] grid grid-cols-2 gap-2">
            <a
              href={getNavigationUrl(selectedVendor.location?.coordinates, selectedVendor.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] hover:text-[#16803D] border border-[#E5EAE5] text-xs font-bold transition-all"
            >
              <Navigation className="h-3.5 w-3.5 text-[#16803D]" />
              <span>Navigate</span>
            </a>
            <Link
              to={`/vendors/${selectedVendor.id || selectedVendor._id}`}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>View Stall</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Filter Sheet Modal */}
      {mobileFilterSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            onClick={() => setMobileFilterSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />
          <div className="relative bg-white rounded-t-3xl border-t border-[#E5EAE5] p-5 max-h-[85vh] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-250">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-5 w-5 text-[#16803D]" />
                <h3 className="font-extrabold font-display text-base text-[#17231D]">
                  Filter Physical Stalls
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterSheetOpen(false)}
                className="p-1 rounded-full text-[#647067] hover:text-[#17231D]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4">
              {/* Toggle: Open Right Now */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EDF7EF]/60 border border-[#D1EAD7]">
                <div>
                  <span className="font-bold text-xs text-[#17231D] block">🟢 Open Right Now</span>
                  <span className="text-[11px] text-[#647067]">
                    Only show stalls actively open right now
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    onlyOpenNow ? 'bg-[#16803D]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      onlyOpenNow ? 'right-0.5' : 'left-0.5'
                    }`}
                  ></span>
                </button>
              </div>

              {/* Distance Radius */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#17231D] uppercase tracking-wider block">
                  Search Radius: {radiusKm} km
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[1, 2, 5, 10].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRadiusKm(r)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        radiusKm === r
                          ? 'bg-[#16803D] text-white border-[#16803D]'
                          : 'bg-[#FAFAF5] text-[#17231D] border-[#E5EAE5]'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Gujarat Cities */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#17231D] uppercase tracking-wider block">
                  Gujarat Cities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['All Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'].map(
                    (c) => {
                      const isSel =
                        (c === 'All Gujarat' && !selectedArea) ||
                        selectedArea.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedArea(c === 'All Gujarat' ? '' : c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSel
                              ? 'bg-[#16803D] text-white'
                              : 'bg-[#FAFAF5] text-[#17231D] border border-[#E5EAE5]'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#17231D] uppercase tracking-wider block">
                    Stall Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        !selectedCategory
                          ? 'bg-[#16803D] text-white'
                          : 'bg-[#FAFAF5] text-[#17231D] border border-[#E5EAE5]'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedCategory === cat.slug
                            ? 'bg-[#16803D] text-white'
                            : 'bg-[#FAFAF5] text-[#17231D] border border-[#E5EAE5]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions in Sheet */}
            <div className="pt-3 border-t border-[#E5EAE5] flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterSheetOpen(false);
                }}
                className="flex-1 py-3 rounded-xl border border-[#E5EAE5] bg-[#FAFAF5] text-xs font-bold text-[#17231D]"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileFilterSheetOpen(false);
                  updateUrlParams({
                    category: selectedCategory || undefined,
                    area: selectedArea || undefined,
                    open: onlyOpenNow ? 'true' : undefined,
                    page: 1,
                  });
                }}
                className="flex-2 py-3 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
