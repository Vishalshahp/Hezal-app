import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);
      const user = res.data?.user;

      // Smart redirection based on role or intended destination
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto py-8">
      {/* Decorative ambient gradient spots */}
      <div className="absolute -top-6 -left-6 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-card-hover p-6 sm:p-8 space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md shadow-primary-500/25">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Sign In to Hezal Market
          </h1>
          <p className="text-xs text-slate-500">
            Access your account to explore local stalls or manage your business.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white font-bold text-sm transition-all shadow-md shadow-primary-500/25 hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Registration Links */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Need an account?{' '}
            <Link to="/register/customer" className="text-primary-600 hover:text-primary-700 font-semibold">
              Register as Customer
            </Link>
          </p>
          <p className="text-slate-500">
            Are you a seller?{' '}
            <Link to="/register/vendor" className="text-amber-600 hover:text-amber-700 font-semibold">
              Register as a Stall Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
