import { Router } from 'express';
import {
  getMyProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  uploadProductPhoto
} from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// Specific routes MUST be declared before parameterized /:id routes
router.get('/my', authenticate, authorizeRoles('vendor'), getMyProducts);
router.post('/upload', authenticate, authorizeRoles('vendor'), uploadSingleImage('image'), uploadProductPhoto);
router.post('/', authenticate, authorizeRoles('vendor'), createProduct);

// Parameterized product routes
router.get('/:id', getProductById);
router.patch('/:id/availability', authenticate, authorizeRoles('vendor'), toggleAvailability);
router.patch('/:id', authenticate, authorizeRoles('vendor'), updateProduct);
router.put('/:id', authenticate, authorizeRoles('vendor'), updateProduct);
router.delete('/:id', authenticate, authorizeRoles('vendor'), deleteProduct);

export default router;
