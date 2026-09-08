import Job from '../models/Job.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all published jobs with search, filtering & pagination
// @route   GET /api/jobs
// @access  Public
export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    jobType,
    workplaceType,
    experienceLevel,
    category,
    minSalary,
    maxSalary,
    sort = 'newest',
    page = 1,
    limit = 10
  } = req.query;

  // Base query: Only published jobs for discovery
  const query = { status: 'published' };

  // Full-text / Regex search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Job Type filter
  if (jobType && jobType !== 'All') {
    query.jobType = jobType;
  }

  // Workplace Type filter (Remote, On-site, Hybrid)
  if (workplaceType && workplaceType !== 'All') {
    query.workplaceType = workplaceType;
  }

  // Experience Level
  if (experienceLevel && experienceLevel !== 'All') {
    query.experienceLevel = experienceLevel;
  }

  // Category
  if (category && category !== 'All') {
    query.category = { $regex: category, $options: 'i' };
  }

  // Salary range
  if (minSalary) {
    query['salary.max'] = { $gte: Number(minSalary) };
  }
  if (maxSalary) {
    query['salary.min'] = { $lte: Number(maxSalary) };
  }

  // Sorting
  let sortOption = { createdAt: -1 }; // newest
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'salaryHigh') sortOption = { 'salary.max': -1 };
  if (sort === 'salaryLow') sortOption = { 'salary.min': 1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('recruiter', 'name email profile.companyLogo profile.companyName')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'recruiter',
    'name email profile.companyName profile.companyWebsite profile.companyLogo profile.companyBio profile.companyLocation'
  );

  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    description,
    requirements,
    responsibilities,
    skills,
    salary,
    location,
    workplaceType,
    jobType,
    experienceLevel,
    category,
    openings,
    deadline,
    status
  } = req.body;

  if (!title || !description || !location) {
    res.status(400);
    throw new Error('Please provide title, description, and location.');
  }

  const effectiveCompany = company || req.user.profile?.companyName || req.user.name;

  const job = await Job.create({
    recruiter: req.user._id,
    title,
    company: effectiveCompany,
    description,
    requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter(Boolean) : []),
    responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').filter(Boolean) : []),
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
    salary: salary || { min: 0, max: 0, currency: 'USD', period: 'year' },
    location,
    workplaceType: workplaceType || 'Remote',
    jobType: jobType || 'Full-time',
    experienceLevel: experienceLevel || 'Mid',
    category: category || 'Engineering',
    openings: openings ? Number(openings) : 1,
    deadline: deadline || null,
    status: status || 'published'
  });

  res.status(201).json({
    success: true,
    message: 'Job listing posted successfully.',
    data: job
  });
});

// @desc    Update job listing
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter owner only)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  // Ensure recruiter owns this job
  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this job listing.');
  }

  const allowedUpdates = [
    'title', 'company', 'description', 'requirements', 'responsibilities',
    'skills', 'salary', 'location', 'workplaceType', 'jobType',
    'experienceLevel', 'category', 'openings', 'deadline', 'status'
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (['requirements', 'responsibilities'].includes(field) && typeof req.body[field] === 'string') {
        job[field] = req.body[field].split('\n').filter(Boolean);
      } else if (field === 'skills' && typeof req.body[field] === 'string') {
        job.skills = req.body[field].split(',').map((s) => s.trim());
      } else {
        job[field] = req.body[field];
      }
    }
  });

  const updatedJob = await job.save();

  res.status(200).json({
    success: true,
    message: 'Job listing updated successfully.',
    data: updatedJob
  });
});

// @desc    Delete job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter owner only)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this job listing.');
  }

  // Cascade delete applications for this job
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Job and associated applications deleted successfully.'
  });
});

// @desc    Toggle/Update job status (draft, published, closed)
// @route   PATCH /api/jobs/:id/status
// @access  Private (Recruiter owner only)
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published', 'closed'].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be 'draft', 'published', or 'closed'.");
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this job.');
  }

  job.status = status;
  await job.save();

  res.status(200).json({
    success: true,
    message: `Job status updated to ${status}.`,
    data: job
  });
});

// @desc    Get all jobs posted by the logged-in recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter only)
export const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

  // Compute live applicant counts
  const jobsWithMetrics = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        applicationsCount: count
      };
    })
  );

  res.status(200).json({
    success: true,
    data: jobsWithMetrics
  });
});
