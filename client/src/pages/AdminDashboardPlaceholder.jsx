import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, CheckCircle2, Users, Settings } from 'lucide-react';

export default function AdminDashboardPlaceholder() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center shadow-sm">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-display text-slate-900">{user?.name}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                Administrator
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

      {/* Phase 3 Status Notice */}
      <div className="bg-primary-50/70 border border-primary-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-primary-900 font-bold text-sm">
          <CheckCircle2 className="h-5 w-5 text-primary-600" />
          <span>Administrator Authentication & Authorization Active</span>
        </div>
        <p className="text-xs text-primary-800 leading-relaxed">
          You are authenticated with full administrator permissions. Under the project delivery roadmap,
          <strong> Phase 6 (Admin Moderation & Reports)</strong> will introduce the pending vendor approval inspection queue, category taxonomy manager, and customer report resolution controls.
        </p>
      </div>

      {/* Module Overview Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Planned Moderation Capabilities (Phase 6 Roadmap)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Vendor Approvals</h3>
            <p className="text-[11px] text-slate-500">Side-by-side audit of submitted vendor stall profiles against published satellite map pins.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Listing Reports</h3>
            <p className="text-[11px] text-slate-500">Review user complaints regarding inaccurate stall coordinates, stale listings, or closed stalls.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Category Taxonomy</h3>
            <p className="text-[11px] text-slate-500">Manage standard system categories used for filtering street food, produce, and services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
