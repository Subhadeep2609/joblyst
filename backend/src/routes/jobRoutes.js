import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getRecruiterJobs
} from '../controllers/jobController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/recruiter/my-jobs', protect, authorizeRole('recruiter'), getRecruiterJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorizeRole('recruiter'), createJob);
router.put('/:id', protect, authorizeRole('recruiter'), updateJob);
router.delete('/:id', protect, authorizeRole('recruiter'), deleteJob);
router.patch('/:id/status', protect, authorizeRole('recruiter'), updateJobStatus);

export default router;
