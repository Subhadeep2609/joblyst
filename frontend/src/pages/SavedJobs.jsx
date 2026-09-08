import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSavedJobs, unsaveJobFromBookmarks } from '../redux/slices/applicationSlice';
import JobCard from '../components/jobs/JobCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Bookmark, ArrowRight } from 'lucide-react';

const SavedJobs = () => {
  const dispatch = useDispatch();
  const { savedJobs, loading } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
          Saved Job Bookmarks
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Positions you've saved to evaluate and apply for later
        </p>
      </div>

      {loading ? (
        <div className="card-surface p-12">
          <Loader message="Loading saved jobs..." />
        </div>
      ) : savedJobs && savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} isSaved={true} />
          ))}
        </div>
      ) : (
        <div className="card-surface p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No saved positions yet
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            When browsing jobs, click the bookmark icon on any job card to save it here.
          </p>
          <Link to="/jobs" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
            Browse Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
