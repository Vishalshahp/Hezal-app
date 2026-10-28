import { Router } from 'express';
import { submitPublicReport } from '../controllers/adminController.js';
import { reportLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/reports - Public shopper submission of misleading/inaccurate listing reports
router.post('/', reportLimiter, submitPublicReport);

export default router;
