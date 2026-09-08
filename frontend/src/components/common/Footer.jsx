import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase } from 'lucide-react';

const Footer = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // If logged in as job seeker -> only show Candidates links
  // If logged in as recruiter -> only show Employers links
  // If guest -> show both for general navigation
  const showCandidates = !isAuthenticated || user?.role === 'jobseeker';
  const showEmployers = !isAuthenticated || user?.role === 'recruiter';

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              JOBLYST
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Next-generation hiring infrastructure powered by modern AI evaluation, deterministic role-matching, and instant candidate workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-20">
          {showCandidates && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider mb-3">
                For Candidates
              </h4>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li><Link to="/jobs" className="hover:text-zinc-900 dark:hover:text-zinc-100">Browse Jobs</Link></li>
                <li><Link to="/ai-resume-analyzer" className="hover:text-zinc-900 dark:hover:text-zinc-100">AI Resume Analyzer</Link></li>
                <li><Link to="/interview-preparation" className="hover:text-zinc-900 dark:hover:text-zinc-100">AI Interview Prep</Link></li>
                <li><Link to="/applications" className="hover:text-zinc-900 dark:hover:text-zinc-100">Track Applications</Link></li>
              </ul>
            </div>
          )}

          {showEmployers && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider mb-3">
                For Employers
              </h4>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <li><Link to="/recruiter/jobs/create" className="hover:text-zinc-900 dark:hover:text-zinc-100">Post a Position</Link></li>
                <li><Link to="/recruiter/candidates" className="hover:text-zinc-900 dark:hover:text-zinc-100">Search Talent</Link></li>
                <li><Link to="/recruiter/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">Employer Dashboard</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} JOBLYST. All rights reserved.</p>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">&bull;</span>
          <p className="text-zinc-400 dark:text-zinc-500">Connecting ambitious talent with visionary teams.</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Terms of Service</span>
          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">Security</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
