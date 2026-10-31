import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl border border-[#E5EAE5] shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Hezal Market"
              className="h-12 w-auto mx-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
          <h1 className="text-2xl font-bold font-display text-[#17231D] tracking-tight">
            Sign In to Hezal Market
          </h1>
          <p className="text-xs text-[#647067]">
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
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#17231D]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#16803D] hover:text-[#14532D] font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#647067] hover:text-[#17231D]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
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
        <div className="pt-4 border-t border-[#E5EAE5] text-center space-y-2 text-xs">
          <p className="text-[#647067]">
            Need an account?{' '}
            <Link to="/register/customer" className="text-[#16803D] hover:text-[#14532D] font-semibold underline underline-offset-2">
              Register as Customer
            </Link>
          </p>
          <p className="text-[#647067]">
            Are you a seller?{' '}
            <Link to="/register/vendor" className="text-[#16803D] hover:text-[#14532D] font-semibold underline underline-offset-2">
              Register as a Stall Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
