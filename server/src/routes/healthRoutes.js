import { Router } from 'express';
import { getApiHealth, getDbHealth } from '../controllers/healthController.js';

const router = Router();

// GET /api/health - API server status
router.get('/', getApiHealth);

// GET /api/health/db - MongoDB real connectivity check
router.get('/db', getDbHealth);

export default router;
