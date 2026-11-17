import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import GoogleLoginButton from '../components/GoogleLoginButton';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Smartphone,
  KeyRound,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithTotp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'totp' (Google Authenticator) | 'password'
  const [loginMode, setLoginMode] = useState('password');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demo countdown state
  const [demoCountdown, setDemoCountdown] = useState(null);
  const [fetchingDemo, setFetchingDemo] = useState(false);

  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'totpCode') {
      setFormData((prev) => ({ ...prev, totpCode: value.replace(/\D/g, '').slice(0, 6) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (loginMode === 'totp') {
        if (!formData.totpCode.trim()) {
          setError('Please enter your 6-digit Google Authenticator code.');
          setLoading(false);
          return;
        }
        res = await loginWithTotp(formData.email.trim(), formData.totpCode.trim());
      } else {
        res = await login(formData.email.trim(), formData.password);
      }

      const user = res.data?.user || res.user;

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
      setError(
        err.data?.message ||
        err.message ||
        'Failed to sign in. Please verify your credentials or authenticator code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (signedInUser) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (signedInUser?.role === 'vendor') {
      navigate('/vendor/dashboard', { replace: true });
    } else if (signedInUser?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleFillDemoTotp = async () => {
    setFetchingDemo(true);
    setError(null);
    try {
      const res = await authService.getDemoTotpCode();
      if (res.success && res.data?.code) {
        setFormData((prev) => ({
          ...prev,
          email: res.data.demoEmail,
          totpCode: res.data.code,
        }));
        setDemoCountdown(res.data.remainingSeconds || 30);
      }
    } catch (_err) {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@hezalmarket.com',
        totpCode: '123456',
      }));
      setDemoCountdown(30);
    } finally {
      setFetchingDemo(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl border border-[#E5EAE5] shadow-card p-6 sm:p-8 space-y-6">
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
            Explore physical street food, chai & crafts, or manage your stall.
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FAFAF5] border border-[#E5EAE5] rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'password'
                ? 'bg-[#16803D] text-white shadow-xs'
                : 'text-[#647067] hover:text-[#17231D]'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('totp');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'totp'
                ? 'bg-[#16803D] text-white shadow-xs'
                : 'text-[#647067] hover:text-[#17231D]'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Google Auth</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Free Google Authentication API */}
        <div className="space-y-3">
          <GoogleLoginButton
            text="Continue with Google"
            role="customer"
            onSuccess={handleGoogleSuccess}
            onError={(err) => setError(err)}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5EAE5] w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-[#647067] uppercase tracking-wider relative">
              Or with email / code
            </span>
          </div>
        </div>

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
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
              />
            </div>
          </div>

          {loginMode === 'totp' ? (
            /* Google Authenticator TOTP Code */
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#17231D]">
                  6-Digit Google Authenticator Code
                </label>
                {demoCountdown !== null && demoCountdown > 0 && (
                  <span className="text-[11px] text-[#16803D] flex items-center space-x-1 font-mono">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span>{demoCountdown}s left</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Smartphone className="h-4 w-4 text-[#16803D] absolute left-3 top-3" />
                <input
                  type="text"
                  name="totpCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={formData.totpCode}
                  onChange={handleChange}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2 text-base text-center font-mono font-bold tracking-[0.25em] bg-white border border-[#E5EAE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors text-[#16803D]"
                />
              </div>
              <p className="text-[11px] text-[#647067] mt-1.5">
                Enter the live 6-digit code from Google Authenticator on your phone. No password required!
              </p>
            </div>
          ) : (
            /* Standard Password */
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#17231D]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#16803D] hover:underline font-medium"
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
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#E5EAE5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#647067] hover:text-[#17231D] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#16803D] hover:bg-[#14532D] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {loginMode === 'totp'
                    ? 'Sign In with Authenticator Code'
                    : 'Sign In to Hezal'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Google Authenticator Assist */}
        {loginMode === 'totp' && (
          <div className="pt-2 border-t border-[#E5EAE5]">
            <button
              type="button"
              disabled={fetchingDemo}
              onClick={handleFillDemoTotp}
              className="w-full py-2 px-3 rounded-xl bg-[#EDF7EF] hover:bg-[#D1EAD7] text-[#16803D] text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {fetchingDemo ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>Fill Demo Google Authenticator Code</span>
            </button>
          </div>
        )}

        {/* Sign Up Links */}
        <div className="text-center space-y-2 pt-2 border-t border-[#E5EAE5] text-xs text-[#647067]">
          <div>
            Don't have an account?{' '}
            <Link
              to="/register/customer"
              className="text-[#16803D] font-semibold hover:underline"
            >
              Sign up as customer
            </Link>
          </div>
          <div>
            Are you a street stall owner?{' '}
            <Link
              to="/register/vendor"
              className="text-[#16803D] font-semibold hover:underline"
            >
              Register your stall for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
