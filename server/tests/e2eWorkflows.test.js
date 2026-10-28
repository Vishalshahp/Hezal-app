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

describe('Phase 7: End-to-End Cross-System Workflow & Security Integration Suite', () => {
  let customerUser, vendorUser1, vendorUser2, adminUser;
  let customerToken, vendor1Token, vendor2Token, adminToken;
  let testCategory;
  let approvedStallProfile, newStallProfile;
  let testProduct;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hezal_market_test';
      await mongoose.connect(uri);
    }

    // Clean test collections
    await Promise.all([
      User.deleteMany({ email: /e2e.*@example\.com/ }),
      VendorProfile.deleteMany({ stallName: /E2E/ }),
      Product.deleteMany({ name: /E2E/ }),
      Category.deleteMany({ slug: /e2e/ }),
      Report.deleteMany({ reporterEmail: /e2e.*@example\.com/ }),
      AuditLog.deleteMany({ targetName: /E2E/ }),
    ]);

    // Create test taxonomy categories
    testCategory = await Category.create({
      name: 'E2E Gujarati Snacks',
      slug: 'e2e-gujarati-snacks',
      icon: 'Utensils',
      displayOrder: 1,
      isActive: true,
    });

    // Create accounts
    const passwordHash = await User.hashPassword('Password123!');

    customerUser = await User.create({
      name: 'E2E Shopper User',
      email: 'e2e.customer@example.com',
      passwordHash,
      role: 'customer',
      accountStatus: 'active',
    });
    customerToken = generateToken(customerUser);

    vendorUser1 = await User.create({
      name: 'E2E Vendor One',
      email: 'e2e.vendor1@example.com',
      passwordHash,
      role: 'vendor',
      accountStatus: 'active',
    });
    vendor1Token = generateToken(vendorUser1);

    vendorUser2 = await User.create({
      name: 'E2E Vendor Two',
      email: 'e2e.vendor2@example.com',
      passwordHash,
      role: 'vendor',
      accountStatus: 'active',
    });
    vendor2Token = generateToken(vendorUser2);

    adminUser = await User.create({
      name: 'E2E System Admin',
      email: 'e2e.admin@example.com',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    });
    adminToken = generateToken(adminUser);

    // Create an approved stall for Vendor 1
    approvedStallProfile = await VendorProfile.create({
      userId: vendorUser1._id,
      stallName: 'E2E Krishna Khaman & Fafda',
      stallType: 'fixed',
      tagline: 'Authentic nylon khaman fresh every morning',
      description: 'Serving hot breakfast snacks with papaya sambharo and fried green chillies.',
      categories: [testCategory._id],
      contactPublic: { phone: '+919876543299' },
      address: {
        street: 'Shop 4, Swastik Cross Road',
        area: 'Navrangpura',
        city: 'Ahmedabad',
        state: 'Gujarat',
        landmark: 'Opp Commerce Six Roads',
      },
      location: {
        type: 'Point',
        coordinates: [72.5598, 23.0372], // Longitude, Latitude
      },
      availabilityStatus: 'open',
      approvalStatus: 'approved',
    });

    // Create a product for the approved stall
    testProduct = await Product.create({
      vendorId: approvedStallProfile._id,
      name: 'E2E Nylon Khaman 250g',
      description: 'Piping hot fresh besan khaman tempered with mustard seeds and coriander.',
      categoryId: testCategory._id,
      price: 80,
      isAvailable: true,
    });
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteMany({ email: /e2e.*@example\.com/ }),
      VendorProfile.deleteMany({ stallName: /E2E/ }),
      Product.deleteMany({ name: /E2E/ }),
      Category.deleteMany({ slug: /e2e/ }),
      Report.deleteMany({ reporterEmail: /e2e.*@example\.com/ }),
      AuditLog.deleteMany({ targetName: /E2E/ }),
    ]);
  });

  // -------------------------------------------------------------
  // Workflow A & B: Customer Discovery with and without Geolocation
  // -------------------------------------------------------------
  describe('Workflow A & B: Customer Discovery, Filtering & Directions', () => {
    it('should allow shoppers to discover approved stalls by text query', async () => {
      const res = await request(app).get('/api/vendors?q=Krishna');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendors.length).toBeGreaterThan(0);
      expect(res.body.data.vendors[0].stallName).toBe('E2E Krishna Khaman & Fafda');
    });

    it('should discover stalls by product keywords even if not in stall title', async () => {
      const res = await request(app).get('/api/vendors?q=Nylon+Khaman');
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.some((v) => v.stallName === 'E2E Krishna Khaman & Fafda')).toBe(true);
    });

    it('should filter vendors by category slug', async () => {
      const res = await request(app).get('/api/vendors?category=e2e-gujarati-snacks');
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.some((v) => v.stallName === 'E2E Krishna Khaman & Fafda')).toBe(true);
    });

    it('should discover vendors by area name when customer GPS is denied (Workflow B)', async () => {
      const res = await request(app).get('/api/vendors?area=Navrangpura');
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.length).toBeGreaterThan(0);
      expect(res.body.data.vendors[0].address.area).toBe('Navrangpura');
    });

    it('should discover vendors via radial geospatial search with valid coordinates', async () => {
      // Coordinates near Navrangpura: lng 72.56, lat 23.03
      const res = await request(app).get(
        '/api/vendors/nearby?longitude=72.5598&latitude=23.0372&radius=5'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendors.length).toBeGreaterThan(0);
      expect(res.body.data.vendors[0].distanceKm).toBeDefined();
    });

    it('should retrieve full stall details and product catalog on public profile', async () => {
      const res = await request(app).get(`/api/vendors/${approvedStallProfile._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.stallName).toBe('E2E Krishna Khaman & Fafda');
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0].name).toBe('E2E Nylon Khaman 250g');

      // Verify coordinates order in profile: [longitude, latitude]
      const coords = res.body.data.profile.location.coordinates;
      expect(coords[0]).toBeCloseTo(72.5598, 3);
      expect(coords[1]).toBeCloseTo(23.0372, 3);
    });

    it('should handle regex metacharacters in search queries safely without HTTP 500', async () => {
      const res = await request(app).get('/api/vendors?q=(*+?khaman');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Workflow C: Vendor Registration, Stall Setup & Products
  // -------------------------------------------------------------
  describe('Workflow C: Vendor Management Lifecycle', () => {
    it('should register a new vendor account with role "vendor"', async () => {
      const res = await request(app)
        .post('/api/auth/register/vendor')
        .send({
          name: 'E2E Vendor Three',
          email: 'e2e.vendor3@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '+919876543233',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('vendor');
    });

    it('should allow vendor to create stall profile and persist initial pending status', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({
          stallName: 'E2E Ambica Dalvada Center',
          stallType: 'mobile',
          tagline: 'Crispy spicy moong dalvada with onions',
          description: 'Traditional monsoon special moong dal vadas fried in fresh oil.',
          categories: [testCategory._id],
          contactPublic: { phone: '+919876543222' },
          address: {
            street: 'Beside University Tower',
            area: 'Gujarat University',
            city: 'Ahmedabad',
          },
          location: {
            coordinates: [72.5448, 23.0365],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.profile.approvalStatus).toBe('pending');
      newStallProfile = res.body.data.profile;
    });

    it('should ensure pending stalls are excluded from public search results', async () => {
      const res = await request(app).get('/api/vendors?q=Ambica');
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.some((v) => v.stallName === 'E2E Ambica Dalvada Center')).toBe(false);
    });

    it('should allow vendor to add a product to their stall', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({
          name: 'E2E Special Dalvada Plate',
          description: 'Served with sliced onions and salted green chillies.',
          categoryId: testCategory._id,
          price: 70,
          isAvailable: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.product.name).toBe('E2E Special Dalvada Plate');
    });

    it('should allow vendor to update availability status', async () => {
      const res = await request(app)
        .patch('/api/vendor/availability')
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({ availabilityStatus: 'away' });

      expect(res.status).toBe(200);
      expect(res.body.data.availabilityStatus).toBe('away');
    });
  });

  // -------------------------------------------------------------
  // Workflow D & E: Admin Adjudication & Access Control Security
  // -------------------------------------------------------------
  describe('Workflow D & E: Admin Approvals, Suspensions & RBAC Guardrails', () => {
    it('should reject unauthenticated requests to protected endpoints with HTTP 401', async () => {
      const res = await request(app).get('/api/vendor/profile');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('unauthorized');
    });

    it('should reject customer tokens from accessing vendor-only endpoints with HTTP 403', async () => {
      const res = await request(app)
        .get('/api/vendor/profile')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('forbidden');
    });

    it('should reject vendor tokens from accessing admin-only endpoints with HTTP 403', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${vendor1Token}`);
      expect(res.status).toBe(403);
      expect(res.body.status).toBe('forbidden');
    });

    it('should prevent vendor 1 from modifying vendor 2 product (ownership check)', async () => {
      // testProduct belongs to vendorUser1
      const res = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send({ price: 999 });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not authorized|not own/i);
    });

    it('should allow admin to approve a pending vendor stall', async () => {
      const stallId = newStallProfile.id || newStallProfile._id;
      const res = await request(app)
        .patch(`/api/admin/vendors/${stallId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'approve' });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('approved');
    });

    it('should verify approved vendor is now publicly discoverable', async () => {
      const res = await request(app).get('/api/vendors?q=Ambica');
      expect(res.status).toBe(200);
      expect(res.body.data.vendors.some((v) => v.stallName === 'E2E Ambica Dalvada Center')).toBe(true);
    });

    it('should allow admin to suspend an active stall with mandatory reason', async () => {
      const stallId = newStallProfile.id || newStallProfile._id;
      const res = await request(app)
        .patch(`/api/admin/vendors/${stallId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'suspend', reason: 'Temporary stall moved without updating coordinates.' });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('suspended');
    });

    it('should verify suspended stall is hidden from public search and returns 404 on direct URL', async () => {
      const stallId = newStallProfile.id || newStallProfile._id;
      const searchRes = await request(app).get('/api/vendors?q=Ambica');
      expect(searchRes.body.data.vendors.some((v) => v.stallName === 'E2E Ambica Dalvada Center')).toBe(false);

      const directRes = await request(app).get(`/api/vendors/${stallId}`);
      expect(directRes.status).toBe(404);
    });

    it('should allow admin to restore suspended stall back to approved status', async () => {
      const stallId = newStallProfile.id || newStallProfile._id;
      const res = await request(app)
        .patch(`/api/admin/vendors/${stallId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'restore', reason: 'Vendor verified stall spot.' });

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('approved');
    });
  });

  // -------------------------------------------------------------
  // Workflow F: Category & Community Report Administration
  // -------------------------------------------------------------
  describe('Workflow F: Category & Report Administration', () => {
    let createdCategoryId;
    let submittedReportId;

    it('should allow admin to create a category', async () => {
      const res = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Handcrafted Pots',
          slug: 'e2e-handcrafted-pots',
          icon: 'Sparkles',
          displayOrder: 10,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.category.name).toBe('E2E Handcrafted Pots');
      createdCategoryId = res.body.data.category.id || res.body.data.category._id;
    });

    it('should allow admin to toggle category active status', async () => {
      const res = await request(app)
        .patch(`/api/admin/categories/${createdCategoryId}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should block deletion of category referenced by stalls or products', async () => {
      // testCategory is referenced by approvedStallProfile
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

    it('should allow public shopper to submit a listing report', async () => {
      const res = await request(app)
        .post('/api/reports')
        .send({
          targetType: 'vendor',
          targetVendorId: approvedStallProfile._id,
          reason: 'inaccurate_location',
          details: 'Stall has moved 30 meters down the road near the metro entrance.',
          reporterName: 'E2E Shopper User',
          reporterEmail: 'e2e.customer@example.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reportId).toBeDefined();
      submittedReportId = res.body.data.reportId;
    });

    it('should allow admin to resolve community report with notes', async () => {
      const res = await request(app)
        .patch(`/api/admin/reports/${submittedReportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          resolutionNote: 'Coordinates confirmed and updated with vendor.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('resolved');
      expect(res.body.data.resolutionNote).toMatch(/coordinates confirmed/i);
    });
  });
});
