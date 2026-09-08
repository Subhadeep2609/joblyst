import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  saveJob,
  unsaveJob,
  getSavedJobs
} from '../controllers/applicationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Application Routes
router.post('/:jobId', protect, authorizeRole('jobseeker'), upload.single('resume'), applyToJob);
router.get('/my', protect, authorizeRole('jobseeker'), getMyApplications);
router.get('/job/:jobId', protect, authorizeRole('recruiter'), getJobApplications);
router.patch('/:id/status', protect, authorizeRole('recruiter'), updateApplicationStatus);

// Saved Jobs Routes
router.post('/saved-jobs/:jobId', protect, authorizeRole('jobseeker'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorizeRole('jobseeker'), unsaveJob);
router.get('/saved-jobs', protect, authorizeRole('jobseeker'), getSavedJobs);

export default router;
