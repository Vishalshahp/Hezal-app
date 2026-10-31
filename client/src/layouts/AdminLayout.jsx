import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Store,
  Tags,
  AlertTriangle,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/vendors', end: false, label: 'Vendor Approvals', icon: Store },
    { to: '/admin/categories', end: false, label: 'Categories', icon: Tags },
    { to: '/admin/reports', end: false, label: 'Listing Reports', icon: AlertTriangle },
    { to: '/admin/users', end: false, label: 'Users & Roles', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Top Operations Banner */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="flex items-center space-x-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold font-display text-white text-base sm:text-lg tracking-tight">
                      Hezal
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                      Admin Ops
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                    Platform Management & Listing Moderation
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Public Storefront Link */}
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                title="View live consumer website"
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-800 hover:text-white border border-slate-700 transition-colors"
              >
                <span>Live Storefront</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>

              {/* Status Indicator */}
              <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>System Active</span>
              </div>

              {/* Admin User Chip */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="h-8 w-8 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-emerald-400 font-mono leading-tight">
                      Administrator
                    </span>
                  </div>
                </div>
              )}

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                title="Sign out of Admin Operations"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {mobileAdminMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileAdminMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Operations Navigation
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileAdminMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
              <Link
                to="/"
                onClick={() => setMobileAdminMenuOpen(false)}
                className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>Switch to Consumer Website</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Administration Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-slate-900">
        <div className="bg-slate-50 text-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-200">
          <Outlet />
        </div>
      </main>

      {/* 3. Restricted Operations Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Hezal Market • Platform Administration & Moderation Console</p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Internal Authorized Personnel Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
