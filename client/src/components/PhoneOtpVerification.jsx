import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2, KeyRound, RefreshCw, Smartphone } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/authService';

/**
 * PhoneOtpVerification Component
 * Provides clean SMS OTP sending, verification, cooldown timers, and dev mode simulation helpers.
 *
 * @param {Object} props
 * @param {string} props.initialPhone - Initial phone number
 * @param {boolean} [props.required=false] - Whether phone verification is mandatory
 * @param {function} props.onVerified - Callback receiving ({ phone, verificationToken })
 * @param {function} [props.onReset] - Callback when verified phone is cleared
 */
export default function PhoneOtpVerification({
  initialPhone = '',
  required = false,
  onVerified,
  onReset,
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Handle countdown timer for resend
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const sanitizePhone = (val) => {
    return val.replace(/[^0-9]/g, '').slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const clean = sanitizePhone(e.target.value);
    setPhone(clean);
    if (error) setError(null);
  };

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
      return;
    }

    setLoadingSend(true);
    try {
      const res = await sendOtp({ phone, purpose: 'registration' });
      setIsOtpSent(true);
      setSuccessMsg(res.message || 'Verification code sent to your phone.');
      setCooldown(res.data?.resendCooldownSeconds || 45);

      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoadingSend(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await verifyOtp({
        phone,
        otp: cleanOtp,
        purpose: 'registration',
      });

      setIsVerified(true);
      setVerifiedPhone(phone);
      setSuccessMsg('Mobile number verified successfully!');

      if (onVerified) {
        onVerified({
          phone,
          verificationToken: res.data?.verificationToken,
          formattedPhone: res.data?.formattedPhone,
        });
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResetVerification = () => {
    setIsVerified(false);
    setIsOtpSent(false);
    setOtp('');
    setDevOtp(null);
    setError(null);
    setSuccessMsg(null);
    if (onReset) onReset();
  };

  // State: Phone Already Verified
  if (isVerified) {
    return (
      <div className="p-3.5 bg-[#EDF7EF] border border-[#D1EAD7] rounded-xl flex items-center justify-between text-xs transition-all animate-fadeIn">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-[#16803D] text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-[#14532D] flex items-center space-x-1.5">
              <span>Phone Verified</span>
              <span className="text-[#16803D] font-mono">+91 {verifiedPhone}</span>
            </div>
            <p className="text-[11px] text-[#16803D]">Verification complete. Ready to register.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetVerification}
          className="text-[11px] text-[#16803D] hover:text-[#14532D] underline font-medium ml-2 cursor-pointer"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-[#17231D] mb-1">
          Mobile Number {required ? '*' : '(for SMS verification)'}
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-2.5 flex items-center space-x-1 text-[#647067] text-xs font-medium border-r border-[#E5EAE5] pr-2">
              <Smartphone className="h-3.5 w-3.5 text-[#647067]" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              disabled={isOtpSent && cooldown > 0}
              placeholder="98765 43210"
              maxLength={10}
              className="w-full pl-16 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D] transition-colors disabled:bg-[#FAFAF5]"
            />
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loadingSend || phone.length !== 10 || cooldown > 0}
            className="px-3.5 py-2 rounded-lg bg-[#17231D] hover:bg-[#14532D] text-white font-medium text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shadow-sm"
          >
            {loadingSend ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : isOtpSent ? (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Resend Code</span>
              </>
            ) : (
              <>
                <Phone className="h-3.5 w-3.5" />
                <span>Send OTP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Demo Helper Banner */}
      {devOtp && isOtpSent && (
        <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-900 animate-fadeIn shadow-xs flex items-center justify-between">
          <span className="font-bold flex items-center space-x-1.5 text-amber-950">
            <span className="text-base">📱</span>
            <span>Demo SMS Code:</span>
            <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-mono font-bold tracking-widest text-sm border border-amber-300">
              {devOtp}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOtp(devOtp)}
            className="text-xs bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-md font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Auto-fill OTP
          </button>
        </div>
      )}

      {/* OTP Code Entry Section */}
      {isOtpSent && (
        <div className="p-3.5 bg-[#FAFAF5] border border-[#E5EAE5] rounded-xl space-y-3 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17231D] flex items-center space-x-1">
                <KeyRound className="h-3.5 w-3.5 text-[#16803D]" />
                <span>Enter 6-Digit SMS Verification Code</span>
              </label>
              <span className="text-[11px] text-[#647067]">Code valid for 5 mins</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full text-center tracking-widest font-mono text-base font-bold py-2 px-3 bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loadingVerify || otp.length !== 6}
                className="px-4 py-2 rounded-lg bg-[#16803D] hover:bg-[#14532D] text-white font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 whitespace-nowrap shadow-sm cursor-pointer"
              >
                {loadingVerify ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error & Info Feedback */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && !isVerified && (
        <div className="p-2 rounded-lg bg-[#EDF7EF] border border-[#D1EAD7] text-xs text-[#16803D] flex items-center space-x-1.5 animate-fadeIn">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#16803D] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
