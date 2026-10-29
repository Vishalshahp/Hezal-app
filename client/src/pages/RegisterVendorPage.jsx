import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, Lock, Phone, User, AlertCircle, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import PhoneOtpVerification from '../components/PhoneOtpVerification';

export default function RegisterVendorPage() {
  const { registerVendor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationToken: null,
    acknowledgeLocationPublic: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
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

    if (!formData.acknowledgeLocationPublic) {
      setError('Please acknowledge that published stall coordinates will be publicly viewable.');
      return;
    }

    setLoading(true);

    try {
      await registerVendor(formData);
      navigate('/vendor/dashboard', { replace: true });
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create vendor account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto py-8">
      {/* Decorative ambient gradient spots */}
      <div className="absolute -top-6 -left-6 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-6 -right-6 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-card-hover p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/25">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Register as a Local Vendor
          </h1>
          <p className="text-xs text-slate-500">
            Put your roadside stall or local business on the digital map and reach nearby customers.
          </p>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Vendor Onboarding:</strong> Registration creates your vendor credentials. Stall coordinates, photos, operating hours, and menu items can be updated anytime from your dashboard.
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Owner / Business Contact Name *
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ramesh Prajapati"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Email Address *
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <PhoneOtpVerification
            initialPhone={formData.phone}
            required={true}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password * (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="acknowledgeLocationPublic"
              name="acknowledgeLocationPublic"
              checked={formData.acknowledgeLocationPublic}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="acknowledgeLocationPublic" className="text-xs text-slate-600 cursor-pointer">
              I understand that when I publish my stall coordinates, they will be publicly viewable on Hezal Market.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/25 hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Vendor Account...</span>
              </>
            ) : (
              <span>Create Vendor Account</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign In
            </Link>
          </p>
          <p className="text-slate-500">
            Looking for stalls instead?{' '}
            <Link to="/register/customer" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create Customer Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
