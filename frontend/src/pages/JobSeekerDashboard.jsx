import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyApplications, fetchSavedJobs } from '../redux/slices/applicationSlice';
import { fetchJobRecommendations } from '../redux/slices/aiSlice';
import StatCard from '../components/dashboard/StatCard';
import JobCard from '../components/jobs/JobCard';
import Loader from '../components/common/Loader';
import {
  Briefcase,
  FileCheck,
  Clock,
  Bookmark,
  Sparkles,
  Brain,
  ArrowRight,
  TrendingUp,
  User
} from 'lucide-react';

const JobSeekerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myApplications, savedJobs, loading: appLoading } = useSelector((state) => state.applications);
  const { recommendations, loading: recLoading } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchMyApplications());
    dispatch(fetchSavedJobs());
    dispatch(fetchJobRecommendations());
  }, [dispatch]);

  const underReviewCount = myApplications.filter((a) => a.status === 'Under Review').length;
  const shortlistedCount = myApplications.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview').length;

  const getStatusBadge = (status) => {
    const map = {
      Applied: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
      'Under Review': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
      Shortlisted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      Interview: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      Rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      Hired: 'bg-emerald-600 text-white'
    };
    return map[status] || 'bg-zinc-100 text-zinc-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Candidate Hub &bull; {user?.profile?.headline || 'Complete your profile to unlock deeper AI recommendations'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/ai-resume-analyzer" className="btn-secondary text-xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            AI Resume Analyzer
          </Link>
          <Link to="/profile" className="btn-primary text-xs flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={myApplications.length}
          icon={Briefcase}
          subtitle="Submitted active roles"
        />
        <StatCard
          title="Under Review"
          value={underReviewCount}
          icon={Clock}
          subtitle="In recruiter evaluation"
        />
        <StatCard
          title="Shortlisted / Interviews"
          value={shortlistedCount}
          icon={FileCheck}
          subtitle="Advancing to next stage"
        />
        <StatCard
          title="Saved Bookmarks"
          value={savedJobs.length}
          icon={Bookmark}
          subtitle="Saved for later application"
        />
      </div>

      {/* AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              AI Job Recommendations For You
            </h2>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            View All Openings &rarr;
          </Link>
        </div>

        {recLoading ? (
          <div className="card-surface p-8">
            <Loader message="Calculating personalized role matches..." />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -top-2.5 right-4 z-10 px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-mono font-bold shadow-sm">
                  {item.matchPercent}% Match
                </div>
                <JobCard job={item.job} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-surface p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Add more skills to your profile to generate specialized AI recommendations!
          </div>
        )}
      </div>

      {/* Recent Applications Tracker */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Recent Applications
          </h2>
          <Link to="/applications" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            View Full Tracking &rarr;
          </Link>
        </div>

        {myApplications.length > 0 ? (
          <>
            {/* Mobile Card Layout (Screens < md) */}
            <div className="md:hidden space-y-3">
              {myApplications.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {app.job?.title || 'Position'}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {app.job?.company} &bull; {app.job?.location || 'Remote'}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>

                    <Link
                      to="/applications"
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-sky-500 dark:hover:text-sky-400"
                    >
                      View Timeline &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (Screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium">
                    <th className="pb-3 font-semibold">Job Title & Company</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Applied Date</th>
                    <th className="pb-3 font-semibold">Current Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {myApplications.slice(0, 5).map((app) => (
                    <tr key={app._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {app.job?.title || 'Position'}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {app.job?.company}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-400">
                        {app.job?.location || 'Remote'}
                      </td>
                      <td className="py-3.5 pr-4 text-zinc-500 dark:text-zinc-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/applications`}
                          className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-sky-500 dark:hover:text-sky-400"
                        >
                          Timeline &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You have not applied to any positions yet.
            </p>
            <Link to="/jobs" className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1">
              Browse Openings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
