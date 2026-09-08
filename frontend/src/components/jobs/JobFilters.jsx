import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters, fetchJobs } from '../../redux/slices/jobSlice';
import { Search, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';

const JobFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.jobs.filters);

  const handleInputChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value, page: 1 };
    dispatch(setFilters(nextFilters));
    dispatch(fetchJobs(nextFilters));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchJobs({}));
  };

  return (
    <div className="card-surface p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          Filter Jobs
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Search keywords */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Keyword or Skills
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            placeholder="e.g. React, Node, AI..."
            className="input-field pl-9 text-xs"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Location
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g. San Francisco, Remote"
            className="input-field pl-9 text-xs"
          />
        </div>
      </div>

      {/* Workplace Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Workplace Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleInputChange('workplaceType', type)}
              className={`text-xs py-1.5 px-2 rounded-lg border text-center transition-all ${
                filters.workplaceType === type
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold border-transparent shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Commitment
        </label>
        <select
          value={filters.jobType}
          onChange={(e) => handleInputChange('jobType', e.target.value)}
          className="input-field text-xs cursor-pointer"
        >
          <option value="All">All Commitments</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Freelance">Freelance</option>
        </select>
      </div>

      {/* Experience Level */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Experience Level
        </label>
        <select
          value={filters.experienceLevel}
          onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
          className="input-field text-xs cursor-pointer"
        >
          <option value="All">All Levels</option>
          <option value="Entry">Entry Level</option>
          <option value="Mid">Mid Level</option>
          <option value="Senior">Senior Level</option>
          <option value="Lead">Lead / Executive</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={(e) => handleInputChange('sort', e.target.value)}
          className="input-field text-xs cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="salaryHigh">Highest Salary</option>
          <option value="salaryLow">Lowest Salary</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
};

export default JobFilters;
