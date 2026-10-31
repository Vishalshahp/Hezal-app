import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Tags,
  AlertTriangle,
  Users,
  ShieldCheck,
} from 'lucide-react';

export default function AdminNav({ metrics }) {
  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/vendors',
      end: false,
      label: 'Vendor Review',
      icon: Store,
      badge: metrics?.pendingVendors > 0 ? metrics.pendingVendors : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      to: '/admin/categories',
      end: false,
      label: 'Categories',
      icon: Tags,
      badge: metrics?.totalCategories ? metrics.totalCategories : null,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    {
      to: '/admin/reports',
      end: false,
      label: 'Listing Reports',
      icon: AlertTriangle,
      badge: metrics?.unresolvedReports > 0 ? metrics.unresolvedReports : null,
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      to: '/admin/users',
      end: false,
      label: 'Users & Access',
      icon: Users,
    },
  ];

  return (
    <div className="bg-white border-b border-[#E5EAE5] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6 sticky top-16 z-30 shadow-card">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2.5">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EDF7EF] text-[#16803D] shadow-xs border border-[#D1EAD7]'
                      : 'text-[#647067] hover:text-[#17231D] hover:bg-[#FAFAF5]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="hidden md:flex items-center space-x-1 text-xs text-[#647067] font-medium shrink-0 ml-4">
          <ShieldCheck className="h-4 w-4 text-[#16803D]" />
          <span>Moderator Console</span>
        </div>
      </div>
    </div>
  );
}
