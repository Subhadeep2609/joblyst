import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById, updateJob } from '../redux/slices/jobSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Briefcase, ArrowLeft, Save } from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJob, loading } = useSelector((state) => state.jobs);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'Engineering',
    location: '',
    workplaceType: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    minSalary: 0,
    maxSalary: 0,
    openings: 1,
    skills: '',
    description: '',
    responsibilities: '',
    requirements: '',
    status: 'published'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentJob && currentJob._id === id) {
      setFormData({
        title: currentJob.title || '',
        company: currentJob.company || '',
        category: currentJob.category || 'Engineering',
        location: currentJob.location || '',
        workplaceType: currentJob.workplaceType || 'Remote',
        jobType: currentJob.jobType || 'Full-time',
        experienceLevel: currentJob.experienceLevel || 'Mid',
        minSalary: currentJob.salary?.min || 0,
        maxSalary: currentJob.salary?.max || 0,
        openings: currentJob.openings || 1,
        skills: Array.isArray(currentJob.skills) ? currentJob.skills.join(', ') : '',
        description: currentJob.description || '',
        responsibilities: Array.isArray(currentJob.responsibilities) ? currentJob.responsibilities.join('\n') : '',
        requirements: Array.isArray(currentJob.requirements) ? currentJob.requirements.join('\n') : '',
        status: currentJob.status || 'published'
      });
    }
  }, [currentJob, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      salary: {
        min: Number(formData.minSalary) || 0,
        max: Number(formData.maxSalary) || 0,
        currency: 'USD',
        period: 'year'
      }
    };

    const result = await dispatch(updateJob({ id, jobData: payload }));
    setSaving(false);

    if (updateJob.fulfilled.match(result)) {
      toast.success('Job listing updated successfully!');
      navigate('/recruiter/jobs');
    } else {
      toast.error(result.payload || 'Failed to update job listing.');
    }
  };

  if (loading || !currentJob) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Loader message="Loading job posting details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Edit Job Posting
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Modify specifications, status, or salary ranges for this position
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/jobs')}
          className="btn-secondary text-xs flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="input-field text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Workplace Type
            </label>
            <select
              name="workplaceType"
              value={formData.workplaceType}
              onChange={handleChange}
              className="input-field text-xs"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="input-field text-xs"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field text-xs"
            >
              <option value="published">Published (Active)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Required Skills (Comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="input-field text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            name="description"
            rows="5"
            required
            value={formData.description}
            onChange={handleChange}
            className="input-field text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Responsibilities (One per line)
          </label>
          <textarea
            name="responsibilities"
            rows="4"
            value={formData.responsibilities}
            onChange={handleChange}
            className="input-field text-xs font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Requirements (One per line)
          </label>
          <textarea
            name="requirements"
            rows="4"
            value={formData.requirements}
            onChange={handleChange}
            className="input-field text-xs font-mono"
          />
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
