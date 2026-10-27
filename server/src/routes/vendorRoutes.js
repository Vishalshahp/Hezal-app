import { Router } from 'express';
import {
  getMyProfile,
  createProfile,
  updateProfile,
  updateLocation,
  updateAvailability,
  uploadStallPhoto,
  getVendorStats
} from '../controllers/vendorProfileController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// All routes under /api/vendor require authenticated 'vendor' role
router.use(authenticate, authorizeRoles('vendor'));

// Stall Profile Management
router.get('/profile', getMyProfile);
router.post('/profile', createProfile);
router.patch('/profile', updateProfile);

// Stall Location & Availability Hub
router.patch('/location', updateLocation);
router.patch('/availability', updateAvailability);

// Image Upload
router.post('/upload', uploadSingleImage('image'), uploadStallPhoto);

// Dashboard Operational Metrics
router.get('/stats', getVendorStats);

export default router;
