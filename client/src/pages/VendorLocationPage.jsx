import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import {
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Navigation
} from 'lucide-react';

export default function VendorLocationPage() {
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [locationData, setLocationData] = useState({
    longitude: 72.55289,
    latitude: 23.03721,
    street: '',
    area: '',
    landmark: '',
    locationUpdatedAt: null,
  });

  const [availabilityStatus, setAvailabilityStatus] = useState('open');
  const [openingHours, setOpeningHours] = useState([
    { day: 'Mon', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Tue', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Wed', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Thu', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Fri', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Sat', open: '08:00', close: '20:00', isClosed: false },
    { day: 'Sun', open: '08:00', close: '20:00', isClosed: false },
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await vendorService.getMyProfile();
      if (res?.data?.profile) {
        const p = res.data.profile;
        const coords = p.location?.coordinates || [72.55289, 23.03721];
        setLocationData({
          longitude: coords[0],
          latitude: coords[1],
          street: p.address?.street || '',
          area: p.address?.area || '',
          landmark: p.address?.landmark || '',
          locationUpdatedAt: p.locationUpdatedAt || null,
        });
        setAvailabilityStatus(p.availabilityStatus || 'open');
        if (p.openingHours && p.openingHours.length === 7) {
          setOpeningHours(p.openingHours);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Please create your stall profile first.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your current browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData((prev) => ({
          ...prev,
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
        }));
        setDetectingGps(false);
        setSuccessMsg('Coordinates detected from current device GPS position!');
      },
      (error) => {
        setDetectingGps(false);
        alert(`Failed to detect GPS location: ${error.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setSavingLocation(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await vendorService.updateLocation(locationData);
      setSuccessMsg('Stall coordinates and location published successfully!');
      if (res?.data?.locationUpdatedAt) {
        setLocationData((prev) => ({
          ...prev,
          locationUpdatedAt: res.data.locationUpdatedAt,
        }));
      }
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to update stall location.');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setSavingHours(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await vendorService.updateAvailability({
        availabilityStatus,
        openingHours,
      });
      setSuccessMsg('Stall operating hours and live availability saved!');
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to update hours.');
    } finally {
      setSavingHours(false);
    }
  };

  const handleHourChange = (index, field, value) => {
    setOpeningHours((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-xs">Loading stall location configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/vendor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vendor Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              Stall Location & Operating Hours
            </h1>
            <p className="text-xs text-slate-500">
              Publish self-reported stall coordinates, street location, and regular schedule.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Part 1: Coordinates & Address */}
      <form onSubmit={handleSaveLocation} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Published Stall Coordinates
            </h2>
            <p className="text-xs text-slate-500">
              GeoJSON Point coordinates used for customer proximity discovery and navigation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetectGps}
            disabled={detectingGps}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <Compass className={`h-3.5 w-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
            <span>{detectingGps ? 'Detecting GPS...' : 'Detect Current GPS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Longitude (Valid range: -180 to 180) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={locationData.longitude}
              onChange={(e) => setLocationData((prev) => ({ ...prev, longitude: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Latitude (Valid range: -90 to 90) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={locationData.latitude}
              onChange={(e) => setLocationData((prev) => ({ ...prev, latitude: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spot / Street Address Description
            </label>
            <input
              type="text"
              value={locationData.street}
              onChange={(e) => setLocationData((prev) => ({ ...prev, street: e.target.value }))}
              placeholder="e.g. Near Law Garden Circle, opposite Gate 2"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Locality / Area Name
            </label>
            <input
              type="text"
              value={locationData.area}
              onChange={(e) => setLocationData((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="e.g. Navrangpura"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={locationData.landmark}
              onChange={(e) => setLocationData((prev) => ({ ...prev, landmark: e.target.value }))}
              placeholder="e.g. Under the large Neem tree"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-100 gap-2">
          <span className="text-[11px] text-slate-400">
            Last location update:{' '}
            {locationData.locationUpdatedAt
              ? new Date(locationData.locationUpdatedAt).toLocaleString()
              : 'Not yet recorded'}
          </span>
          <button
            type="submit"
            disabled={savingLocation}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            {savingLocation ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Location...</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5" />
                <span>Publish Stall Location</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Part 2: Operating Schedule & Availability */}
      <form onSubmit={handleSaveAvailability} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          2. Live Availability & Weekly Schedule
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Current Real-Time Status
          </label>
          <div className="flex gap-2">
            {[
              { id: 'open', label: 'Open Now', color: 'bg-emerald-600 text-white' },
              { id: 'away', label: 'Temporarily Away', color: 'bg-amber-600 text-white' },
              { id: 'closed', label: 'Closed', color: 'bg-red-600 text-white' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setAvailabilityStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  availabilityStatus === s.id
                    ? `${s.color} border-transparent shadow-sm`
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Weekly Operating Hours
          </label>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
            {openingHours.map((slot, index) => (
              <div key={slot.day} className="p-3 flex items-center justify-between gap-2 bg-white">
                <span className="font-bold text-slate-800 w-12">{slot.day}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    disabled={slot.isClosed}
                    value={slot.open}
                    onChange={(e) => handleHourChange(index, 'open', e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs disabled:opacity-40"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    disabled={slot.isClosed}
                    value={slot.close}
                    onChange={(e) => handleHourChange(index, 'close', e.target.value)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs disabled:opacity-40"
                  />
                </div>
                <label className="flex items-center space-x-1.5 cursor-pointer text-slate-500">
                  <input
                    type="checkbox"
                    checked={slot.isClosed}
                    onChange={(e) => handleHourChange(index, 'isClosed', e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Closed</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingHours}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
          >
            {savingHours ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Schedule...</span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                <span>Save Schedule & Status</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
