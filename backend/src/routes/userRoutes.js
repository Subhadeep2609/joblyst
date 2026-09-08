import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadResume,
  getCandidates
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-resume', protect, authorizeRole('jobseeker'), upload.single('resume'), uploadResume);
router.get('/candidates', protect, authorizeRole('recruiter'), getCandidates);

export default router;
