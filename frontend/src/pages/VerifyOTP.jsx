import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailOTP, resendEmailOTP } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { MailCheck, RotateCcw, ArrowRight, ShieldAlert } from 'lucide-react';

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingEmail, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState(pendingEmail || localStorage.getItem('pendingEmail') || '');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1); // Take only last typed char
    setOtpValues(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous box on backspace if current is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');

    if (!email) {
      toast.error('Please specify an email address.');
      return;
    }

    if (fullOtp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }

    const result = await dispatch(verifyEmailOTP({ email, otp: fullOtp }));

    if (verifyEmailOTP.fulfilled.match(result)) {
      toast.success('Email successfully verified! Welcome aboard.');
      const role = result.payload.data.user.role;
      if (role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      toast.error(result.payload || 'Invalid or expired OTP code.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (!email) {
      toast.error('Please provide your email address.');
      return;
    }

    setResending(true);
    const result = await dispatch(resendEmailOTP(email));
    setResending(false);

    if (resendEmailOTP.fulfilled.match(result)) {
      toast.success('Fresh verification code sent! Check your inbox.');
      setCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      toast.error(result.payload || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 mb-4 shadow-sm">
            <MailCheck className="w-7 h-7 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Verify your email
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            We sent a 6-digit verification code to
          </p>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
            {email || 'your email'}
          </p>
        </div>

        {/* Email correction input if lost */}
        {!pendingEmail && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              Confirm Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-field text-xs"
            />
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="card-surface p-4 sm:p-8 space-y-6 shadow-md">
          <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
            {otpValues.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-9 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-lg sm:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 focus:border-transparent transition-all"
              />
            ))}
          </div>

          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            <p>Code valid for 10 minutes.</p>
          </div>

          <button
            type="submit"
            disabled={loading || otpValues.join('').length !== 6}
            className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying Code...' : 'Confirm Verification'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Resend Action */}
          <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend verification code'}
            </button>
          </div>
        </form>

        {/* Note on console dev fallback */}
        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            In local development, the OTP is printed directly in the backend terminal!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
