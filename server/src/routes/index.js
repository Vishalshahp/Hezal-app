import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Mount health routes under /api/health
router.use('/health', healthRoutes);

// Mount authentication routes under /api/auth
router.use('/auth', authRoutes);

// Role verification test/placeholder routes
router.get(
  '/customer/dashboard-test',
  authenticate,
  authorizeRoles('customer'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted to customer protected area',
      user: req.user
    });
  }
);

router.get(
  '/vendor/dashboard-test',
  authenticate,
  authorizeRoles('vendor'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted to vendor protected area',
      user: req.user
    });
  }
);

router.get(
  '/admin/dashboard-test',
  authenticate,
  authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted to administrator protected area',
      user: req.user
    });
  }
);

export default router;
