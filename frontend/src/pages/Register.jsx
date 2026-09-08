import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, setPendingEmail } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Briefcase, Lock, Mail, User, ArrowRight, UserCheck, Shield } from 'lucide-react';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'jobseeker'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Check your email for your 6-digit OTP code.');
      dispatch(setPendingEmail(formData.email));
      navigate('/verify-email');
    } else {
      toast.error(result.payload || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 mb-4 shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create your account
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Join JOBLYST as a candidate or hiring partner
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleRoleSelect('jobseeker')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              formData.role === 'jobseeker'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-sky-500" />
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('recruiter')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              formData.role === 'recruiter'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            Recruiter
          </button>
        </div>

        <div className="card-surface p-6 sm:p-8 space-y-5 shadow-md">
          {/* Google OAuth Button */}
          <GoogleAuthButton role={formData.role} text="signup_with" />

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider relative">
              Or register with email
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={formData.role === 'recruiter' ? 'e.g. Sarah Connor' : 'e.g. Alex Rivera'}
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="input-field pl-9 text-xs"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
            By registering, you agree to receive a 6-digit verification OTP to confirm your email.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating Account & Sending OTP...' : 'Continue to Verification'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
