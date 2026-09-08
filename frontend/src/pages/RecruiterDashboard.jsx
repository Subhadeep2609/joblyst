import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecruiterJobs } from '../redux/slices/jobSlice';
import StatCard from '../components/dashboard/StatCard';
import Loader from '../components/common/Loader';
import {
  Briefcase,
  Users,
  PlusCircle,
  FileCheck,
  TrendingUp,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const RecruiterDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recruiterJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchRecruiterJobs());
  }, [dispatch]);

  const totalJobs = recruiterJobs.length;
  const activeJobs = recruiterJobs.filter((j) => j.status === 'published').length;
  const totalApplications = recruiterJobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Find your dream candidate &bull; {user?.profile?.companyName || user?.name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your open pipelines, review candidate applications, and discover top technical talent with AI precision
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/recruiter/jobs/create"
            className="btn-primary text-xs flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Position
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Positions Created"
          value={totalJobs}
          icon={Briefcase}
          subtitle="All-time job listings"
        />
        <StatCard
          title="Active Openings"
          value={activeJobs}
          icon={FileCheck}
          subtitle="Currently published & receiving applicants"
        />
        <StatCard
          title="Total Applications Received"
          value={totalApplications}
          icon={Users}
          subtitle="Candidate submissions across all jobs"
        />
      </div>

      {/* AI Assistant Callout */}
      <div className="card-surface p-6 border-sky-500/20 bg-gradient-to-r from-sky-500/5 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Need to draft a new role quickly?
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Use our built-in AI Job Generator to automatically produce rich descriptions, requirements, and responsibilities tailored to any title.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="btn-secondary text-xs flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          AI Job Composer
        </Link>
      </div>

      {/* Posted Jobs Overview Table */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Your Active Postings
          </h2>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Manage All Postings &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8">
            <Loader message="Loading your positions..." />
          </div>
        ) : recruiterJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium">
                  <th className="pb-3 font-semibold">Job Title</th>
                  <th className="pb-3 font-semibold">Commitment</th>
                  <th className="pb-3 font-semibold">Workplace</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Applicants</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recruiterJobs.slice(0, 6).map((job) => (
                  <tr key={job._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-400">
                      {job.jobType}
                    </td>
                    <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-400">
                      {job.workplaceType}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          job.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        {job.applicationsCount || 0}
                      </span>{' '}
                      <span className="text-zinc-400 text-[11px]">candidates</span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        Review Applicants &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You haven't posted any positions yet.
            </p>
            <Link to="/recruiter/jobs/create" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Create Your First Job Posting
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
