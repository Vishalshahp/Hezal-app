import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, MapPin, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-sm">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
                Hezal Market
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                Phase 3 Auth
              </span>
            </div>
          </Link>

          {/* Center tagline */}
          <div className="hidden lg:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
            <span>Discover Local. Shop Nearby.</span>
          </div>

          {/* Auth State Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Specific Quick Jump */}
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Vendor Dashboard</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-primary-700 bg-primary-50 border border-primary-200 hover:bg-primary-100 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                {/* User identity chip */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="block text-xs font-semibold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize leading-tight">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                  className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm"
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
