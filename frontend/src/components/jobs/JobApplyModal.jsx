import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyJob } from '../../redux/slices/applicationSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

const JobApplyModal = ({ isOpen, onClose, job }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { submitting } = useSelector((state) => state.applications);

  const hasProfileResume = !!user?.profile?.resume;
  const [useProfileResume, setUseProfileResume] = useState(hasProfileResume);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, and DOCX files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB.');
        return;
      }
      setResumeFile(file);
      setUseProfileResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useProfileResume && !resumeFile) {
      toast.error('Please upload a resume or select your profile resume.');
      return;
    }

    const formData = new FormData();
    formData.append('coverLetter', coverLetter);
    formData.append('useProfileResume', useProfileResume);

    if (resumeFile && !useProfileResume) {
      formData.append('resume', resumeFile);
    }

    const result = await dispatch(applyJob({ jobId: job._id, formData }));

    if (applyJob.fulfilled.match(result)) {
      toast.success('Application submitted successfully!');
      onClose();
    } else {
      toast.error(result.payload || 'Failed to submit application.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply for ${job?.title || 'Position'}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Target Position</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{job?.title}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{job?.company} &bull; {job?.location}</p>
        </div>

        {/* Resume Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Resume Submission <span className="text-red-500">*</span>
          </label>

          {hasProfileResume && (
            <div
              onClick={() => {
                setUseProfileResume(true);
                setResumeFile(null);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                useProfileResume
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    Use Profile Resume
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {user?.profile?.resumeOriginalName || 'Resume.pdf'}
                  </p>
                </div>
              </div>
              {useProfileResume && <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />}
            </div>
          )}

          {/* Or Upload New File */}
          <div
            className={`p-4 rounded-xl border-2 border-dashed text-center transition-all ${
              !useProfileResume && resumeFile
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/50 dark:bg-zinc-800/40'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
          >
            <input
              type="file"
              id="job-resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="job-resume-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
            >
              <Upload className="w-5 h-5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {resumeFile ? resumeFile.name : 'Upload tailored resume (PDF, DOC, DOCX up to 5MB)'}
              </span>
              {resumeFile && (
                <span className="text-[10px] text-emerald-500 font-medium">
                  File attached &bull; {(resumeFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Cover Letter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
            Cover Letter / Note to Recruiter (Optional)
          </label>
          <textarea
            rows="4"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Briefly explain why you're a great fit for this role..."
            className="input-field text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs flex items-center gap-2"
          >
            {submitting ? 'Submitting Application...' : 'Confirm & Submit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JobApplyModal;
