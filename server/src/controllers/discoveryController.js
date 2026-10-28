import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { escapeRegex } from '../utils/sanitize.js';

const COOKIE_NAME = 'hezal_auth_token';

/**
 * Public search and discovery endpoint
 * GET /api/vendors
 * Supports:
 *   q - text search (stall name, description, address, matching products)
 *   category - category slug or ObjectId
 *   area - locality or area string
 *   stallType - 'fixed' | 'mobile'
 *   availabilityStatus - 'open' | 'away' | 'closed'
 *   sort - 'newest' | 'name_asc' | 'name_desc' | 'updated'
 *   page - integer (default 1)
 *   limit - integer (default 12, max 50)
 */
export const searchVendors = async (req, res, next) => {
  try {
    const {
      q,
      category,
      area,
      stallType,
      availabilityStatus,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (parsedPage - 1) * parsedLimit;

    // 1. Base criteria: only approved stalls
    const matchCriteria = {
      approvalStatus: 'approved'
    };

    // 2. Ensure vendor user accounts are active (not suspended)
    const activeVendors = await User.find({
      role: 'vendor',
      accountStatus: { $ne: 'suspended' }
    }).select('_id').lean();

    const activeUserIds = activeVendors.map((u) => u._id);
    matchCriteria.userId = { $in: activeUserIds };

    // 3. Category filter
    if (category) {
      let categoryId = null;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryId = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category.trim().toLowerCase() }).lean();
        if (foundCategory) {
          categoryId = foundCategory._id;
        } else {
          // Category slug does not exist, return empty result set
          return res.status(200).json({
            success: true,
            status: 'ok',
            data: {
              vendors: [],
              pagination: {
                total: 0,
                page: parsedPage,
                limit: parsedLimit,
                totalPages: 0
              },
              filters: { q, category, area, stallType, availabilityStatus }
            }
          });
        }
      }
      matchCriteria.categories = categoryId;
    }

    // 4. Area / Locality filter
    if (area && typeof area === 'string' && area.trim()) {
      const safeArea = escapeRegex(area.trim());
      const areaRegex = new RegExp(safeArea, 'i');
      matchCriteria['$or'] = [
        { 'address.area': areaRegex },
        { 'address.city': areaRegex },
        { 'address.street': areaRegex },
        { 'address.landmark': areaRegex }
      ];
    }

    // 5. Stall type filter
    if (stallType && ['fixed', 'mobile'].includes(stallType.toLowerCase())) {
      matchCriteria.stallType = stallType.toLowerCase();
    }

    // 6. Availability filter
    if (availabilityStatus && ['open', 'away', 'closed'].includes(availabilityStatus.toLowerCase())) {
      matchCriteria.availabilityStatus = availabilityStatus.toLowerCase();
    }

    // 7. General text search (q)
    if (q && typeof q === 'string' && q.trim()) {
      const trimmedQ = escapeRegex(q.trim());
      const textRegex = new RegExp(trimmedQ, 'i');

      // Find products matching query to find vendors who sell them
      const matchingProductVendorIds = await Product.find({
        $or: [
          { name: textRegex },
          { description: textRegex }
        ],
        isAvailable: true
      }).distinct('vendorId');

      const textConditions = [
        { stallName: textRegex },
        { tagline: textRegex },
        { description: textRegex },
        { 'address.area': textRegex },
        { 'address.street': textRegex },
        { 'address.city': textRegex },
        { _id: { $in: matchingProductVendorIds } }
      ];

      if (matchCriteria['$or']) {
        // If area filter already populated $or, combine with $and
        matchCriteria['$and'] = [
          { $or: matchCriteria['$or'] },
          { $or: textConditions }
        ];
        delete matchCriteria['$or'];
      } else {
        matchCriteria['$or'] = textConditions;
      }
    }

    // 8. Sorting strategy
    let sortOption = { createdAt: -1 };
    if (sort === 'name_asc') sortOption = { stallName: 1 };
    else if (sort === 'name_desc') sortOption = { stallName: -1 };
    else if (sort === 'updated') sortOption = { locationUpdatedAt: -1 };

    // 9. Execute count and find queries
    const [total, vendors] = await Promise.all([
      VendorProfile.countDocuments(matchCriteria),
      VendorProfile.find(matchCriteria)
        .select(
          'stallName stallType tagline description categories coverPhoto photos contactPublic address location locationUpdatedAt openingHours availabilityStatus approvalStatus createdAt'
        )
        .populate('categories', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    // 10. Enrich with product counts and preview sample products
    const vendorIds = vendors.map((v) => v._id);
    const activeProducts = await Product.find({
      vendorId: { $in: vendorIds },
      isAvailable: true
    })
      .select('vendorId name price image isAvailable')
      .lean();

    const productMap = {};
    for (const prod of activeProducts) {
      const vid = prod.vendorId.toString();
      if (!productMap[vid]) {
        productMap[vid] = [];
      }
      productMap[vid].push(prod);
    }

    const formattedVendors = vendors.map((v) => {
      const prods = productMap[v._id.toString()] || [];
      return {
        id: v._id,
        stallName: v.stallName,
        stallType: v.stallType,
        tagline: v.tagline,
        description: v.description,
        categories: v.categories,
        coverPhoto: v.coverPhoto,
        photos: v.photos,
        contactPublic: v.contactPublic,
        address: v.address,
        location: v.location,
        locationUpdatedAt: v.locationUpdatedAt,
        openingHours: v.openingHours,
        availabilityStatus: v.availabilityStatus,
        approvalStatus: v.approvalStatus,
        createdAt: v.createdAt,
        productCount: prods.length,
        sampleProducts: prods.slice(0, 3)
      };
    });

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        vendors: formattedVendors,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages
        },
        filters: {
          q: q || '',
          category: category || '',
          area: area || '',
          stallType: stallType || '',
          availabilityStatus: availabilityStatus || '',
          sort
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Geospatial nearby vendor discovery endpoint
 * GET /api/vendors/nearby
 * Supports:
 *   longitude - number (required, -180 to 180)
 *   latitude - number (required, -90 to 90)
 *   radius - distance in km (default 5, min 0.1, max 50)
 *   q - text query (optional)
 *   category - category slug or ObjectId (optional)
 *   stallType - 'fixed' | 'mobile' (optional)
 *   availabilityStatus - 'open' | 'away' | 'closed' (optional)
 *   page - integer (default 1)
 *   limit - integer (default 12, max 50)
 */
export const getNearbyVendors = async (req, res, next) => {
  try {
    const {
      longitude,
      latitude,
      radius = 5,
      q,
      category,
      stallType,
      availabilityStatus,
      page = 1,
      limit = 12
    } = req.query;

    // Validate coordinates
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Both longitude and latitude query parameters are required for nearby discovery.'
      });
    }

    const parsedLng = parseFloat(longitude);
    const parsedLat = parseFloat(latitude);

    if (
      isNaN(parsedLng) ||
      isNaN(parsedLat) ||
      parsedLng < -180 ||
      parsedLng > 180 ||
      parsedLat < -90 ||
      parsedLat > 90
    ) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message:
          'Coordinates must be valid numbers: longitude between -180 and 180, latitude between -90 and 90.'
      });
    }

    // Validate radius (in km, bounded 0.1 to 50 km)
    let parsedRadius = parseFloat(radius);
    if (isNaN(parsedRadius) || parsedRadius <= 0) {
      parsedRadius = 5;
    }
    const maxRadiusKm = Math.min(50, Math.max(0.1, parsedRadius));
    const maxDistanceMeters = maxRadiusKm * 1000;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (parsedPage - 1) * parsedLimit;

    // Build geoNear query filter
    const geoQuery = {
      approvalStatus: 'approved'
    };

    // Filter active (non-suspended) vendor user accounts
    const activeVendors = await User.find({
      role: 'vendor',
      accountStatus: { $ne: 'suspended' }
    }).select('_id').lean();
    const activeUserIds = activeVendors.map((u) => u._id);
    geoQuery.userId = { $in: activeUserIds };

    // Category filter
    if (category) {
      let categoryId = null;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryId = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category.trim().toLowerCase() }).lean();
        if (foundCategory) {
          categoryId = foundCategory._id;
        } else {
          return res.status(200).json({
            success: true,
            status: 'ok',
            data: {
              vendors: [],
              pagination: { total: 0, page: parsedPage, limit: parsedLimit, totalPages: 0 },
              filters: { coordinates: [parsedLng, parsedLat], radius: maxRadiusKm, q, category }
            }
          });
        }
      }
      geoQuery.categories = categoryId;
    }

    // Stall type filter
    if (stallType && ['fixed', 'mobile'].includes(stallType.toLowerCase())) {
      geoQuery.stallType = stallType.toLowerCase();
    }

    // Availability filter
    if (availabilityStatus && ['open', 'away', 'closed'].includes(availabilityStatus.toLowerCase())) {
      geoQuery.availabilityStatus = availabilityStatus.toLowerCase();
    }

    // Text query (q) filter
    if (q && typeof q === 'string' && q.trim()) {
      const textRegex = new RegExp(escapeRegex(q.trim()), 'i');
      const matchingProductVendorIds = await Product.find({
        $or: [{ name: textRegex }, { description: textRegex }],
        isAvailable: true
      }).distinct('vendorId');

      geoQuery['$or'] = [
        { stallName: textRegex },
        { tagline: textRegex },
        { description: textRegex },
        { 'address.area': textRegex },
        { 'address.street': textRegex },
        { 'address.city': textRegex },
        { _id: { $in: matchingProductVendorIds } }
      ];
    }

    // Aggregation pipeline using MongoDB $geoNear
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          distanceField: 'distance', // calculated distance in meters
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: geoQuery
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $project: {
          stallName: 1,
          stallType: 1,
          tagline: 1,
          description: 1,
          categories: {
            _id: 1,
            name: 1,
            slug: 1,
            icon: 1
          },
          coverPhoto: 1,
          photos: 1,
          contactPublic: 1,
          address: 1,
          location: 1,
          locationUpdatedAt: 1,
          openingHours: 1,
          availabilityStatus: 1,
          approvalStatus: 1,
          createdAt: 1,
          distance: 1
        }
      }
    ];

    // Count stage
    const countPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          distanceField: 'distance',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: geoQuery
        }
      },
      {
        $count: 'total'
      }
    ];

    const [countResult, geoResults] = await Promise.all([
      VendorProfile.aggregate(countPipeline),
      VendorProfile.aggregate([...pipeline, { $skip: skip }, { $limit: parsedLimit }])
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(total / parsedLimit);

    // Fetch product previews for returned vendors
    const vendorIds = geoResults.map((v) => v._id);
    const activeProducts = await Product.find({
      vendorId: { $in: vendorIds },
      isAvailable: true
    })
      .select('vendorId name price image isAvailable')
      .lean();

    const productMap = {};
    for (const prod of activeProducts) {
      const vid = prod.vendorId.toString();
      if (!productMap[vid]) productMap[vid] = [];
      productMap[vid].push(prod);
    }

    const formattedVendors = geoResults.map((v) => {
      const prods = productMap[v._id.toString()] || [];
      const distMeters = Math.round(v.distance);
      const distKm = Number((distMeters / 1000).toFixed(1));

      return {
        id: v._id,
        stallName: v.stallName,
        stallType: v.stallType,
        tagline: v.tagline,
        description: v.description,
        categories: v.categories.map((c) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          icon: c.icon
        })),
        coverPhoto: v.coverPhoto,
        photos: v.photos,
        contactPublic: v.contactPublic,
        address: v.address,
        location: v.location,
        locationUpdatedAt: v.locationUpdatedAt,
        openingHours: v.openingHours,
        availabilityStatus: v.availabilityStatus,
        approvalStatus: v.approvalStatus,
        createdAt: v.createdAt,
        distance: distMeters,
        distanceKm: distKm,
        productCount: prods.length,
        sampleProducts: prods.slice(0, 3)
      };
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        vendors: formattedVendors,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages
        },
        filters: {
          coordinates: [parsedLng, parsedLat],
          radius: maxRadiusKm,
          q: q || '',
          category: category || '',
          stallType: stallType || '',
          availabilityStatus: availabilityStatus || ''
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public vendor stall details with products
 * GET /api/vendors/:id
 */
export const getPublicStallProfile = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id)
      .populate('categories', 'name slug icon')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor stall not found.'
      });
    }

    // Check if the vendor user account is suspended
    const vendorUser = await User.findById(profile.userId).select('accountStatus').lean();
    if (!vendorUser || vendorUser.accountStatus === 'suspended') {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'This vendor profile is currently not available.'
      });
    }

    // Public access rule: only approved profiles are publicly visible
    // Allow owner or admin to preview unapproved profiles
    let isOwner = false;
    let isAdmin = false;

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
        // Ignored, proceed as public visitor
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
      .populate('categoryId', 'name slug icon')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        profile: {
          id: profile._id,
          stallName: profile.stallName,
          stallType: profile.stallType,
          tagline: profile.tagline,
          description: profile.description,
          categories: profile.categories,
          coverPhoto: profile.coverPhoto,
          photos: profile.photos,
          contactPublic: profile.contactPublic,
          address: profile.address,
          location: profile.location,
          locationUpdatedAt: profile.locationUpdatedAt,
          openingHours: profile.openingHours,
          availabilityStatus: profile.availabilityStatus,
          approvalStatus: profile.approvalStatus,
          createdAt: profile.createdAt
        },
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          category: p.categoryId,
          price: p.price,
          image: p.image,
          isAvailable: p.isAvailable,
          createdAt: p.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  searchVendors,
  getNearbyVendors,
  getPublicStallProfile
};
