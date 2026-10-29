import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Heart, Compass, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-display font-extrabold text-lg text-slate-900 tracking-tight">
                Hezal Market
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              A location-based community platform connecting local roadside stalls, street food vendors, and small artisans with nearby shoppers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <MapPin className="h-3.5 w-3.5 text-primary-500" />
              <span>Hyper-Local Street Commerce Discovery</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Market Discovery
            </span>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link to="/explore" className="hover:text-primary-600 transition-colors">
                  Explore All Stalls
                </Link>
              </li>
              <li>
                <Link to="/explore?category=street-food-snacks" className="hover:text-primary-600 transition-colors">
                  Street Food & Chaat
                </Link>
              </li>
              <li>
                <Link to="/explore?category=fruits-vegetables" className="hover:text-primary-600 transition-colors">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link to="/explore?category=chai-beverages" className="hover:text-primary-600 transition-colors">
                  Chai & Refreshments
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers & Admins */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Vendor Community
            </span>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link to="/register/vendor" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">
                  Register Your Stall
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-600 transition-colors">
                  Vendor Login
                </Link>
              </li>
              <li>
                <Link to="/register/customer" className="hover:text-primary-600 transition-colors">
                  Customer Sign Up
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-600 transition-colors flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Hezal Market. Supporting local roadside entrepreneurs and community markets.</p>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              MERN Stack
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Tailwind CSS
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Leaflet Maps
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
