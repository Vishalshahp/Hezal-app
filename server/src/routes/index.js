import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import publicVendorRoutes from './publicVendorRoutes.js';
import productRoutes from './productRoutes.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Mount health routes under /api/health
router.use('/health', healthRoutes);

// Mount authentication routes under /api/auth
router.use('/auth', authRoutes);

// Mount categories routes under /api/categories
router.use('/categories', categoryRoutes);

// Mount vendor operational routes under /api/vendor
router.use('/vendor', vendorRoutes);

// Mount public vendor discovery routes under /api/vendors
router.use('/vendors', publicVendorRoutes);

// Mount product routes under /api/products
router.use('/products', productRoutes);

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
