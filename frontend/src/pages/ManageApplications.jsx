import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobApplications,
  updateApplicationStatus
} from '../redux/slices/applicationSlice';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import {
  Users,
  FileText,
  Download,
  Mail,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const ManageApplications = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  const { jobApplicationsData, loading } = useSelector((state) => state.applications);

  const [selectedLetter, setSelectedLetter] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    dispatch(fetchJobApplications(jobId));
  }, [dispatch, jobId]);

  const { job, applications } = jobApplicationsData;

  const handleStatusUpdate = async (applicationId, status) => {
    const note = prompt(`Optional note for candidate notification (Status: ${status}):`, '');
    const result = await dispatch(
      updateApplicationStatus({ id: applicationId, status, note: note || '' })
    );

    if (updateApplicationStatus.fulfilled.match(result)) {
      toast.success(`Application updated to ${status} and notification sent!`);
      dispatch(fetchJobApplications(jobId));
    } else {
      toast.error(result.payload || 'Failed to update status.');
    }
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

  if (loading || !job) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center">
        <Loader message="Loading candidate applications..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Job Postings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            Candidate Applications: {job.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {job.company} &bull; {job.location} &bull; {applications?.length || 0} candidate(s) applied
          </p>
        </div>

        <Link
          to={`/jobs/${job._id}`}
          target="_blank"
          className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          View Public Job Post
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Applications Table / Cards */}
      <div className="card-surface p-6">
        {applications && applications.length > 0 ? (
          <>
            {/* Mobile Candidate Card Layout (Screens < md) */}
            <div className="md:hidden space-y-3.5">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {app.candidate?.name || 'Applicant'}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {app.candidate?.email}
                      </p>
                      {app.candidate?.profile?.headline && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic mt-0.5 line-clamp-1">
                          "{app.candidate.profile.headline}"
                        </p>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold shrink-0 ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Skills */}
                  {app.candidate?.profile?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.candidate.profile.skills.slice(0, 5).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                      {app.candidate.profile.skills.length > 5 && (
                        <span className="text-[10px] text-zinc-400">
                          +{app.candidate.profile.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Resume & Cover Letter */}
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80">
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{app.resumeOriginalName || 'Download Resume'}</span>
                      </a>
                    )}
                    {app.coverLetter && (
                      <button
                        type="button"
                        onClick={() => setSelectedLetter(app.coverLetter)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 underline"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Read Note
                      </button>
                    )}
                  </div>

                  {/* Status update + Date */}
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-zinc-400 font-medium">Stage:</label>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        className="text-xs font-semibold py-1 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout (Screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium">
                    <th className="pb-3 font-semibold">Candidate</th>
                    <th className="pb-3 font-semibold">Skills Profile</th>
                    <th className="pb-3 font-semibold">Resume & Note</th>
                    <th className="pb-3 font-semibold">Current Stage</th>
                    <th className="pb-3 font-semibold">Applied</th>
                    <th className="pb-3 font-semibold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      {/* Candidate info */}
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {app.candidate?.name || 'Applicant'}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {app.candidate?.email}
                        </p>
                        {app.candidate?.profile?.headline && (
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic mt-0.5 line-clamp-1">
                            "{app.candidate.profile.headline}"
                          </p>
                        )}
                      </td>

                      {/* Skills */}
                      <td className="py-4 pr-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {(app.candidate?.profile?.skills || []).slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                          {(app.candidate?.profile?.skills?.length || 0) > 4 && (
                            <span className="text-[10px] text-zinc-400">
                              +{app.candidate.profile.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resume & Cover Letter */}
                      <td className="py-4 pr-4 space-y-1">
                        {app.resume && (
                          <a
                            href={app.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{app.resumeOriginalName || 'Resume.pdf'}</span>
                          </a>
                        )}
                        {app.coverLetter && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedLetter(app.coverLetter)}
                              className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 underline"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Read Cover Letter
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Current Stage */}
                      <td className="py-4 pr-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 pr-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      {/* Status updater dropdown */}
                      <td className="py-4 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                          className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-none"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No applications submitted yet
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              When candidates apply to this position, their resumes and profiles will appear here for review.
            </p>
          </div>
        )}
      </div>

      {/* Cover Letter Modal */}
      <Modal
        isOpen={!!selectedLetter}
        onClose={() => setSelectedLetter(null)}
        title="Candidate Cover Letter"
      >
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line border border-zinc-200 dark:border-zinc-700/60">
          {selectedLetter}
        </div>
      </Modal>
    </div>
  );
};

export default ManageApplications;
