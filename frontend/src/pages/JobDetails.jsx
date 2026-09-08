import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../redux/slices/jobSlice';
import { matchJobAction, clearJobMatch } from '../redux/slices/aiSlice';
import { saveJobToBookmarks, unsaveJobFromBookmarks } from '../redux/slices/applicationSlice';
import JobApplyModal from '../components/jobs/JobApplyModal';
import ResumeScoreBadge from '../components/ai/ResumeScoreBadge';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  Brain,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentJob, loading: jobLoading } = useSelector((state) => state.jobs);
  const { jobMatch, loading: matchLoading } = useSelector((state) => state.ai);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { savedJobs, myApplications } = useSelector((state) => state.applications);

  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
    dispatch(clearJobMatch());
  }, [dispatch, id]);

  const isCandidate = isAuthenticated && user?.role === 'jobseeker';
  const isSaved = (savedJobs || []).some((j) => (typeof j === 'object' ? j._id === id : j === id));
  const hasApplied = (myApplications || []).some((a) =>
    typeof a.job === 'object' ? a.job?._id === id : a.job === id
  );

  const handleMatchCheck = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to run AI Job Match.');
      return;
    }
    if (!isCandidate) {
      toast.error('AI matching is available for Job Seeker accounts.');
      return;
    }
    dispatch(matchJobAction(id));
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save jobs.');
      return;
    }
    if (!isCandidate) {
      toast.error('Only job seekers can save jobs.');
      return;
    }
    if (isSaved) {
      await dispatch(unsaveJobFromBookmarks(id));
      toast.success('Removed from saved jobs.');
    } else {
      await dispatch(saveJobToBookmarks(id));
      toast.success('Saved to your bookmarks!');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  if (jobLoading || !currentJob) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <Loader message="Fetching job specifications..." />
      </div>
    );
  }

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Competitive Compensation';
    const minK = salary.min ? `$${Math.round(salary.min / 1000)}k` : '';
    const maxK = salary.max ? `$${Math.round(salary.max / 1000)}k` : '';
    if (minK && maxK) return `${minK} - ${maxK} / yr`;
    if (minK) return `From ${minK} / yr`;
    return `Up to ${maxK} / yr`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to all listings
      </Link>

      {/* Header Card */}
      <div className="card-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-lg text-zinc-700 dark:text-zinc-300 overflow-hidden flex-shrink-0 shadow-sm">
              {currentJob.recruiter?.profile?.companyLogo ? (
                <img
                  src={currentJob.recruiter.profile.companyLogo}
                  alt={currentJob.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-zinc-400" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                {currentJob.title}
              </h1>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {currentJob.company}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentJob.location}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentJob.workplaceType}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentJob.jobType}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatSalary(currentJob.salary)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save job'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Share job link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {hasApplied ? (
              <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in to apply.');
                    navigate('/login');
                    return;
                  }
                  if (!isCandidate) {
                    toast.error('Only candidates can submit job applications.');
                    return;
                  }
                  setApplyModalOpen(true);
                }}
                className="btn-primary px-6 py-2.5 text-xs font-semibold"
              >
                Apply for Position
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Intelligence Section: Match Score & Interview Prep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Card */}
        <div className="md:col-span-2 card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                AI Candidate Match Analyzer
              </h3>
            </div>
            {!jobMatch && (
              <button
                type="button"
                onClick={handleMatchCheck}
                disabled={matchLoading}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {matchLoading ? 'Analyzing Profile...' : 'Analyze Match'}
              </button>
            )}
          </div>

          {jobMatch ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                <ResumeScoreBadge score={jobMatch.matchScore} size="md" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {jobMatch.recommendation}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {jobMatch.insights}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Strong Skill Matches:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(jobMatch.strongMatches || []).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    Missing / Desired Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(jobMatch.missingSkills || []).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Click <strong>"Analyze Match"</strong> to compare your candidate profile skills against the requirements of this role and generate instant compatibility metrics.
            </p>
          )}
        </div>

        {/* AI Interview Prep Banner */}
        <div className="card-surface p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                AI Interview Prep
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Generate role-specific technical questions, behavioral STAR scenarios, and tips before you speak with the hiring manager.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/interview-preparation?jobId=${currentJob._id}`)}
            className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-2"
          >
            <Brain className="w-3.5 h-3.5 text-amber-500" />
            Generate Prep Questions
          </button>
        </div>
      </div>

      {/* Main Content: Description, Requirements, Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Job Overview */}
          <div className="card-surface p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Role Overview
            </h2>
            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {currentJob.description}
            </div>
          </div>

          {/* Responsibilities */}
          {currentJob.responsibilities?.length > 0 && (
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Key Responsibilities
              </h2>
              <ul className="space-y-2.5">
                {currentJob.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 mt-2 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {currentJob.requirements?.length > 0 && (
            <div className="card-surface p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Candidate Requirements
              </h2>
              <ul className="space-y-2.5">
                {currentJob.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 mt-2 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Skills Required */}
          <div className="card-surface p-6 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Required Competencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(currentJob.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* About Company */}
          <div className="card-surface p-6 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              About {currentJob.company}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {currentJob.recruiter?.profile?.companyBio ||
                `${currentJob.company} is an active technology organization hiring technical innovators through JOBLYST.`}
            </p>
            {currentJob.recruiter?.profile?.companyWebsite && (
              <a
                href={currentJob.recruiter.profile.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-sky-500 hover:underline block pt-1"
              >
                Visit Official Website &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <JobApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={currentJob}
      />
    </div>
  );
};

export default JobDetails;
