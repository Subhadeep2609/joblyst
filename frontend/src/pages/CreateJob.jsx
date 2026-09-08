import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createJob } from '../redux/slices/jobSlice';
import { generateJobDescriptionAction } from '../redux/slices/aiSlice';
import toast from 'react-hot-toast';
import { Sparkles, Briefcase, Plus, ArrowLeft } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading: aiLoading } = useSelector((state) => state.ai);

  const [formData, setFormData] = useState({
    title: '',
    company: user?.profile?.companyName || user?.name || '',
    category: 'Engineering',
    location: user?.profile?.companyLocation || 'San Francisco, CA (or Remote)',
    workplaceType: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    minSalary: 120000,
    maxSalary: 160000,
    openings: 1,
    skills: 'React, Node.js, TypeScript, MongoDB',
    description: '',
    responsibilities: '',
    requirements: '',
    status: 'published'
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // AI Description Generator Trigger
  const handleAIGenerate = async () => {
    if (!formData.title) {
      toast.error('Please enter a Job Title first to generate content with AI.');
      return;
    }

    toast.loading('AI Composer is drafting your job post...', { id: 'ai-gen' });
    const result = await dispatch(
      generateJobDescriptionAction({
        title: formData.title,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        workplaceType: formData.workplaceType
      })
    );

    if (generateJobDescriptionAction.fulfilled.match(result)) {
      toast.success('Job post generated with AI! You can edit any field below.', { id: 'ai-gen' });
      const generated = result.payload.data;
      setFormData((prev) => ({
        ...prev,
        description: generated.description || prev.description,
        responsibilities: Array.isArray(generated.responsibilities)
          ? generated.responsibilities.join('\n')
          : generated.responsibilities,
        requirements: Array.isArray(generated.requirements)
          ? generated.requirements.join('\n')
          : generated.requirements,
        skills: Array.isArray(generated.skills)
          ? generated.skills.join(', ')
          : generated.skills || prev.skills,
        minSalary: generated.suggestedSalary?.min || prev.minSalary,
        maxSalary: generated.suggestedSalary?.max || prev.maxSalary
      }));
    } else {
      toast.error(result.payload || 'Failed to generate content with AI.', { id: 'ai-gen' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in Title, Description, and Location.');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      salary: {
        min: Number(formData.minSalary) || 0,
        max: Number(formData.maxSalary) || 0,
        currency: 'USD',
        period: 'year'
      }
    };

    const result = await dispatch(createJob(payload));
    setSubmitting(false);

    if (createJob.fulfilled.match(result)) {
      toast.success('Job listing published successfully!');
      navigate('/recruiter/jobs');
    } else {
      toast.error(result.payload || 'Failed to create job posting.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Create New Job Posting
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Post an open opportunity to reach verified tech candidates
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

      {/* AI Generator Helper Card */}
      <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-5 h-5 text-sky-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              AI Job Composer Available
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Enter a title and key skills, then click the button to auto-fill description, requirements, and responsibilities.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={aiLoading}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          {aiLoading ? 'Generating Post...' : 'Generate with AI'}
        </button>
      </div>

      {/* Job Form */}
      <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Engineer"
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Hiring Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. CloudScale AI"
              className="input-field text-xs"
            />
          </div>
        </div>

        {/* Category & Workplace */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field text-xs"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design & UI">Design & UI</option>
              <option value="DevOps">DevOps</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Product Management">Product Management</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

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
              Employment Type
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
        </div>

        {/* Location & Experience Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Location / Timezone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA or Remote (US/EU)"
              className="input-field text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="input-field text-xs"
            >
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        {/* Salary Brackets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Minimum Salary (USD/yr)
            </label>
            <input
              type="number"
              name="minSalary"
              value={formData.minSalary}
              onChange={handleChange}
              placeholder="100000"
              className="input-field text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Maximum Salary (USD/yr)
            </label>
            <input
              type="number"
              name="maxSalary"
              value={formData.maxSalary}
              onChange={handleChange}
              placeholder="150000"
              className="input-field text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Open Positions
            </label>
            <input
              type="number"
              name="openings"
              min="1"
              value={formData.openings}
              onChange={handleChange}
              className="input-field text-xs font-mono"
            />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Required Technical Skills (Comma separated)
          </label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, TypeScript, Node.js, MongoDB"
            className="input-field text-xs font-mono"
          />
        </div>

        {/* Role Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Role Overview & Mission <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the team, mission, project scope, and what success looks like in this role..."
            className="input-field text-xs leading-relaxed"
          />
        </div>

        {/* Responsibilities */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Key Responsibilities (One per line)
          </label>
          <textarea
            name="responsibilities"
            rows="4"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="Lead development of core microservices&#10;Collaborate with product designers&#10;Maintain code quality and test coverage"
            className="input-field text-xs leading-relaxed font-mono"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Qualifications & Requirements (One per line)
          </label>
          <textarea
            name="requirements"
            rows="4"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="3+ years building full stack web applications&#10;Proficiency with React and Node.js&#10;Experience with Docker and AWS"
            className="input-field text-xs leading-relaxed font-mono"
          />
        </div>

        {/* Publication Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Publication Status
          </label>
          <div className="flex items-center space-x-4 pt-1">
            <label className="flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={formData.status === 'published'}
                onChange={handleChange}
              />
              <span>Publish Immediately</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={formData.status === 'draft'}
                onChange={handleChange}
              />
              <span>Save as Draft</span>
            </label>
          </div>
        </div>

        {/* Submit */}
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
            disabled={submitting}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {submitting ? 'Creating Posting...' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
