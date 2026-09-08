import path from 'path';
import fs from 'fs';
import Job from '../models/Job.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { extractTextFromBuffer } from '../utils/documentExtractor.js';
import {
  analyzeResumeService,
  matchJobService,
  generateJobDescriptionService,
  generateInterviewPrepService
} from '../services/aiService.js';

// @desc    Extract plain text from an uploaded resume file (PDF, DOCX, TXT)
// @route   POST /api/ai/extract-resume-text
// @access  Private (Job Seeker)
export const extractResumeText = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a resume file (.pdf, .docx, or .txt) to extract.');
  }

  const extractedText = await extractTextFromBuffer(req.file.buffer, req.file.originalname);

  if (!extractedText || extractedText.trim().length < 20) {
    res.status(400);
    throw new Error('Could not extract readable text from this file. If it is an image scan, please paste the text directly.');
  }

  res.status(200).json({
    success: true,
    data: {
      text: extractedText,
      fileName: req.file.originalname
    }
  });
});

// @desc    Fetch and extract resume text from user profile (file or structured data)
// @route   GET /api/ai/profile-resume-text
// @access  Private (Job Seeker)
export const getProfileResumeText = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const p = user.profile || {};
  let extractedText = '';
  let source = 'profile_data';
  let fileName = user.profile?.resumeOriginalName || '';

  // 1. If user has an attached resume file, attempt to fetch and parse its text
  if (p.resume) {
    try {
      if (p.resume.startsWith('http://') || p.resume.startsWith('https://')) {
        const response = await fetch(p.resume);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          extractedText = await extractTextFromBuffer(buffer, p.resumeOriginalName || 'resume.pdf');
          if (extractedText && extractedText.length > 50) {
            source = 'resume_file';
          }
        }
      } else if (p.resume.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), p.resume.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          const buffer = await fs.promises.readFile(fullPath);
          extractedText = await extractTextFromBuffer(buffer, p.resumeOriginalName || 'resume.pdf');
          if (extractedText && extractedText.length > 50) {
            source = 'resume_file';
          }
        }
      }
    } catch (err) {
      console.warn('[Profile Resume Text Extraction Warning]:', err.message);
    }
  }

  // 2. If file extraction did not yield enough text, synthesize rich structured profile data
  if (!extractedText || extractedText.length < 50) {
    let profileContent = `${user.name}\n`;
    if (p.headline) profileContent += `Headline: ${p.headline}\n`;
    if (user.email) profileContent += `Email: ${user.email} | `;
    if (p.phone) profileContent += `Phone: ${p.phone} | `;
    if (p.location) profileContent += `Location: ${p.location}\n`;
    if (p.portfolio) profileContent += `Portfolio: ${p.portfolio} | `;
    if (p.github) profileContent += `GitHub: ${p.github} | `;
    if (p.linkedin) profileContent += `LinkedIn: ${p.linkedin}\n`;

    if (p.bio) profileContent += `\nSummary & Bio:\n${p.bio}\n`;

    if (p.skills && p.skills.length > 0) {
      profileContent += `\nCore Skills:\n${p.skills.join(', ')}\n`;
    }

    if (p.experience && p.experience.length > 0) {
      profileContent += '\nProfessional Experience:\n';
      p.experience.forEach((exp) => {
        const start = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
        const end = exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : '';
        const dateStr = start || end ? ` (${start} - ${end})` : '';
        profileContent += `- ${exp.role} at ${exp.company}${dateStr}\n`;
        if (exp.location) profileContent += `  Location: ${exp.location}\n`;
        if (exp.description) profileContent += `  ${exp.description}\n`;
      });
    }

    if (p.education && p.education.length > 0) {
      profileContent += '\nEducation:\n';
      p.education.forEach((edu) => {
        const yearStr = edu.startYear || edu.endYear ? ` (${edu.startYear || ''} - ${edu.endYear || ''})` : '';
        profileContent += `- ${edu.degree} in ${edu.fieldOfStudy || 'Field'} - ${edu.school}${yearStr}\n`;
      });
    }

    extractedText = profileContent.trim();
    source = 'profile_data';
  }

  if (!extractedText || extractedText.length < 20) {
    res.status(400);
    throw new Error('Your profile does not contain enough details (skills, bio, experience) or a readable resume.');
  }

  res.status(200).json({
    success: true,
    data: {
      text: extractedText,
      source,
      fileName
    }
  });
});

// @desc    Analyze resume text or uploaded resume
// @route   POST /api/ai/analyze-resume
// @access  Private (Job Seeker)
export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    res.status(400);
    throw new Error('Please provide at least 50 characters of resume content to analyze.');
  }

  const analysis = await analyzeResumeService(resumeText);

  res.status(200).json({
    success: true,
    data: analysis
  });
});

// @desc    Calculate AI Match score between candidate and job
// @route   POST /api/ai/job-match/:jobId
// @access  Private (Job Seeker)
export const jobMatch = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found.');
  }

  const user = await User.findById(req.user._id);

  const matchData = await matchJobService(user.profile, job);

  res.status(200).json({
    success: true,
    data: matchData
  });
});

// @desc    Generate AI Job Description for Recruiters
// @route   POST /api/ai/generate-job-description
// @access  Private (Recruiter)
export const generateJobDescription = asyncHandler(async (req, res) => {
  const { title, skills, experienceLevel, workplaceType } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please enter a job title to generate a description.');
  }

  const generated = await generateJobDescriptionService({
    title,
    skills,
    experienceLevel,
    workplaceType,
    company: req.user.profile?.companyName || req.user.name
  });

  res.status(200).json({
    success: true,
    data: generated
  });
});

// @desc    AI Job Recommendations for Candidate
// @route   GET /api/ai/recommendations
// @access  Private (Job Seeker)
export const recommendJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const userSkills = user.profile?.skills || [];

  const publishedJobs = await Job.find({ status: 'published' })
    .populate('recruiter', 'name email profile.companyLogo profile.companyName')
    .limit(30);

  // Score jobs by skill match
  const scoredJobs = publishedJobs.map((job) => {
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
    const matched = userSkills.filter((us) =>
      jobSkills.some((js) => js.includes(us.toLowerCase()) || us.toLowerCase().includes(js))
    );

    const matchPercent = jobSkills.length > 0
      ? Math.min(Math.round((matched.length / jobSkills.length) * 70) + 25, 95)
      : 70;

    return {
      job,
      matchPercent,
      matchedSkills: matched,
      missingSkills: (job.skills || []).filter((s) => !matched.some((m) => m.toLowerCase() === s.toLowerCase()))
    };
  });

  scoredJobs.sort((a, b) => b.matchPercent - a.matchPercent);

  res.status(200).json({
    success: true,
    data: scoredJobs.slice(0, 6)
  });
});

// @desc    Generate AI Interview Preparation for a target job
// @route   POST /api/ai/interview-prep/:jobId
// @access  Private (Job Seeker)
export const interviewPrep = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { excludeQuestions = [], page = 1, count = 3 } = req.body || {};

  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job listing not found.');
  }

  const prep = await generateInterviewPrepService(job, {
    excludeQuestions: Array.isArray(excludeQuestions) ? excludeQuestions : [],
    page: parseInt(page, 10) || 1,
    count: parseInt(count, 10) || 3
  });

  res.status(200).json({
    success: true,
    data: {
      job: {
        id: job._id,
        title: job.title,
        company: job.company
      },
      ...prep,
      page: parseInt(page, 10) || 1
    }
  });
});
