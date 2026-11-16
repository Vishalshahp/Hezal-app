import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Home,
  Compass,
  Navigation,
  Flame,
  User,
  Store,
  Shield,
  X,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { FAMOUS_HUBS } from '../data/marketHubs';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [hubsSheetOpen, setHubsSheetOpen] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  // Quick GPS trigger from bottom nav
  const handleQuickNearMe = () => {
    if (!navigator.geolocation) {
      navigate('/explore');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const { latitude, longitude } = pos.coords;
        navigate(`/explore?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}&nearby=true`);
      },
      () => {
        setGeoLocating(false);
        navigate('/explore');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectHub = (hub) => {
    setHubsSheetOpen(false);
    navigate(`/explore?hub=${hub.id}&area=${encodeURIComponent(hub.areaKeyword)}`);
  };

  // Determine account link
  const getAccountLink = () => {
    if (!user) return '/login';
    if (user.role === 'vendor') return '/vendor/dashboard';
    if (user.role === 'admin') return '/admin';
    return '/explore';
  };

  const getAccountLabel = () => {
    if (!user) return t('sign_in');
    if (user.role === 'vendor') return t('my_stall');
    if (user.role === 'admin') return 'Admin';
    return t('profile');
  };

  const AccountIcon = user?.role === 'vendor' ? Store : user?.role === 'admin' ? Shield : User;

  return (
    <>
      {/* 1. Sticky Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAE5] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden px-2 py-1.5 transition-all"
      >
        <div className="grid grid-cols-5 items-center justify-around text-center">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#16803D] font-bold' : 'text-[#647067] hover:text-[#17231D]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#EDF7EF] text-[#16803D]' : ''
                  }`}
                >
                  <Home className="h-5 w-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{t('home')}</span>
              </>
            )}
          </NavLink>

          {/* Explore */}
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#16803D] font-bold' : 'text-[#647067] hover:text-[#17231D]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#EDF7EF] text-[#16803D]' : ''
                  }`}
                >
                  <Compass className="h-5 w-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{t('explore_nav')}</span>
              </>
            )}
          </NavLink>

          {/* Near Me (GPS) Action Button */}
          <button
            type="button"
            onClick={handleQuickNearMe}
            className="flex flex-col items-center justify-center py-0.5 transition-all active:scale-90 cursor-pointer -mt-3"
            title="Find physical stalls near your location"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#16803D] to-[#14532D] text-white flex items-center justify-center shadow-lg shadow-green-900/30 border-2 border-white ring-2 ring-[#22C55E]/40">
              <Navigation className={`h-5 w-5 ${geoLocating ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-[#14532D] tracking-tight mt-0.5">
              {geoLocating ? '...' : t('near_me')}
            </span>
          </button>

          {/* Famous Hubs Drawer Trigger */}
          <button
            type="button"
            onClick={() => setHubsSheetOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              hubsSheetOpen ? 'text-orange-600 font-bold' : 'text-[#647067] hover:text-[#17231D]'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                hubsSheetOpen ? 'bg-orange-50 text-orange-600' : ''
              }`}
            >
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{t('hubs')}</span>
          </button>

          {/* Account / Dashboard */}
          <NavLink
            to={getAccountLink()}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive ? 'text-[#16803D] font-bold' : 'text-[#647067] hover:text-[#17231D]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#EDF7EF] text-[#16803D]' : ''
                  }`}
                >
                  <AccountIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[55px]">
                  {getAccountLabel()}
                </span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* 2. Slide-up Food Hubs Sheet for Mobile */}
      {hubsSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setHubsSheetOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative bg-white rounded-t-3xl border-t border-[#E5EAE5] shadow-2xl max-h-[75vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-[#E5EAE5] rounded-full" />
            </div>

            <div className="px-5 py-3 border-b border-[#E5EAE5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🔥</span>
                <div>
                  <h3 className="text-sm font-bold text-[#17231D]">
                    Famous Food Hubs & Khau Gali
                  </h3>
                  <p className="text-[11px] text-[#647067]">
                    Tap a street to see active roadside stalls
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHubsSheetOpen(false)}
                className="p-1 rounded-full text-[#647067] hover:bg-[#FAFAF5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-2.5 divide-y divide-[#E5EAE5]">
              {FAMOUS_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => handleSelectHub(hub)}
                  className="w-full pt-2.5 first:pt-0 text-left flex items-center justify-between hover:bg-[#FAFAF5] p-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl mt-0.5">{hub.icon}</span>
                    <div>
                      <span className="font-bold text-xs text-[#17231D] group-hover:text-[#16803D]">
                        {hub.name}
                      </span>
                      <p className="text-[10px] text-[#647067]">
                        {hub.city} • {hub.stallCountHint}
                      </p>
                      <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {hub.famousFor}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#647067] group-hover:text-[#16803D] shrink-0" />
                </button>
              ))}
            </div>

            <div className="p-3 bg-[#FAFAF5] border-t border-[#E5EAE5] text-center">
              <button
                type="button"
                onClick={() => {
                  setHubsSheetOpen(false);
                  navigate('/explore');
                }}
                className="text-xs font-bold text-[#16803D] hover:underline"
              >
                View all stalls across Gujarat →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
