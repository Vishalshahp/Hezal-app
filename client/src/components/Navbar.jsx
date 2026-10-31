import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, LogOut, Shield, Compass, Grid, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5EAE5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center group py-1">
              <img
                src="/logo.png"
                alt="Hezal Market"
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="sr-only">Hezal Market</span>
            </Link>

            {/* Center Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/explore"
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/explore')
                    ? 'text-[#16803D] bg-[#EDF7EF]'
                    : 'text-[#647067] hover:text-[#17231D] hover:bg-[#FAFAF5]'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Explore Stalls</span>
              </Link>

              <Link
                to="/explore"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#647067] hover:text-[#17231D] hover:bg-[#FAFAF5] transition-colors"
              >
                <Grid className="h-4 w-4" />
                <span>Categories</span>
              </Link>
            </nav>
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-[#16803D] bg-[#EDF7EF] border border-[#D1EAD7] hover:bg-[#D1EAD7]/50 transition-colors"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Vendor Dashboard</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-[#E5EAE5]">
                  <div className="h-8 w-8 rounded-full bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-[#17231D] leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-[#647067] capitalize leading-tight">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-[#647067] hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#647067] hover:text-[#17231D] px-3 py-1.5 rounded-lg hover:bg-[#FAFAF5] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/customer"
                  className="text-sm font-medium text-[#16803D] bg-[#EDF7EF] hover:bg-[#D1EAD7]/60 px-3.5 py-1.5 rounded-lg border border-[#D1EAD7] transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to="/register/vendor"
                  className="inline-flex items-center space-x-1.5 text-sm font-semibold text-white bg-[#16803D] hover:bg-[#14532D] px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  <Store className="h-4 w-4" />
                  <span>Register Your Stall</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {!user && (
              <Link
                to="/register/vendor"
                className="text-xs font-semibold text-white bg-[#16803D] px-3 py-1.5 rounded-lg shadow-xs"
              >
                Register Stall
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#647067] hover:text-[#17231D] hover:bg-[#FAFAF5]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5EAE5] bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-[#17231D] hover:bg-[#FAFAF5]"
          >
            <Compass className="h-4 w-4 text-[#16803D]" />
            <span>Explore Stalls</span>
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-[#17231D] hover:bg-[#FAFAF5]"
          >
            <Grid className="h-4 w-4 text-[#16803D]" />
            <span>Categories</span>
          </Link>

          <div className="pt-2 border-t border-[#E5EAE5] space-y-2">
            {user ? (
              <>
                <div className="px-3 py-1.5 text-xs text-[#647067]">
                  Signed in as <span className="font-semibold text-[#17231D]">{user.name}</span> ({user.role})
                </div>
                {user.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-[#16803D] bg-[#EDF7EF]"
                  >
                    Vendor Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 bg-slate-100"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-medium text-[#17231D] border border-[#E5EAE5]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-medium text-[#16803D] bg-[#EDF7EF] border border-[#D1EAD7]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
