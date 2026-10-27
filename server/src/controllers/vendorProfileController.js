import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import { uploadImageBuffer } from '../services/imageService.js';
import { COOKIE_NAME } from '../utils/token.js';

/**
 * Retrieve authenticated vendor's own stall profile
 * GET /api/vendor/profile
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id }).populate(
      'categories',
      'name slug icon'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'No vendor profile found for this account. Please create one.'
      });
    }

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create stall profile for authenticated vendor
 * POST /api/vendor/profile
 */
export const createProfile = async (req, res, next) => {
  try {
    // Check for existing profile
    const existing = await VendorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        status: 'conflict',
        message: 'A vendor profile already exists for this account.'
      });
    }

    const {
      stallName,
      stallType,
      tagline,
      description,
      categories,
      coverPhoto,
      photos,
      contactPublic,
      address,
      location,
      openingHours
    } = req.body;

    // Field validations
    if (!stallName || !description) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Stall name and description are required.'
      });
    }

    if (!contactPublic || !contactPublic.phone) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Public contact phone is required.'
      });
    }

    if (!address || !address.street || !address.area) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Street and area address details are required.'
      });
    }

    // Default coordinates: [longitude, latitude]
    const defaultCoords = [72.55289, 23.03721];
    let coordinates = defaultCoords;
    if (
      location &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2 &&
      !isNaN(location.coordinates[0]) &&
      !isNaN(location.coordinates[1])
    ) {
      const lng = parseFloat(location.coordinates[0]);
      const lat = parseFloat(location.coordinates[1]);
      if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        coordinates = [lng, lat];
      }
    }

    // Profile creation: approvalStatus is always set to 'pending' by server
    const profile = await VendorProfile.create({
      userId: req.user._id,
      stallName: stallName.trim(),
      stallType: stallType === 'mobile' ? 'mobile' : 'fixed',
      tagline: tagline ? tagline.trim() : '',
      description: description.trim(),
      categories: Array.isArray(categories) ? categories : [],
      coverPhoto: coverPhoto || '',
      photos: Array.isArray(photos) ? photos : [],
      contactPublic: {
        phone: contactPublic.phone.trim(),
        whatsapp: contactPublic.whatsapp ? contactPublic.whatsapp.trim() : ''
      },
      address: {
        street: address.street.trim(),
        area: address.area.trim(),
        city: address.city ? address.city.trim() : 'Ahmedabad',
        state: address.state ? address.state.trim() : 'Gujarat',
        postalCode: address.postalCode ? address.postalCode.trim() : '',
        landmark: address.landmark ? address.landmark.trim() : ''
      },
      location: {
        type: 'Point',
        coordinates
      },
      locationUpdatedAt: new Date(),
      openingHours: openingHours || undefined,
      availabilityStatus: 'open',
      approvalStatus: 'pending' // Vendor CANNOT set 'approved'
    });

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Stall profile created successfully and submitted for administrator review.',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated vendor's stall profile
 * PATCH /api/vendor/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found. Please create your stall profile first.'
      });
    }

    // Prevent vendor from altering approval status or user ownership
    delete req.body.approvalStatus;
    delete req.body.adminNote;
    delete req.body.userId;
    delete req.body._id;

    const {
      stallName,
      stallType,
      tagline,
      description,
      categories,
      coverPhoto,
      photos,
      contactPublic,
      address
    } = req.body;

    if (stallName !== undefined) profile.stallName = stallName.trim();
    if (stallType !== undefined) profile.stallType = stallType === 'mobile' ? 'mobile' : 'fixed';
    if (tagline !== undefined) profile.tagline = tagline.trim();
    if (description !== undefined) profile.description = description.trim();
    if (categories !== undefined) profile.categories = categories;
    if (coverPhoto !== undefined) profile.coverPhoto = coverPhoto;
    if (photos !== undefined) profile.photos = photos;

    if (contactPublic) {
      if (contactPublic.phone !== undefined) profile.contactPublic.phone = contactPublic.phone.trim();
      if (contactPublic.whatsapp !== undefined) profile.contactPublic.whatsapp = contactPublic.whatsapp.trim();
    }

    if (address) {
      if (address.street !== undefined) profile.address.street = address.street.trim();
      if (address.area !== undefined) profile.address.area = address.area.trim();
      if (address.city !== undefined) profile.address.city = address.city.trim();
      if (address.state !== undefined) profile.address.state = address.state.trim();
      if (address.postalCode !== undefined) profile.address.postalCode = address.postalCode.trim();
      if (address.landmark !== undefined) profile.address.landmark = address.landmark.trim();
    }

    await profile.save();

    const updated = await VendorProfile.findById(profile._id).populate('categories', 'name slug icon');

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Stall profile updated successfully.',
      data: {
        profile: updated
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update published stall coordinates and address
 * PATCH /api/vendor/location
 */
export const updateLocation = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found.'
      });
    }

    const { longitude, latitude, street, area, landmark } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Both longitude and latitude are required.'
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Longitude must be a valid number between -180 and 180.'
      });
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Latitude must be a valid number between -90 and 90.'
      });
    }

    // Save GeoJSON Point in [longitude, latitude] order
    profile.location = {
      type: 'Point',
      coordinates: [lng, lat]
    };
    profile.locationUpdatedAt = new Date();

    if (street) profile.address.street = street.trim();
    if (area) profile.address.area = area.trim();
    if (landmark) profile.address.landmark = landmark.trim();

    await profile.save();

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Stall coordinates and location updated successfully.',
      data: {
        location: profile.location,
        locationUpdatedAt: profile.locationUpdatedAt,
        address: profile.address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update stall opening hours and availability status
 * PATCH /api/vendor/availability
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found.'
      });
    }

    const { availabilityStatus, openingHours } = req.body;

    if (availabilityStatus) {
      if (!['open', 'away', 'closed'].includes(availabilityStatus)) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Availability status must be either open, away, or closed.'
        });
      }
      profile.availabilityStatus = availabilityStatus;
    }

    if (Array.isArray(openingHours)) {
      profile.openingHours = openingHours;
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Stall availability status updated successfully.',
      data: {
        availabilityStatus: profile.availabilityStatus,
        openingHours: profile.openingHours
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload stall photograph
 * POST /api/vendor/upload
 */
export const uploadStallPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'No image file provided in request.'
      });
    }

    const url = await uploadImageBuffer(req.file.buffer, req.file.originalname, 'stalls');

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Image uploaded successfully',
      data: {
        url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor dashboard operational metrics
 * GET /api/vendor/stats
 */
export const getVendorStats = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(200).json({
        success: true,
        status: 'ok',
        data: {
          hasProfile: false,
          approvalStatus: 'uncreated',
          completionPercentage: 0,
          totalProducts: 0,
          availableProducts: 0,
          unavailableProducts: 0
        }
      });
    }

    // Calculate actual completeness
    let completedFields = 0;
    const requiredItems = [
      Boolean(profile.stallName),
      Boolean(profile.description),
      Boolean(profile.categories && profile.categories.length > 0),
      Boolean(profile.coverPhoto),
      Boolean(profile.contactPublic?.phone),
      Boolean(profile.address?.street),
      Boolean(profile.address?.area),
      Boolean(profile.location?.coordinates?.length === 2)
    ];

    completedFields = requiredItems.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / requiredItems.length) * 100);

    const [totalProducts, availableProducts, unavailableProducts] = await Promise.all([
      Product.countDocuments({ vendorId: profile._id }),
      Product.countDocuments({ vendorId: profile._id, isAvailable: true }),
      Product.countDocuments({ vendorId: profile._id, isAvailable: false })
    ]);

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        hasProfile: true,
        profileId: profile._id,
        stallName: profile.stallName,
        approvalStatus: profile.approvalStatus,
        availabilityStatus: profile.availabilityStatus,
        locationUpdatedAt: profile.locationUpdatedAt,
        completionPercentage,
        totalProducts,
        availableProducts,
        unavailableProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public vendor profile
 * GET /api/vendors/:id
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id)
      .populate('categories', 'name slug icon')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found.'
      });
    }

    // Public access rule: only approved profiles are publicly visible
    // Allow owner or admin to preview unapproved profiles
    let isOwner = false;
    let isAdmin = false;

    // Optional authentication check for owner preview
    let token = null;
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        if (decoded && decoded.id === profile.userId.toString()) {
          isOwner = true;
        }
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (_err) {
        // Ignored, proceed as public unauthenticated visitor
      }
    }

    if (profile.approvalStatus !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'This vendor stall is not publicly listed or is pending verification.'
      });
    }

    // Fetch active products for this vendor
    const products = await Product.find({ vendorId: profile._id, isAvailable: true })
      .populate('categoryId', 'name slug')
      .lean();

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        profile,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  createProfile,
  updateProfile,
  updateLocation,
  updateAvailability,
  uploadStallPhoto,
  getVendorStats,
  getPublicProfile
};
