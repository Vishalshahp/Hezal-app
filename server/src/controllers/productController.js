import Product from '../models/Product.js';
import VendorProfile from '../models/VendorProfile.js';
import Category from '../models/Category.js';
import { uploadImageBuffer } from '../services/imageService.js';

/**
 * Get all products for the authenticated vendor
 * GET /api/products/my
 */
export const getMyProducts = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(200).json({
        success: true,
        status: 'ok',
        count: 0,
        data: {
          products: []
        }
      });
    }

    const products = await Product.find({ vendorId: profile._id })
      .populate('categoryId', 'name slug icon')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      status: 'ok',
      count: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product for the authenticated vendor
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'You must complete your stall profile before adding products to your catalogue.'
      });
    }

    const { name, description, categoryId, price, image, isAvailable } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Product name is required and must be at least 2 characters long.'
      });
    }

    // Validate price if provided
    let parsedPrice = null;
    if (price !== undefined && price !== null && price !== '') {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Price must be a positive number or zero.'
        });
      }
    }

    // Validate category reference if provided
    let validCategoryId = null;
    if (categoryId) {
      const catExists = await Category.findById(categoryId);
      if (catExists) {
        validCategoryId = catExists._id;
      }
    }

    const product = await Product.create({
      vendorId: profile._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      categoryId: validCategoryId,
      price: parsedPrice,
      image: image || '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
    });

    const populated = await Product.findById(product._id).populate('categoryId', 'name slug icon');

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Product added to catalogue successfully.',
      data: {
        product: populated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug icon')
      .populate('vendorId', 'stallName approvalStatus');

    if (!product) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing product (Ownership strictly enforced)
 * PATCH /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'You do not own a vendor profile.'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Product not found.'
      });
    }

    // Ownership check: Product must belong to the authenticated vendor's profile
    if (!product.vendorId.equals(profile._id)) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'Forbidden. You do not own this product and cannot modify it.'
      });
    }

    // Never allow changing product's vendorId
    delete req.body.vendorId;
    delete req.body._id;

    const { name, description, categoryId, price, image, isAvailable } = req.body;

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Product name must be at least 2 characters long.'
        });
      }
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (price !== undefined) {
      if (price === null || price === '') {
        product.price = null;
      } else {
        const parsed = parseFloat(price);
        if (isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Price must be a positive number or zero.'
          });
        }
        product.price = parsed;
      }
    }

    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await Category.findById(categoryId);
        if (cat) product.categoryId = cat._id;
      } else {
        product.categoryId = null;
      }
    }

    if (image !== undefined) {
      product.image = image;
    }

    if (isAvailable !== undefined) {
      product.isAvailable = Boolean(isAvailable);
    }

    await product.save();

    const updated = await Product.findById(product._id).populate('categoryId', 'name slug icon');

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Product updated successfully.',
      data: {
        product: updated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product (Ownership strictly enforced)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'You do not own a vendor profile.'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Product not found.'
      });
    }

    // Ownership check
    if (!product.vendorId.equals(profile._id)) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'Forbidden. You do not own this product and cannot delete it.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle product availability status (In stock / Out of stock)
 * PATCH /api/products/:id/availability
 */
export const toggleAvailability = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'You do not own a vendor profile.'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Product not found.'
      });
    }

    if (!product.vendorId.equals(profile._id)) {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'Forbidden. You do not own this product.'
      });
    }

    if (req.body.isAvailable !== undefined) {
      product.isAvailable = Boolean(req.body.isAvailable);
    } else {
      product.isAvailable = !product.isAvailable;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `Product is now marked as ${product.isAvailable ? 'available' : 'unavailable'}.`,
      data: {
        id: product._id,
        isAvailable: product.isAvailable
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload product photograph
 * POST /api/products/upload
 */
export const uploadProductPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'No image file provided in request.'
      });
    }

    const url = await uploadImageBuffer(req.file.buffer, req.file.originalname, 'products');

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Product photo uploaded successfully',
      data: {
        url
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  uploadProductPhoto
};
