import { Router } from 'express';
import { getCategories } from '../controllers/categoryController.js';

const router = Router();

// GET /api/categories - List active global categories
router.get('/', getCategories);

export default router;
