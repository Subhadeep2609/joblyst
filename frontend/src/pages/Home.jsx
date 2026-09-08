import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import JobCard from '../components/jobs/JobCard';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Briefcase,
  Brain,
  Building,
  Users,
  PlusCircle,
  FileCheck
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.jobs);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isRecruiter = isAuthenticated && user?.role === 'recruiter';
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    // Only fetch job postings if user is candidate or guest
    if (!isRecruiter) {
      dispatch(fetchJobs({ limit: 6 }));
    }
  }, [dispatch, isRecruiter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (isRecruiter) {
      navigate(`/recruiter/candidates?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
    } else {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
    }
  };

  const categories = isRecruiter
    ? ['React', 'Full Stack', 'Python', 'DevOps', 'Machine Learning', 'Product Designer']
    : [
        'Engineering',
        'Design & UI',
        'DevOps',
        'Artificial Intelligence',
        'Product Management',
        'Data Science'
      ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 max-w-5xl mx-auto text-center px-4">
        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>
            {isRecruiter
              ? 'AI-Driven Talent Acquisition & Matching'
              : 'The Next Generation of AI-Driven Talent Matching'}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15] sm:leading-[1.1] mb-6">
          {isRecruiter ? (
            <>
              Find your dream candidate.<br />
              <span className="text-zinc-500 dark:text-zinc-400">Powered by AI precision.</span>
            </>
          ) : (
            <>
              Find your dream role.<br />
              <span className="text-zinc-500 dark:text-zinc-400">Powered by AI precision.</span>
            </>
          )}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
          {isRecruiter
            ? 'Connect with forward-thinking technical innovators. Leverage deep candidate matching, automated role pipelines, and streamlined talent discovery.'
            : 'Connect with forward-thinking tech companies. Leverage deep AI resume analysis, automated job-fit scoring, and streamlined role-based hiring.'}
        </p>

        {/* Global Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-3xl mx-auto p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRecruiter
                  ? 'Candidate role, skills, or tech stack...'
                  : 'Job title, keywords, or tech stack...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-zinc-200 dark:bg-zinc-800" />

          <div className="relative flex-1 w-full">
            <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Location or 'Remote'..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent border-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto btn-primary px-6 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <span>{isRecruiter ? 'Find Candidates' : 'Search'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Popular Categories / Trending Skills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <span className="text-xs font-semibold text-zinc-400 mr-1">
            {isRecruiter ? 'Trending Skills:' : 'Trending:'}
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                navigate(
                  isRecruiter
                    ? `/recruiter/candidates?search=${encodeURIComponent(cat)}`
                    : `/jobs?category=${encodeURIComponent(cat)}`
                )
              }
              className="text-xs px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isRecruiter ? (
            <>
              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    AI Job Generation
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Auto-generate comprehensive job descriptions, required competencies, and role expectations in seconds.
                  </p>
                </div>
              </div>

              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Verified Candidate Pool
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Access authenticated tech candidates with verified emails, structured profiles, and instant resume downloads.
                  </p>
                </div>
              </div>

              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Direct Applicant Tracking
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Manage application progression effortlessly from review to offer with automated candidate notifications.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    AI Resume Intelligence
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Benchmark your CV against industry metrics, uncover missing skills, and instantly calculate match scores for any job.
                  </p>
                </div>
              </div>

              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Verified Hiring Pipeline
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Strict OTP email verification, authenticated recruiter accounts, and real-time application timeline status updates.
                  </p>
                </div>
              </div>

              <div className="card-surface p-6 flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                  <Brain className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    AI Interview Preparation
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Generate tailored technical and behavioral interview questions with model answers designed specifically for your applied roles.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Jobs Section - Visible ONLY for Candidates and Guests */}
      {!isRecruiter && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Featured Opportunities
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Hand-picked roles from high-growth tech teams
              </p>
            </div>
            <Link
              to="/jobs"
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card-surface p-6 animate-pulse space-y-4">
                  <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.slice(0, 6).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="card-surface p-12 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No jobs posted yet. Check back soon or seed sample data!
              </p>
            </div>
          )}
        </section>
      )}

      {/* Recruiter Workspace Hub - Visible ONLY for Recruiters */}
      {isRecruiter && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Recruiter Workspace
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fast actions to build, manage, and scale your engineering pipeline
              </p>
            </div>
            <Link
              to="/recruiter/candidates"
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <span>Search All Candidates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-surface p-6 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Post a New Position
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Use our AI assistant to craft comprehensive job descriptions, required skillsets, and target compensation.
                </p>
              </div>
              <Link to="/recruiter/jobs/create" className="btn-primary text-xs py-2 text-center">
                Create Job Posting
              </Link>
            </div>

            <div className="card-surface p-6 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Candidate Talent Pool
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Search and filter verified developers, evaluate resumes, and discover ideal matches for your company.
                </p>
              </div>
              <Link to="/recruiter/candidates" className="btn-secondary text-xs py-2 text-center">
                Browse Candidates
              </Link>
            </div>

            <div className="card-surface p-6 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Manage Postings & Applicants
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Review active pipelines, update candidate statuses, and track inbound applicant progression in real time.
                </p>
              </div>
              <Link to="/recruiter/jobs" className="btn-secondary text-xs py-2 text-center">
                Manage Postings
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Role-Based CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isAuthenticated && user?.role === 'jobseeker' ? (
          /* Logged-in Job Seeker */
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900/90 text-white border border-zinc-800 p-8 sm:p-12">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">
                For Job Seekers
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Apply to top tier jobs with AI precision
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Match your skills with premier tech opportunities, leverage instant AI resume insights, and track your application progress in real time.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link to="/jobs" className="btn-primary bg-white text-zinc-900 hover:bg-zinc-100 text-xs px-5 py-2.5">
                  Start Applying Now
                </Link>
                <Link to="/ai-resume-analyzer" className="btn-secondary bg-transparent text-white border-zinc-700 hover:bg-zinc-800 text-xs px-5 py-2.5">
                  AI Resume Analyzer
                </Link>
              </div>
            </div>
          </div>
        ) : isAuthenticated && user?.role === 'recruiter' ? (
          /* Logged-in Recruiter */
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900/90 text-white border border-zinc-800 p-8 sm:p-12">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                For Hiring Teams
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Hire top tier technical talent with AI job generation
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Auto-generate comprehensive job descriptions with our AI assistant, track applicant pipelines effortlessly, and review structured candidate portfolios in minutes.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link to="/recruiter/jobs/create" className="btn-primary bg-white text-zinc-900 hover:bg-zinc-100 text-xs px-5 py-2.5">
                  Start Hiring Now
                </Link>
                <Link to="/recruiter/jobs" className="btn-secondary bg-transparent text-white border-zinc-700 hover:bg-zinc-800 text-xs px-5 py-2.5">
                  Manage Postings
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Unauthenticated Guests: Dual Side-by-Side Cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Seeker Card */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900/90 text-white border border-zinc-800 p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">
                  For Job Seekers
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Apply to top tier jobs with AI precision
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Match your skills with premier tech opportunities, leverage instant AI resume insights, and track your application progress in real time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/jobs" className="btn-primary bg-white text-zinc-900 hover:bg-zinc-100 text-xs px-5 py-2.5">
                  Start Applying Now
                </Link>
                <Link to="/register" className="btn-secondary bg-transparent text-white border-zinc-700 hover:bg-zinc-800 text-xs px-5 py-2.5">
                  Create Candidate Account
                </Link>
              </div>
            </div>

            {/* Recruiter Card */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900/90 text-white border border-zinc-800 p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  For Hiring Teams
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hire top tier technical talent with AI job generation
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Auto-generate comprehensive job descriptions with our AI assistant, track applicant pipelines effortlessly, and review structured candidate portfolios in minutes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/register" className="btn-primary bg-white text-zinc-900 hover:bg-zinc-100 text-xs px-5 py-2.5">
                  Start Hiring Now
                </Link>
                <Link to="/jobs" className="btn-secondary bg-transparent text-white border-zinc-700 hover:bg-zinc-800 text-xs px-5 py-2.5">
                  View Open Postings
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
