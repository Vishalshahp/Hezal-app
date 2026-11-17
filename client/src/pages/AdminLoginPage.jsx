import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import GoogleLoginButton from '../components/GoogleLoginButton';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Smartphone,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminLoginPage() {
  const { user, login, loginWithTotp } = useAuth();
  const navigate = useNavigate();

  // Mode: 'totp' (Google Authenticator) | 'password'
  const [loginMode, setLoginMode] = useState('totp');

  // Form states
  const [email, setEmail] = useState('admin@hezalmarket.com');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live demo helper state
  const [demoCountdown, setDemoCountdown] = useState(null);
  const [fetchingDemo, setFetchingDemo] = useState(false);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Periodic countdown decrease if demo code is active
  useEffect(() => {
    if (demoCountdown === null || demoCountdown <= 0) return;
    const timer = setInterval(() => {
      setDemoCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [demoCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let res;
      if (loginMode === 'totp') {
        if (!totpCode.trim()) {
          setErrorMsg('Please enter your 6-digit Google Authenticator code.');
          setLoading(false);
          return;
        }
        res = await loginWithTotp(email.trim(), totpCode.trim());
      } else {
        res = await login(email.trim(), password);
      }

      const signedInUser = res.data?.user || res.user;
      if (signedInUser?.role !== 'admin') {
        setErrorMsg('Access denied. This account does not possess platform administrator privileges.');
        setLoading(false);
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setErrorMsg(
        err.data?.message ||
        err.message ||
        'Authentication failed. Please verify administrator credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@hezalmarket.com');
    setPassword('AdminPassword123!');
    setErrorMsg('');
  };

  const handleFillDemoTotp = async () => {
    setFetchingDemo(true);
    setErrorMsg('');
    setEmail('admin@hezalmarket.com');
    try {
      const res = await authService.getDemoTotpCode();
      if (res.success && res.data?.code) {
        setTotpCode(res.data.code);
        setDemoCountdown(res.data.remainingSeconds || 30);
      }
    } catch (_err) {
      // In offline / fallback mode, calculate standard TOTP or fallback demo
      setTotpCode('123456');
      setDemoCountdown(30);
    } finally {
      setFetchingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 py-12 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Back to Storefront Link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          to="/"
          className="text-slate-400 hover:text-white inline-flex items-center space-x-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Consumer Website</span>
        </Link>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
          RESTRICTED AREA
        </span>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-tight pt-2">
            Hezal Admin Console
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Platform Operations, Listing Approvals & Vendor Community Moderation.
          </p>
        </div>

        {/* Free Google Authentication API */}
        <div className="space-y-3">
          <GoogleLoginButton
            text="Admin Sign in with Google"
            role="admin"
            onSuccess={(signedUser) => {
              if (signedUser?.role !== 'admin') {
                setErrorMsg('Access denied. This account does not possess platform administrator privileges.');
                return;
              }
              navigate('/admin', { replace: true });
            }}
            onError={(err) => setErrorMsg(err)}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider relative">
              Or with code / password
            </span>
          </div>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('totp');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'totp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Google Auth Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('password');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              loginMode === 'password'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/50 border border-red-800/80 rounded-2xl p-3.5 text-xs text-red-200 flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hezalmarket.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>
          </div>

          {loginMode === 'totp' ? (
            /* Google Authenticator TOTP Code Input */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  6-Digit App Code
                </label>
                {demoCountdown !== null && demoCountdown > 0 && (
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1 font-mono">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span>Expires in {demoCountdown}s</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 placeholder:text-slate-700 text-center font-mono text-lg font-bold tracking-[0.3em] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Open Google Authenticator on your phone and enter the current 6-digit code for <strong>Hezal Market</strong>. No password needed!
              </p>
            </div>
          ) : (
            /* Standard Password Input */
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Operator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {loginMode === 'totp'
                    ? 'Verify Code & Enter Console'
                    : 'Authenticate & Access Console'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Assist */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {loginMode === 'totp' ? (
            <button
              type="button"
              disabled={fetchingDemo}
              onClick={handleFillDemoTotp}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
            >
              {fetchingDemo ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>Fill Live Google Authenticator Code (Demo Admin)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
              <span>Fill Demo Admin Password (`AdminPassword123!`)</span>
            </button>
          )}

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/60 text-[11px] text-slate-400 font-mono text-center">
            Demo Secret: <code className="text-emerald-400 font-bold select-all">JBSWY3DPEHPK3PXP</code>
          </div>
        </div>

        {/* Legal notice */}
        <p className="text-[11px] text-center text-slate-500 leading-tight">
          Unauthorized access attempts are monitored and recorded.
        </p>
      </div>
    </div>
  );
}
