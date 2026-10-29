import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, LogOut, Shield, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex items-center">
                <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                  Hezal Market
                </span>
                <span className="hidden sm:inline-flex items-center ml-2.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Discovery Active
                </span>
              </div>
            </Link>

            {/* Explore Link in Navigation */}
            <Link
              to="/explore"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-emerald-50/60 transition-all"
            >
              <Compass className="h-4 w-4 text-primary-500" />
              <span>Explore Stalls</span>
            </Link>
          </div>

          {/* Center tagline */}
          <div className="hidden xl:flex items-center text-xs text-slate-600 bg-slate-100/80 px-3.5 py-1.5 rounded-full border border-slate-200/60">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
            <span className="font-medium">Discover Local. Shop Nearby.</span>
          </div>

          {/* Auth State Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Specific Quick Jump */}
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs"
                  >
                    <Store className="h-3.5 w-3.5 text-amber-600" />
                    <span>Vendor Dashboard</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                {/* User identity chip */}
                <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                    user.role === 'vendor'
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                      : user.role === 'admin'
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-500'
                      : 'bg-gradient-to-tr from-primary-600 to-teal-500'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize leading-tight font-medium">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/customer"
                  className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-lg text-primary-700 bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/register/vendor"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm shadow-amber-500/20 hover:shadow-md"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Register Stall</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
