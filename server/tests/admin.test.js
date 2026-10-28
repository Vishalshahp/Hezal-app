import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import VendorProfile from '../src/models/VendorProfile.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import Report from '../src/models/Report.js';
import AuditLog from '../src/models/AuditLog.js';
import { generateToken } from '../src/utils/token.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Phase 6: Administrator Dashboard, Vendor Approvals & Moderation API', () => {
  let adminUser;
  let adminToken;
  let customerUser;
  let customerToken;
  let vendorUser;
  let vendorToken;
  let testCategory;
  let pendingVendorProfile;
  let approvedVendorProfile;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }

    // Clean collections for isolated admin testing
    await Promise.all([
      User.deleteMany({}),
      VendorProfile.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 1. Create Admin
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin.phase6@hezalmarket.com',
      passwordHash: 'hashedpass',
      role: 'admin',
      accountStatus: 'active'
    });
    adminToken = generateToken(adminUser);

    // 2. Create Customer
    customerUser = await User.create({
      name: 'Priya Shopper',
      email: 'priya.customer@example.com',
      passwordHash: 'hashedpass',
      role: 'customer',
      accountStatus: 'active'
    });
    customerToken = generateToken(customerUser);

    // 3. Create Vendor User
    vendorUser = await User.create({
      name: 'Dinesh Vendor',
      email: 'dinesh.vendor@example.com',
      passwordHash: 'hashedpass',
      role: 'vendor',
      accountStatus: 'active'
    });
    vendorToken = generateToken(vendorUser);

    // 4. Create Category
    testCategory = await Category.create({
      name: 'Street Snacks',
      slug: 'street-snacks',
      icon: 'Utensils',
      isActive: true,
      displayOrder: 1
    });

    // 5. Create Pending Vendor Profile
    pendingVendorProfile = await VendorProfile.create({
      userId: vendorUser._id,
      stallName: 'Dinesh Vadapav & Dabeli Center',
      stallType: 'fixed',
      tagline: 'Authentic spicy street snacks',
      description: 'Hot vadapav and butter kutchi dabeli.',
      categories: [testCategory._id],
      contactPublic: { phone: '+919876543299' },
      address: { street: 'Station Road', area: 'Maninagar', city: 'Ahmedabad' },
      location: { type: 'Point', coordinates: [72.601, 23.002] },
      approvalStatus: 'pending'
    });

    // Create a product for pending vendor
    await Product.create({
      vendorId: pendingVendorProfile._id,
      name: 'Mumbai Butter Vadapav',
      categoryId: testCategory._id,
      price: 35,
      isAvailable: true
    });

    // 6. Create Approved Vendor Profile
    const anotherVendorUser = await User.create({
      name: 'Suresh Juice',
      email: 'suresh.juice@example.com',
      passwordHash: 'hashedpass',
      role: 'vendor',
      accountStatus: 'active'
    });

    approvedVendorProfile = await VendorProfile.create({
      userId: anotherVendorUser._id,
      stallName: 'Suresh Fresh Sugarcane Juice',
      stallType: 'fixed',
      description: 'Pure cold sugarcane juice with mint and ginger.',
      categories: [testCategory._id],
      contactPublic: { phone: '+919876543288' },
      address: { street: 'Ring Road', area: 'Maninagar', city: 'Ahmedabad' },
      location: { type: 'Point', coordinates: [72.603, 23.003] },
      approvalStatus: 'approved'
    });
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({}),
      VendorProfile.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Access Control & Authorization (RBAC)', () => {
    it('should reject unauthenticated request to admin endpoints with HTTP 401', async () => {
      const res = await request(app).get('/api/admin/metrics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject customer token from admin endpoints with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('should reject vendor token from admin endpoints with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow authorized administrator access with HTTP 200', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
    });
  });

  describe('2. Dashboard Metrics (GET /api/admin/metrics)', () => {
    it('should return real calculated counts from database collections', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { metrics } = res.body.data;
      expect(metrics.totalCustomers).toBe(1);
      expect(metrics.totalVendors).toBe(2);
      expect(metrics.totalAdmins).toBe(1);
      expect(metrics.pendingVendors).toBe(1);
      expect(metrics.approvedVendors).toBe(1);
      expect(metrics.totalProducts).toBe(1);
    });
  });

  describe('3. Vendor Application Review & Moderation Lifecycle', () => {
    it('should list pending vendor applications in the review queue', async () => {
      const res = await request(app)
        .get('/api/admin/vendors?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Dinesh Vadapav & Dabeli Center');
      expect(res.body.data.vendors[0].approvalStatus).toBe('pending');
    });

    it('should retrieve full vendor details with products and audit history', async () => {
      const res = await request(app)
        .get(`/api/admin/vendors/${pendingVendorProfile._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profile.stallName).toBe('Dinesh Vadapav & Dabeli Center');
      expect(res.body.data.user.email).toBe('dinesh.vendor@example.com');
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].name).toBe('Mumbai Butter Vadapav');
    });

    it('should approve a pending vendor and make it publicly discoverable', async () => {
      const res = await request(app)
        .patch(`/api/admin/vendors/${pendingVendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'approve' });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('approved');

      // Verify that the approved vendor now appears in public search
      const pubRes = await request(app).get('/api/vendors?q=Dinesh');
      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.vendors).toHaveLength(1);
      expect(pubRes.body.data.vendors[0].stallName).toBe('Dinesh Vadapav & Dabeli Center');
    });

    it('should require a reason when requesting corrections', async () => {
      const res = await request(app)
        .patch(`/api/admin/vendors/${pendingVendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'request_corrections', reason: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/explicit reason is required/i);
    });

    it('should set status to changes_requested when valid correction reason is supplied', async () => {
      const res = await request(app)
        .patch(`/api/admin/vendors/${pendingVendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'request_corrections',
          reason: 'Please upload a clear photograph of your stall front.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('changes_requested');

      // Changes requested stall must NOT appear in public discovery
      const pubRes = await request(app).get('/api/vendors?q=Dinesh');
      expect(pubRes.body.data.vendors).toHaveLength(0);
    });

    it('should suspend an active stall with an explicit reason', async () => {
      const res = await request(app)
        .patch(`/api/admin/vendors/${approvedVendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'suspend',
          reason: 'Repeated customer complaints regarding stall hygiene.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('suspended');

      // Suspended stall returns 404 to public requests
      const pubRes = await request(app).get(`/api/vendors/${approvedVendorProfile._id}`);
      expect(pubRes.status).toBe(404);
    });

    it('should restore a suspended stall back to approved status', async () => {
      const res = await request(app)
        .patch(`/api/admin/vendors/${approvedVendorProfile._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'restore',
          reason: 'Hygiene re-inspection verified and cleared.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('approved');

      // Stall is public once again
      const pubRes = await request(app).get(`/api/vendors/${approvedVendorProfile._id}`);
      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.profile.stallName).toBe('Suresh Fresh Sugarcane Juice');
    });
  });

  describe('4. Category Administration', () => {
    let createdCategoryId;

    it('should allow admin to create a new category', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Traditional Sweets',
          slug: 'traditional-sweets',
          icon: 'Candy',
          displayOrder: 9,
          isActive: true
        });

      expect(res.status).toBe(201);
      expect(res.body.data.category.name).toBe('Traditional Sweets');
      createdCategoryId = res.body.data.category.id || res.body.data.category._id;
    });

    it('should reject duplicate category name or slug with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Traditional Sweets',
          slug: 'traditional-sweets'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should allow admin to toggle category active status', async () => {
      const res = await request(app)
        .patch(`/api/admin/categories/${createdCategoryId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should prevent deletion of category referenced by stalls or products', async () => {
      // testCategory is used by pendingVendorProfile and approvedVendorProfile
      const res = await request(app)
        .delete(`/api/admin/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/currently linked to/i);
    });

    it('should allow deletion of an unreferenced category', async () => {
      const res = await request(app)
        .delete(`/api/admin/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/permanently deleted/i);
    });
  });

  describe('5. Report Moderation Lifecycle', () => {
    let reportId;

    it('should allow public shopper to submit a listing report', async () => {
      const res = await request(app)
        .post('/api/reports')
        .send({
          targetType: 'vendor',
          targetVendorId: approvedVendorProfile._id,
          reason: 'inaccurate_location',
          details: 'The stall has moved 50 meters down the road near the metro pillar.',
          reporterName: 'Anand Kumar',
          reporterEmail: 'anand@example.com'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportId).toBeDefined();
      reportId = res.body.data.reportId;
    });

    it('should list reports for admin moderation with target details', async () => {
      const res = await request(app)
        .get('/api/admin/reports?status=open')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.reports).toHaveLength(1);
      expect(res.body.data.reports[0].reason).toBe('inaccurate_location');
      expect(res.body.data.reports[0].targetVendor.stallName).toBe(
        'Suresh Fresh Sugarcane Juice'
      );
    });

    it('should resolve a report with resolution notes', async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          resolutionNote: 'Contacted vendor to update coordinates to current pillar spot.'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolutionNote).toMatch(/contacted vendor/i);
    });
  });

  describe('6. User Management & Moderation Safeguards', () => {
    it('should list users excluding passwordHash field', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      const sampleUser = res.body.data.users[0];
      expect(sampleUser.passwordHash).toBeUndefined();
      expect(sampleUser.email).toBeDefined();
    });

    it('should prevent administrator from suspending their own active account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'suspend' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot suspend their own/i);
    });

    it('should allow administrator to suspend a user account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${customerUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'suspend', reason: 'Abuse of reporting feature.' });

      expect(res.status).toBe(200);
      expect(res.body.data.accountStatus).toBe('suspended');

      // Verify that suspended customer is blocked from authenticated calls
      const authRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(authRes.status).toBe(403);
    });

    it('should allow administrator to restore a suspended user account', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${customerUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'restore', reason: 'Suspension period concluded.' });

      expect(res.status).toBe(200);
      expect(res.body.data.accountStatus).toBe('active');
    });
  });

  describe('7. Audit Trail Verification', () => {
    it('should return recent administrative actions in audit history', async () => {
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeGreaterThan(0);
      const actions = res.body.data.logs.map((l) => l.action);
      expect(actions).toContain('vendor_approved');
      expect(actions).toContain('user_suspended');
      expect(actions).toContain('report_resolved');
    });
  });
});
