import express from 'express';
import {
  analyzeResume,
  extractResumeText,
  getProfileResumeText,
  jobMatch,
  generateJobDescription,
  recommendJobs,
  interviewPrep
} from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze-resume', protect, authorizeRole('jobseeker'), analyzeResume);
router.post('/extract-resume-text', protect, authorizeRole('jobseeker'), upload.single('resume'), extractResumeText);
router.get('/profile-resume-text', protect, authorizeRole('jobseeker'), getProfileResumeText);
router.post('/job-match/:jobId', protect, authorizeRole('jobseeker'), jobMatch);
router.post('/generate-job-description', protect, authorizeRole('recruiter'), generateJobDescription);
router.get('/recommendations', protect, authorizeRole('jobseeker'), recommendJobs);
router.post('/interview-prep/:jobId', protect, authorizeRole('jobseeker'), interviewPrep);

export default router;
