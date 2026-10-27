import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, ShieldCheck, MapPin, Package } from 'lucide-react';

export default function VendorDashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
            <Store className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-display text-slate-900">{user?.name}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Vendor Account
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
        >
          Sign Out
        </button>
      </div>

      {/* Phase 3 Scope Clarification Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <span>Phase 3 Authentication & Access Control Milestone Verified</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Your vendor account has been registered and authenticated. Under the project delivery roadmap,
          <strong> Phase 4 (Vendor & Products)</strong> will introduce stall profile customization, photo uploads via Cloudinary, product catalog CRUD, operating hours, and Leaflet pin coordinates.
        </p>
      </div>

      {/* Roadmap Checklist Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Upcoming Vendor Capabilities (Phase 4 Roadmap)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">1. Stall Profile</h3>
            <p className="text-[11px] text-slate-500">Stall name, public contact phone, tagline, bio, and Cloudinary cover photos.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">2. Pin Coordinates</h3>
            <p className="text-[11px] text-slate-500">Interactive Leaflet map pin-drop to publish and update stall coordinates.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">3. Product Catalogue</h3>
            <p className="text-[11px] text-slate-500">Create, edit, toggle availability, and set optional prices for stall items.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
