import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import PhoneOtpVerification from '../components/PhoneOtpVerification';

export default function RegisterCustomerPage() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationToken: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await registerCustomer(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create customer account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl border border-[#E5EAE5] shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Hezal Market"
              className="h-12 w-auto mx-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
          <h1 className="text-2xl font-bold font-display text-[#17231D] tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-[#647067]">
            Discover local roadside stalls, save your favorite spots, and navigate to nearby vendors.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Patel"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="aarav@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
            </div>
          </div>

          <PhoneOtpVerification
            initialPhone={formData.phone}
            required={false}
            onVerified={({ phone, verificationToken }) => {
              setFormData((prev) => ({
                ...prev,
                phone,
                verificationToken,
              }));
            }}
            onReset={() => {
              setFormData((prev) => ({
                ...prev,
                phone: '',
                verificationToken: null,
              }));
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Password * (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={8}
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

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Customer Account</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5EAE5] text-center space-y-2 text-xs">
          <p className="text-[#647067]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#16803D] hover:text-[#14532D] font-semibold">
              Sign In
            </Link>
          </p>
          <p className="text-[#647067]">
            Are you a local vendor?{' '}
            <Link to="/register/vendor" className="text-[#16803D] hover:text-[#14532D] font-semibold underline underline-offset-2">
              Register your Stall here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
