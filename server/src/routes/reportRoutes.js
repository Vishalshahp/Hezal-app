import { Router } from 'express';
import { submitPublicReport } from '../controllers/adminController.js';

const router = Router();

// POST /api/reports - Public shopper submission of misleading/inaccurate listing reports
router.post('/', submitPublicReport);

export default router;
