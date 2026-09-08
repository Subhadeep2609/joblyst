import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadFileToStorage, deleteFileFromStorage } from '../services/storageService.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Update basic user info
  if (req.body.name) user.name = req.body.name;

  // Update nested profile info
  const profileFields = [
    'headline', 'bio', 'phone', 'location', 'avatar',
    'skills', 'experience', 'education', 'portfolio', 'github', 'linkedin',
    'companyName', 'companyWebsite', 'companyLogo', 'companySize', 'companyBio', 'companyLocation'
  ];

  profileFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user.profile[field] = req.body[field];
    } else if (req.body.profile && req.body.profile[field] !== undefined) {
      user.profile[field] = req.body.profile[field];
    }
  });

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: updatedUser
  });
});

// @desc    Upload profile resume
// @route   POST /api/users/upload-resume
// @access  Private (Job Seeker)
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a valid resume document (PDF, DOC, DOCX).');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const oldResume = user.profile?.resume;

  // Upload to Cloudinary (or local storage fallback)
  const uploadResult = await uploadFileToStorage(req.file, 'resumes');

  user.profile.resume = uploadResult.url;
  user.profile.resumeOriginalName = req.file.originalname;

  await user.save();

  // Clean up previous resume file if changed
  if (oldResume && oldResume !== uploadResult.url) {
    deleteFileFromStorage(oldResume).catch((err) =>
      console.warn('Failed to delete old resume:', err.message)
    );
  }

  res.status(200).json({
    success: true,
    message: 'Resume uploaded and linked to profile successfully.',
    data: {
      resume: uploadResult.url,
      resumeOriginalName: req.file.originalname,
      storage: uploadResult.storage
    }
  });
});

// @desc    Get candidates (for recruiters)
// @route   GET /api/users/candidates
// @access  Private (Recruiter only)
export const getCandidates = asyncHandler(async (req, res) => {
  const { search, skill, location, page = 1, limit = 10 } = req.query;

  const query = { role: 'jobseeker', isEmailVerified: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'profile.headline': { $regex: search, $options: 'i' } },
      { 'profile.skills': { $regex: search, $options: 'i' } }
    ];
  }

  if (skill) {
    query['profile.skills'] = { $in: [new RegExp(skill, 'i')] };
  }

  if (location) {
    query['profile.location'] = { $regex: location, $options: 'i' };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await User.countDocuments(query);

  const candidates = await User.find(query)
    .select('-password')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  res.status(200).json({
    success: true,
    data: {
      candidates,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    }
  });
});
