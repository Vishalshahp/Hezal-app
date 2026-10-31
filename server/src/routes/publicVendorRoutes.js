import { Router } from 'express';
import {
  searchVendors,
  getNearbyVendors,
  getPublicStallProfile
} from '../controllers/discoveryController.js';

const router = Router();

// GET /api/vendors/nearby - Geospatial nearby vendor discovery (must precede /:id)
router.get('/nearby', getNearbyVendors);

// GET /api/vendors & GET /api/vendors/search - Public search and discovery
router.get('/search', searchVendors);
router.get('/', searchVendors);

// GET /api/vendors/:id - Public vendor stall profile (valid 24-hex ObjectId)
router.get('/:id', getPublicStallProfile);

export default router;
