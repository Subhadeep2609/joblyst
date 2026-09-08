import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, setFilters } from '../redux/slices/jobSlice';
import JobCard from '../components/jobs/JobCard';
import JobFilters from '../components/jobs/JobFilters';
import Loader from '../components/common/Loader';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Jobs = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { jobs, pagination, filters, loading } = useSelector((state) => state.jobs);
  const { savedJobs } = useSelector((state) => state.applications);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Read query parameters from URL if present
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || 'All';

    const initialFilters = {
      ...filters,
      search: search || filters.search,
      location: location || filters.location,
      category: category !== 'All' ? category : filters.category
    };

    dispatch(setFilters(initialFilters));
    dispatch(fetchJobs(initialFilters));
  }, [dispatch, searchParams]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const nextFilters = { ...filters, page: newPage };
      dispatch(setFilters(nextFilters));
      dispatch(fetchJobs(nextFilters));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const savedJobIds = (savedJobs || []).map((j) => (typeof j === 'object' ? j._id : j));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Explore Job Openings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Discover verified tech positions matching your exact criteria
          </p>
        </div>

        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg w-fit">
          Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{pagination.total}</span> positions
        </div>
      </div>

      {/* Mobile & Tablet Filter Toggle Bar (Screens < lg) */}
      <div className="lg:hidden flex items-center justify-between p-3.5 rounded-xl card-surface">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Search & Filter Positions
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <span>{mobileFilterOpen ? 'Hide Filters' : 'Refine Filters'}</span>
          {mobileFilterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Sidebar Filters: sticky on lg:block, collapsible on mobile/tablet */}
        <aside className={`lg:col-span-1 lg:block sticky top-20 ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <JobFilters onApply={() => setMobileFilterOpen(false)} />
        </aside>

        {/* Results List */}
        <main className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="card-surface p-12">
              <Loader message="Loading available positions..." />
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedJobIds.includes(job._id)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="btn-secondary text-xs flex items-center gap-1 disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card-surface p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                No matching jobs found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Try widening your search terms or clearing some filters to see more results.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
