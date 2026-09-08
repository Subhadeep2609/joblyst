import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRecruiterJobs,
  deleteJob,
  updateJobStatus
} from '../redux/slices/jobSlice';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Eye,
  ExternalLink
} from 'lucide-react';

const ManageJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recruiterJobs, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchRecruiterJobs());
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    const result = await dispatch(updateJobStatus({ id, status }));
    if (updateJobStatus.fulfilled.match(result)) {
      toast.success(`Job status changed to ${status}.`);
      dispatch(fetchRecruiterJobs());
    } else {
      toast.error(result.payload || 'Failed to update status.');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? All submitted candidate applications for this position will be permanently deleted.`)) {
      const result = await dispatch(deleteJob(id));
      if (deleteJob.fulfilled.match(result)) {
        toast.success('Job and applications deleted successfully.');
      } else {
        toast.error(result.payload || 'Failed to delete job.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Manage Job Postings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Monitor status, manage applicants, and update listing visibility
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="btn-primary text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Position
        </Link>
      </div>

      <div className="card-surface p-6">
        {loading ? (
          <div className="py-12">
            <Loader message="Loading posted jobs..." />
          </div>
        ) : recruiterJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium">
                  <th className="pb-3 font-semibold">Title & Category</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Applications</th>
                  <th className="pb-3 font-semibold">Posted Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {recruiterJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1.5"
                      >
                        {job.title}
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </Link>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {job.category} &bull; {job.location}
                      </p>
                    </td>

                    <td className="py-3.5 pr-4 text-zinc-600 dark:text-zinc-400">
                      {job.jobType} ({job.workplaceType})
                    </td>

                    <td className="py-3.5 pr-4">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded-md border cursor-pointer focus:outline-none ${
                          job.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : job.status === 'draft'
                            ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 pr-4">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="inline-flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationsCount || 0} applicants</span>
                      </Link>
                    </td>

                    <td className="py-3.5 pr-4 text-zinc-500 dark:text-zinc-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        title="Review candidate resumes"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Link>

                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        title="Edit posting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(job._id, job.title)}
                        className="btn-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Delete posting"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No jobs currently found. Create your first opening to begin receiving applicants.
            </p>
            <Link to="/recruiter/jobs/create" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              Post a Position
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
