import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyApplications } from '../redux/slices/applicationSlice';
import Loader from '../components/common/Loader';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const Applications = () => {
  const dispatch = useDispatch();
  const { myApplications, loading } = useSelector((state) => state.applications);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const toggleExpand = (id) => {
    setExpandedAppId(expandedAppId === id ? null : id);
  };

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          My Submitted Applications
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Real-time tracking and progression history for all positions you've applied to
        </p>
      </div>

      {loading ? (
        <div className="card-surface p-12">
          <Loader message="Loading your applications..." />
        </div>
      ) : myApplications.length > 0 ? (
        <div className="space-y-4">
          {myApplications.map((app) => {
            const isExpanded = expandedAppId === app._id;
            return (
              <div key={app._id} className="card-surface p-5 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {app.job?.title || 'Job Position'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {app.job?.company} &bull; {app.job?.location} &bull; Applied on{' '}
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                        title="Download submitted resume"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Resume</span>
                      </a>
                    )}

                    {app.job?._id && (
                      <Link
                        to={`/jobs/${app.job._id}`}
                        className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Job Post</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(app._id)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <span>Timeline</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Timeline Expansion */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-1">
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Application Progress History
                    </h4>

                    <div className="relative pl-6 space-y-4 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                      {(app.timeline || []).map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 border-2 border-white dark:border-zinc-900 flex items-center justify-center" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {step.status}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {new Date(step.changedAt).toLocaleString()}
                              </span>
                            </div>
                            {step.note && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                {step.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No active job applications found
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Explore open jobs and apply with your tailored resume.
          </p>
          <Link to="/jobs" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
            Discover Roles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Applications;
