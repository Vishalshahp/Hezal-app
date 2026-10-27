import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Mount health routes under /api/health
router.use('/health', healthRoutes);

// Additional domain routers will be mounted in future phases:
// router.use('/auth', authRoutes);
// router.use('/vendors', vendorRoutes);
// router.use('/products', productRoutes);

export default router;
