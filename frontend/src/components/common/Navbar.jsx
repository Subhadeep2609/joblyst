import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import {
  Briefcase,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  FileText,
  Bookmark,
  PlusCircle,
  Users,
  LayoutDashboard,
  Brain,
  Home as HomeIcon
} from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Always links to Homepage */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group"
              title="Go to Homepage"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                  JOBLYST
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {/* Home Link (Available for everyone) */}
              <Link
                to="/"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/')
                    ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Home
              </Link>

              {/* Explore Jobs (Candidate and Guest only) */}
              {(!isAuthenticated || user?.role === 'jobseeker') && (
                <Link
                  to="/jobs"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/jobs')
                      ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Explore Jobs
                </Link>
              )}

              {/* Job Seeker Links */}
              {isAuthenticated && user?.role === 'jobseeker' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/dashboard')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/applications"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/applications')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/saved-jobs')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Saved
                  </Link>
                  <Link
                    to="/ai-resume-analyzer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/ai-resume-analyzer')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    AI Resume
                  </Link>
                  <Link
                    to="/interview-preparation"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/interview-preparation')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5 text-amber-500" />
                    Interview Prep
                  </Link>
                </>
              )}

              {/* Recruiter Links */}
              {isAuthenticated && user?.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/recruiter/dashboard')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/jobs"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/recruiter/jobs')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Manage Postings
                  </Link>
                  <Link
                    to="/recruiter/candidates"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/recruiter/candidates')
                        ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/60'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Candidates
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {/* If Logged In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate max-w-[110px]">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">
                      {user?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <HomeIcon className="w-4 h-4 text-zinc-400" />
                      Homepage
                    </Link>

                    <Link
                      to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                      Profile
                    </Link>

                    {user?.role === 'recruiter' && (
                      <Link
                        to="/recruiter/jobs/create"
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-500" />
                        Post New Job
                      </Link>
                    )}

                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-xs px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
                  <span>Get Started</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {/* Home Link (All users) */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Home
          </Link>

          {(!isAuthenticated || user?.role === 'jobseeker') && (
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Explore Jobs
            </Link>
          )}

          {isAuthenticated && user?.role === 'jobseeker' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Applications
              </Link>
              <Link
                to="/saved-jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Saved Jobs
              </Link>
              <Link
                to="/ai-resume-analyzer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                AI Resume Analyzer
              </Link>
              <Link
                to="/interview-preparation"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                AI Interview Prep
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <Link
                to="/recruiter/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Recruiter Dashboard
              </Link>
              <Link
                to="/recruiter/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Manage Postings
              </Link>
              <Link
                to="/recruiter/jobs/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Post New Job
              </Link>
              <Link
                to="/recruiter/candidates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Candidates Talent Pool
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
