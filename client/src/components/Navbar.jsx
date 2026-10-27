import React from 'react';
import { Store, MapPin, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-sm">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Hezal Market
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                Phase 2 Foundation
              </span>
            </div>
          </div>

          {/* Quick links & badge */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Discover Local. Shop Nearby.</span>
            </div>
            <a
              href="#system-status"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Health Check</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
