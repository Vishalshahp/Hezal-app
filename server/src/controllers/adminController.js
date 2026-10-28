import User from '../models/User.js';
import VendorProfile from '../models/VendorProfile.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import { escapeRegex } from '../utils/sanitize.js';

/**
 * 1. Administrator Dashboard Metrics
 * GET /api/admin/metrics
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      totalAdmins,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      suspendedVendors,
      changesRequestedVendors,
      totalProducts,
      unresolvedReports,
      recentAuditLogs,
      recentPendingApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'admin' }),
      VendorProfile.countDocuments({ approvalStatus: 'pending' }),
      VendorProfile.countDocuments({ approvalStatus: 'approved' }),
      VendorProfile.countDocuments({ approvalStatus: 'rejected' }),
      VendorProfile.countDocuments({ approvalStatus: 'suspended' }),
      VendorProfile.countDocuments({ approvalStatus: 'changes_requested' }),
      Product.countDocuments({}),
      Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      AuditLog.find({})
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      VendorProfile.find({ approvalStatus: 'pending' })
        .populate('userId', 'name email phone')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        metrics: {
          totalCustomers,
          totalVendors,
          totalAdmins,
          pendingVendors,
          approvedVendors,
          rejectedVendors,
          suspendedVendors,
          changesRequestedVendors,
          totalProducts,
          unresolvedReports
        },
        recentAuditLogs: recentAuditLogs.map((log) => ({
          id: log._id,
          adminName: log.adminId?.name || 'Administrator',
          adminEmail: log.adminId?.email || '',
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetName: log.targetName,
          previousStatus: log.previousStatus,
          newStatus: log.newStatus,
          reason: log.reason,
          createdAt: log.createdAt
        })),
        recentPendingApplications: recentPendingApplications.map((v) => ({
          id: v._id,
          stallName: v.stallName,
          vendorName: v.userId?.name,
          vendorEmail: v.userId?.email,
          categories: v.categories?.map((c) => c.name) || [],
          stallType: v.stallType,
          createdAt: v.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. List Vendor Applications for Moderation
 * GET /api/admin/vendors
 */
export const getVendorsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};

    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { stallName: searchRegex },
        { description: searchRegex },
        { 'address.area': searchRegex },
        { 'address.city': searchRegex }
      ];
    }

    const [total, vendorProfiles] = await Promise.all([
      VendorProfile.countDocuments(filter),
      VendorProfile.find(filter)
        .populate('userId', 'name email phone accountStatus createdAt')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    // Query product counts for each vendor
    const vendorIds = vendorProfiles.map((v) => v._id);
    const productCounts = await Product.aggregate([
      { $match: { vendorId: { $in: vendorIds } } },
      { $group: { _id: '$vendorId', count: { $sum: 1 } } }
    ]);

    const productCountMap = {};
    for (const pc of productCounts) {
      productCountMap[pc._id.toString()] = pc.count;
    }

    const formatted = vendorProfiles.map((v) => ({
      id: v._id,
      stallName: v.stallName,
      stallType: v.stallType,
      tagline: v.tagline,
      description: v.description,
      categories: v.categories || [],
      contactPublic: v.contactPublic,
      address: v.address,
      location: v.location,
      approvalStatus: v.approvalStatus,
      availabilityStatus: v.availabilityStatus,
      adminNote: v.adminNote,
      coverPhoto: v.coverPhoto,
      photosCount: v.photos?.length || 0,
      productCount: productCountMap[v._id.toString()] || 0,
      user: {
        id: v.userId?._id,
        name: v.userId?.name,
        email: v.userId?.email,
        phone: v.userId?.phone,
        accountStatus: v.userId?.accountStatus
      },
      createdAt: v.createdAt,
      updatedAt: v.updatedAt
    }));

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        vendors: formatted,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Inspect Single Vendor Application Details
 * GET /api/admin/vendors/:id
 */
export const getVendorDetailsAdmin = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findById(req.params.id)
      .populate('userId', 'name email phone role accountStatus createdAt')
      .populate('categories', 'name slug icon')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found.'
      });
    }

    const [products, auditHistory, reports] = await Promise.all([
      Product.find({ vendorId: profile._id })
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .lean(),
      AuditLog.find({ targetId: profile._id })
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      Report.find({ targetVendorId: profile._id })
        .sort({ createdAt: -1 })
        .lean()
    ]);

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
          categories: profile.categories || [],
          contactPublic: profile.contactPublic,
          address: profile.address,
          location: profile.location,
          locationUpdatedAt: profile.locationUpdatedAt,
          openingHours: profile.openingHours,
          availabilityStatus: profile.availabilityStatus,
          approvalStatus: profile.approvalStatus,
          adminNote: profile.adminNote,
          coverPhoto: profile.coverPhoto,
          photos: profile.photos || [],
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        },
        user: profile.userId
          ? {
              id: profile.userId._id,
              name: profile.userId.name,
              email: profile.userId.email,
              phone: profile.userId.phone,
              accountStatus: profile.userId.accountStatus,
              createdAt: profile.userId.createdAt
            }
          : null,
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          category: p.categoryId,
          price: p.price,
          image: p.image,
          isAvailable: p.isAvailable,
          createdAt: p.createdAt
        })),
        auditHistory: auditHistory.map((a) => ({
          id: a._id,
          adminName: a.adminId?.name || 'Administrator',
          action: a.action,
          previousStatus: a.previousStatus,
          newStatus: a.newStatus,
          reason: a.reason,
          createdAt: a.createdAt
        })),
        reports: reports.map((r) => ({
          id: r._id,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Moderate Vendor Status (Approve / Reject / Request Corrections / Suspend / Restore)
 * PATCH /api/admin/vendors/:id/status
 */
export const updateVendorStatus = async (req, res, next) => {
  try {
    const { action, reason = '' } = req.body;

    const validActions = ['approve', 'reject', 'request_corrections', 'suspend', 'restore'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`
      });
    }

    if (['reject', 'request_corrections', 'suspend'].includes(action) && !reason.trim()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: `An explicit reason is required when performing ${action}.`
      });
    }

    const profile = await VendorProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Vendor profile not found.'
      });
    }

    const previousStatus = profile.approvalStatus;
    let newStatus = previousStatus;
    let auditAction = '';

    switch (action) {
      case 'approve':
        newStatus = 'approved';
        auditAction = 'vendor_approved';
        profile.adminNote = reason.trim() || 'Approved by platform moderation.';
        break;
      case 'reject':
        newStatus = 'rejected';
        auditAction = 'vendor_rejected';
        profile.adminNote = reason.trim();
        break;
      case 'request_corrections':
        newStatus = 'changes_requested';
        auditAction = 'vendor_corrections_requested';
        profile.adminNote = reason.trim();
        break;
      case 'suspend':
        newStatus = 'suspended';
        auditAction = 'vendor_suspended';
        profile.adminNote = reason.trim();
        break;
      case 'restore':
        newStatus = 'approved';
        auditAction = 'vendor_restored';
        profile.adminNote = reason.trim() || 'Restored by platform moderation.';
        break;
      default:
        break;
    }

    profile.approvalStatus = newStatus;
    await profile.save();

    // Create Audit Log record
    await AuditLog.create({
      adminId: req.user._id,
      action: auditAction,
      targetType: 'VendorProfile',
      targetId: profile._id,
      targetName: profile.stallName,
      previousStatus,
      newStatus,
      reason: reason.trim()
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `Vendor stall status successfully updated to "${newStatus}".`,
      data: {
        vendorId: profile._id,
        previousStatus,
        approvalStatus: newStatus,
        adminNote: profile.adminNote
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Category Administration - List All Categories with Counts
 * GET /api/admin/categories
 */
export const getCategoriesAdmin = async (_req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();

    // Calculate usage count in vendor profiles and products
    const [vendorUsage, productUsage] = await Promise.all([
      VendorProfile.aggregate([
        { $unwind: '$categories' },
        { $match: { categories: { $ne: null } } },
        { $group: { _id: '$categories', count: { $sum: 1 } } }
      ]),
      Product.aggregate([
        { $match: { categoryId: { $ne: null } } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } }
      ])
    ]);

    const vendorMap = {};
    for (const v of vendorUsage) {
      if (v._id) {
        vendorMap[v._id.toString()] = v.count;
      }
    }

    const productMap = {};
    for (const p of productUsage) {
      if (p._id) {
        productMap[p._id.toString()] = p.count;
      }
    }

    const formatted = categories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
      vendorCount: c._id && vendorMap[c._id.toString()] ? vendorMap[c._id.toString()] : 0,
      productCount: c._id && productMap[c._id.toString()] ? productMap[c._id.toString()] : 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        categories: formatted
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Create Category
 * POST /api/admin/categories
 */
export const createCategoryAdmin = async (req, res, next) => {
  try {
    const { name, slug, icon = 'Store', displayOrder = 0, isActive = true } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Category name is required.'
      });
    }

    const formattedSlug = (slug || name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: formattedSlug }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'A category with this name or slug already exists.'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: formattedSlug,
      icon: icon.trim() || 'Store',
      displayOrder: parseInt(displayOrder, 10) || 0,
      isActive: Boolean(isActive)
    });

    await AuditLog.create({
      adminId: req.user._id,
      action: 'category_created',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      newStatus: category.isActive ? 'active' : 'inactive',
      reason: 'Admin category creation'
    });

    const categoryObj = category.toObject ? category.toObject() : category;

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Category created successfully.',
      data: {
        category: {
          ...categoryObj,
          _id: category._id,
          id: category._id
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Update Category
 * PUT /api/admin/categories/:id
 */
export const updateCategoryAdmin = async (req, res, next) => {
  try {
    const { name, slug, icon, displayOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Category not found.'
      });
    }

    if (name && name.trim()) {
      const existingName = await Category.findOne({
        _id: { $ne: category._id },
        name: name.trim()
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Another category with this name already exists.'
        });
      }
      category.name = name.trim();
    }

    if (slug && slug.trim()) {
      const formattedSlug = slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const existingSlug = await Category.findOne({
        _id: { $ne: category._id },
        slug: formattedSlug
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Another category with this slug already exists.'
        });
      }
      category.slug = formattedSlug;
    }

    if (icon !== undefined) category.icon = icon.trim() || 'Store';
    if (displayOrder !== undefined) category.displayOrder = parseInt(displayOrder, 10) || 0;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'category_updated',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      reason: 'Admin category modification'
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Category updated successfully.',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Toggle Category Active Status
 * PATCH /api/admin/categories/:id/toggle-status
 */
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Category not found.'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'category_toggled',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      newStatus: category.isActive ? 'active' : 'inactive',
      reason: `Category toggled to ${category.isActive ? 'active' : 'inactive'}`
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `Category ${category.name} is now ${category.isActive ? 'active' : 'inactive'}.`,
      data: {
        categoryId: category._id,
        isActive: category.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Delete Unused Category
 * DELETE /api/admin/categories/:id
 */
export const deleteCategoryAdmin = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Category not found.'
      });
    }

    // Safeguard: Check if referenced by existing vendor profiles or products
    const [vendorCount, productCount] = await Promise.all([
      VendorProfile.countDocuments({ categories: category._id }),
      Product.countDocuments({ categoryId: category._id })
    ]);

    if (vendorCount > 0 || productCount > 0) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: `Cannot delete category "${category.name}" because it is currently linked to ${vendorCount} vendor stall(s) and ${productCount} product(s). Please deactivate it instead.`
      });
    }

    await Category.findByIdAndDelete(category._id);

    await AuditLog.create({
      adminId: req.user._id,
      action: 'category_deleted',
      targetType: 'Category',
      targetId: category._id,
      targetName: category.name,
      reason: 'Admin deleted unused category'
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `Category "${category.name}" was permanently deleted.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. List Reports for Moderation
 * GET /api/admin/reports
 */
export const getReportsAdmin = async (req, res, next) => {
  try {
    const { status, reason, page = 1, limit = 15 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (reason && reason !== 'all') {
      filter.reason = reason;
    }

    const [total, reports] = await Promise.all([
      Report.countDocuments(filter),
      Report.find(filter)
        .populate('targetVendorId', 'stallName address coverPhoto approvalStatus')
        .populate('targetProductId', 'name price isAvailable')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    const formatted = reports.map((r) => ({
      id: r._id,
      targetType: r.targetType,
      targetVendor: r.targetVendorId
        ? {
            id: r.targetVendorId._id,
            stallName: r.targetVendorId.stallName,
            address: r.targetVendorId.address,
            approvalStatus: r.targetVendorId.approvalStatus
          }
        : null,
      targetProduct: r.targetProductId
        ? {
            id: r.targetProductId._id,
            name: r.targetProductId.name,
            price: r.targetProductId.price,
            isAvailable: r.targetProductId.isAvailable
          }
        : null,
      reason: r.reason,
      details: r.details,
      reporterName: r.reporterName,
      reporterEmail: r.reporterEmail,
      status: r.status,
      resolutionNote: r.resolutionNote,
      resolvedBy: r.resolvedBy?.name || null,
      resolvedAt: r.resolvedAt,
      createdAt: r.createdAt
    }));

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        reports: formatted,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Update Report Status & Resolve/Dismiss
 * PATCH /api/admin/reports/:id
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote = '', suspendVendor = false, suspendReason = '' } = req.body;

    const validStatuses = ['open', 'under_review', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: `Invalid report status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Report not found.'
      });
    }

    const previousStatus = report.status;
    report.status = status;
    report.resolutionNote = resolutionNote.trim();

    if (['resolved', 'dismissed'].includes(status)) {
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
    }

    await report.save();

    // If moderator requested suspending the associated vendor as part of resolving the report
    if (suspendVendor && report.targetVendorId) {
      const vendor = await VendorProfile.findById(report.targetVendorId);
      if (vendor) {
        vendor.approvalStatus = 'suspended';
        vendor.adminNote =
          suspendReason.trim() || `Suspended following report #${report._id}: ${report.reason}`;
        await vendor.save();

        await AuditLog.create({
          adminId: req.user._id,
          action: 'vendor_suspended',
          targetType: 'VendorProfile',
          targetId: vendor._id,
          targetName: vendor.stallName,
          previousStatus: vendor.approvalStatus,
          newStatus: 'suspended',
          reason: `Suspended via Report #${report._id}`
        });
      }
    }

    await AuditLog.create({
      adminId: req.user._id,
      action: status === 'resolved' ? 'report_resolved' : 'report_dismissed',
      targetType: 'Report',
      targetId: report._id,
      targetName: `Report: ${report.reason}`,
      previousStatus,
      newStatus: status,
      reason: resolutionNote.trim()
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `Report status updated to "${status}".`,
      data: {
        reportId: report._id,
        status: report.status,
        resolutionNote: report.resolutionNote,
        resolvedAt: report.resolvedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 12. User Management - List Users
 * GET /api/admin/users
 */
export const getUsersAdmin = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 15 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.accountStatus = status;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('name email phone role accountStatus createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    // Lookup vendor stall names for vendor users
    const vendorUserIds = users.filter((u) => u.role === 'vendor').map((u) => u._id);
    const vendorProfiles = await VendorProfile.find({ userId: { $in: vendorUserIds } })
      .select('userId stallName approvalStatus')
      .lean();

    const vendorMap = {};
    for (const vp of vendorProfiles) {
      vendorMap[vp.userId.toString()] = {
        stallName: vp.stallName,
        approvalStatus: vp.approvalStatus,
        profileId: vp._id
      };
    }

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      accountStatus: u.accountStatus,
      vendorStall: vendorMap[u._id.toString()] || null,
      createdAt: u.createdAt
    }));

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        users: formatted,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 13. Suspend / Restore User Account
 * PATCH /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { action, reason = '' } = req.body;

    if (!['suspend', 'restore'].includes(action)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Action must be either "suspend" or "restore".'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'User account not found.'
      });
    }

    // Safeguard 1: Administrator cannot suspend their own account
    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Administrators cannot suspend their own active accounts.'
      });
    }

    // Safeguard 2: Prevent locking out the only active administrator
    if (action === 'suspend' && targetUser.role === 'admin') {
      const activeAdminsCount = await User.countDocuments({
        role: 'admin',
        accountStatus: 'active'
      });
      if (activeAdminsCount <= 1) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Cannot suspend the only remaining active platform administrator.'
        });
      }
    }

    const previousStatus = targetUser.accountStatus;
    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    targetUser.accountStatus = newStatus;
    await targetUser.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: action === 'suspend' ? 'user_suspended' : 'user_restored',
      targetType: 'User',
      targetId: targetUser._id,
      targetName: targetUser.email,
      previousStatus,
      newStatus,
      reason: reason.trim() || `User account ${action}ed by administrator`
    });

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: `User account ${targetUser.email} has been ${action}ed.`,
      data: {
        userId: targetUser._id,
        email: targetUser.email,
        accountStatus: targetUser.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 14. Retrieve Audit Logs History
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page = 1, limit = 20 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};
    if (action) filter.action = action;
    if (targetType) filter.targetType = targetType;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean()
    ]);

    const formatted = logs.map((l) => ({
      id: l._id,
      adminName: l.adminId?.name || 'Administrator',
      adminEmail: l.adminId?.email || '',
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      targetName: l.targetName,
      previousStatus: l.previousStatus,
      newStatus: l.newStatus,
      reason: l.reason,
      createdAt: l.createdAt
    }));

    return res.status(200).json({
      success: true,
      status: 'ok',
      data: {
        logs: formatted,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 15. Public Customer Listing Report Submission
 * POST /api/reports
 */
export const submitPublicReport = async (req, res, next) => {
  try {
    const {
      targetType = 'vendor',
      targetVendorId,
      targetProductId,
      reason,
      details,
      reporterName = 'Anonymous Shopper',
      reporterEmail = ''
    } = req.body;

    if (!targetVendorId) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Target vendor stall ID is required.'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Report reason is required.'
      });
    }

    if (!details || !details.trim()) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Please provide details explaining your report.'
      });
    }

    const vendor = await VendorProfile.findById(targetVendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Reported vendor stall does not exist.'
      });
    }

    const report = await Report.create({
      targetType: targetType === 'product' ? 'product' : 'vendor',
      targetVendorId: vendor._id,
      targetProductId: targetProductId || null,
      reason,
      details: details.trim(),
      reporterName: reporterName.trim() || 'Anonymous Shopper',
      reporterEmail: reporterEmail.trim(),
      status: 'open'
    });

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Thank you for your report. Marketplace moderators will review this listing.',
      data: {
        reportId: report._id,
        status: report.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardMetrics,
  getVendorsAdmin,
  getVendorDetailsAdmin,
  updateVendorStatus,
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  toggleCategoryStatus,
  deleteCategoryAdmin,
  getReportsAdmin,
  updateReportStatus,
  getUsersAdmin,
  updateUserStatus,
  getAuditLogs,
  submitPublicReport
};
