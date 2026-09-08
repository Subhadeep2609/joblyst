import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { saveJobToBookmarks, unsaveJobFromBookmarks } from '../../redux/slices/applicationSlice';
import toast from 'react-hot-toast';
import {
  MapPin,
  Building2,
  Bookmark,
  DollarSign,
  ArrowRight,
  Clock
} from 'lucide-react';

const JobCard = ({ job, isSaved = false }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Competitive';
    const minK = salary.min ? `$${Math.round(salary.min / 1000)}k` : '';
    const maxK = salary.max ? `$${Math.round(salary.max / 1000)}k` : '';
    if (minK && maxK) return `${minK} - ${maxK} / yr`;
    if (minK) return `From ${minK} / yr`;
    return `Up to ${maxK} / yr`;
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to save jobs.');
      return;
    }
    if (user?.role !== 'jobseeker') {
      toast.error('Only job seekers can save job listings.');
      return;
    }

    if (isSaved) {
      await dispatch(unsaveJobFromBookmarks(job._id));
      toast.success('Removed from saved jobs.');
    } else {
      await dispatch(saveJobToBookmarks(job._id));
      toast.success('Saved to your bookmarks!');
    }
  };

  return (
    <div className="card-surface p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 text-sm overflow-hidden flex-shrink-0">
              {job.recruiter?.profile?.companyLogo ? (
                <img
                  src={job.recruiter.profile.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-zinc-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                <Link to={`/jobs/${job._id}`}>{job.title}</Link>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {job.company}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-3 h-3 text-zinc-400" />
            {job.location}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            {job.workplaceType}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            {job.jobType}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            {job.experienceLevel}
          </span>
        </div>

        {/* Short description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Skills chips */}
        <div className="flex flex-wrap gap-1 mb-4">
          {(job.skills || []).slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              {skill}
            </span>
          ))}
          {(job.skills?.length || 0) > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 text-zinc-400">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
          {formatSalary(job.salary)}
        </div>

        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
