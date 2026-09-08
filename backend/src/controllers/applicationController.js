import Application from '../models/Application.js';
import Job from '../models/Job.js';
import SavedJob from '../models/SavedJob.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendApplicationStatusEmail } from '../services/emailService.js';
import { uploadFileToStorage } from '../services/storageService.js';

// @desc    Apply to a job listing
// @route   POST /api/applications/:jobId
// @access  Private (Job Seeker only)
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter, useProfileResume } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  if (job.status !== 'published') {
    res.status(400);
    throw new Error('This job listing is no longer accepting applications.');
  }

  // Check if candidate already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied to this job position.');
  }

  let resumePath = '';
  let resumeOriginalName = '';

  if (req.file) {
    const uploadResult = await uploadFileToStorage(req.file, 'resumes');
    resumePath = uploadResult.url;
    resumeOriginalName = req.file.originalname;
  } else if (useProfileResume === 'true' || useProfileResume === true) {
    if (!req.user.profile?.resume) {
      res.status(400);
      throw new Error('No profile resume found. Please upload a resume document.');
    }
    resumePath = req.user.profile.resume;
    resumeOriginalName = req.user.profile.resumeOriginalName || 'Profile_Resume.pdf';
  } else {
    res.status(400);
    throw new Error('Please upload a resume or select your profile resume.');
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    recruiter: job.recruiter,
    resume: resumePath,
    resumeOriginalName,
    coverLetter: coverLetter || '',
    status: 'Applied',
    timeline: [
      {
        status: 'Applied',
        changedAt: new Date(),
        note: 'Application successfully received.'
      }
    ]
  });

  // Increment application count on job
  await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully! You can track its status in your dashboard.',
    data: application
  });
});

// @desc    Get logged in job seeker's applications
// @route   GET /api/applications/my
// @access  Private (Job Seeker only)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({
      path: 'job',
      select: 'title company location salary jobType workplaceType status category'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: applications
  });
});

// @desc    Get all applications for a specific job (Recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
export const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view applications for this job.');
  }

  const applications = await Application.find({ job: jobId })
    .populate('candidate', 'name email profile')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      job,
      applications
    }
  });
});

// @desc    Update application status (Recruiter view)
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter only)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email')
    .populate('job', 'title company');

  if (!application) {
    res.status(404);
    throw new Error('Application not found.');
  }

  if (application.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this application.');
  }

  application.status = status;
  application.timeline.push({
    status,
    changedAt: new Date(),
    note: note || `Status updated to ${status}`
  });

  await application.save();

  // Send email notification to candidate
  if (application.candidate?.email) {
    await sendApplicationStatusEmail(
      application.candidate.email,
      application.candidate.name,
      application.job?.title || 'Position',
      application.job?.company || 'Company',
      status,
      note
    );
  }

  res.status(200).json({
    success: true,
    message: `Application status successfully updated to ${status}.`,
    data: application
  });
});

// @desc    Bookmark / Save a job
// @route   POST /api/applications/saved-jobs/:jobId
// @access  Private (Job Seeker only)
export const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found.');
  }

  const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Job is already saved in your bookmarks.'
    });
  }

  await SavedJob.create({
    user: req.user._id,
    job: jobId
  });

  res.status(201).json({
    success: true,
    message: 'Job saved to your bookmarks.'
  });
});

// @desc    Remove saved job
// @route   DELETE /api/applications/saved-jobs/:jobId
// @access  Private (Job Seeker only)
export const unsaveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  await SavedJob.findOneAndDelete({ user: req.user._id, job: jobId });

  res.status(200).json({
    success: true,
    message: 'Job removed from bookmarks.'
  });
});

// @desc    Get user's saved jobs
// @route   GET /api/applications/saved-jobs
// @access  Private (Job Seeker only)
export const getSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ user: req.user._id })
    .populate({
      path: 'job',
      populate: { path: 'recruiter', select: 'name email profile.companyLogo' }
    })
    .sort({ savedAt: -1 });

  res.status(200).json({
    success: true,
    data: saved.map((s) => s.job).filter(Boolean)
  });
});
