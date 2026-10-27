import { Router } from 'express';
import { getPublicProfile } from '../controllers/vendorProfileController.js';

const router = Router();

// GET /api/vendors/:id - Public vendor stall profile
router.get('/:id', getPublicProfile);

export default router;
