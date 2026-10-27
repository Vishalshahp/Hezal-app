import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, Home, Store } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const location = useLocation();

  const requiredRoles = location.state?.requiredRoles || [];
  const currentRole = location.state?.currentRole || user?.role || 'anonymous';

  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="h-16 w-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
        <ShieldX className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Access Denied
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          You do not have administrative or merchant permissions to access this restricted destination.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-1.5">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-700">Your Current Account Role:</span>
          <span className="capitalize font-mono font-bold text-slate-800">{currentRole}</span>
        </div>
        {requiredRoles.length > 0 && (
          <div className="flex justify-between">
            <span className="font-semibold text-slate-700">Required Role:</span>
            <span className="capitalize font-mono text-primary-700">{requiredRoles.join(' or ')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Return Home</span>
        </Link>

        {user?.role === 'vendor' && (
          <Link
            to="/vendor/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Go to Vendor Dashboard</span>
          </Link>
        )}
      </div>
    </div>
  );
}
