import Category from '../models/Category.js';

/**
 * Get all active product and stall categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      count: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCategories
};
