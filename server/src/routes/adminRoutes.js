import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getDashboardMetrics,
  getVendorsAdmin,
  getVendorDetailsAdmin,
  updateVendorStatus,
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  toggleCategoryStatus,
  deleteCategoryAdmin,
  getReportsAdmin,
  updateReportStatus,
  getUsersAdmin,
  updateUserStatus,
  getAuditLogs
} from '../controllers/adminController.js';

const router = Router();

// Enforce authentication & administrator role on all routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

// 1. Dashboard Metrics
router.get('/metrics', getDashboardMetrics);

// 2. Vendor Application & Moderation
router.get('/vendors', getVendorsAdmin);
router.get('/vendors/:id', getVendorDetailsAdmin);
router.patch('/vendors/:id/status', updateVendorStatus);

// 3. Category Administration
router.get('/categories', getCategoriesAdmin);
router.post('/categories', createCategoryAdmin);
router.put('/categories/:id', updateCategoryAdmin);
router.patch('/categories/:id/toggle-status', toggleCategoryStatus);
router.delete('/categories/:id', deleteCategoryAdmin);

// 4. Report Management
router.get('/reports', getReportsAdmin);
router.patch('/reports/:id', updateReportStatus);

// 5. User Account Management
router.get('/users', getUsersAdmin);
router.patch('/users/:id/status', updateUserStatus);

// 6. Audit Trail History
router.get('/audit-logs', getAuditLogs);

export default router;
