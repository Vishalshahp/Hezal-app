import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import VendorProfile from '../src/models/VendorProfile.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Phase 4: Vendor Profile, Products & Stall Information API', () => {
  let vendorAToken;
  let vendorBToken;
  let customerToken;
  let testCategoryId;
  let vendorAProfileId;
  let vendorAProductId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }

    // Clean test collections
    await User.deleteMany({});
    await VendorProfile.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Seed a test category
    const category = await Category.create({
      name: 'Test Category Fruits',
      slug: 'test-category-fruits',
      icon: 'apple',
      isActive: true,
      displayOrder: 1
    });
    testCategoryId = category._id.toString();

    // 1. Create Vendor A
    const vARes = await request(app)
      .post('/api/auth/register/vendor')
      .send({
        name: 'Ramesh Vendor A',
        email: 'ramesh.a@example.com',
        phone: '+919876543210',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    vendorAToken = vARes.body.data.token;

    // 2. Create Vendor B
    const vBRes = await request(app)
      .post('/api/auth/register/vendor')
      .send({
        name: 'Suresh Vendor B',
        email: 'suresh.b@example.com',
        phone: '+919876543211',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    vendorBToken = vBRes.body.data.token;

    // 3. Create Customer
    const cRes = await request(app)
      .post('/api/auth/register/customer')
      .send({
        name: 'Aarav Customer',
        email: 'aarav.c@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    customerToken = cRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await VendorProfile.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Vendor Profile Creation & Management', () => {
    it('should reject profile creation without authentication (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .send({ stallName: 'Unauthorized Stall' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should forbid customer from creating a vendor profile (HTTP 403)', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          stallName: 'Customer Fake Stall',
          description: 'Should be blocked',
          contactPublic: { phone: '+919876543210' },
          address: { street: 'Street 1', area: 'Navrangpura' }
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should reject profile creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          stallName: 'Incomplete Stall'
          // missing description, contactPublic, address
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should successfully create stall profile for Vendor A with pending approval', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          stallName: 'Ramesh Fresh Fruits & Juice',
          stallType: 'mobile',
          tagline: 'Cold pressed seasonal juices',
          description: 'Hygienic fresh fruit juices prepared on demand.',
          categories: [testCategoryId],
          contactPublic: {
            phone: '+919876543210',
            whatsapp: '+919876543210'
          },
          address: {
            street: 'Stall No. 4, Opp. City Central Library',
            area: 'Ellisbridge',
            city: 'Ahmedabad',
            state: 'Gujarat',
            landmark: 'Near the big Neem tree'
          },
          location: {
            coordinates: [72.55289, 23.03721]
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.profile.stallName).toBe('Ramesh Fresh Fruits & Juice');
      expect(res.body.data.profile.stallType).toBe('mobile');
      expect(res.body.data.profile.approvalStatus).toBe('pending'); // Enforced pending!
      expect(res.body.data.profile.location.coordinates).toEqual([72.55289, 23.03721]);

      vendorAProfileId = res.body.data.profile.id;
    });

    it('should prevent duplicate profile creation for the same vendor account (HTTP 409)', async () => {
      const res = await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          stallName: 'Ramesh Duplicate Stall',
          description: 'Attempting second profile',
          contactPublic: { phone: '+919876543210' },
          address: { street: 'Street 2', area: 'Ellisbridge' }
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should retrieve own profile via GET /api/vendor/profile', async () => {
      const res = await request(app)
        .get('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.stallName).toBe('Ramesh Fresh Fruits & Juice');
      expect(res.body.data.profile.categories.length).toBe(1);
    });

    it('should update own profile via PATCH /api/vendor/profile', async () => {
      const res = await request(app)
        .patch('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          tagline: 'Updated: 100% Pure Organic Juices'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.tagline).toBe('Updated: 100% Pure Organic Juices');
    });

    it('should strictly ignore vendor attempts to set approvalStatus: "approved"', async () => {
      const res = await request(app)
        .patch('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          approvalStatus: 'approved' // Malicious attempt to self-approve
        });

      expect(res.status).toBe(200);
      expect(res.body.data.profile.approvalStatus).toBe('pending'); // Remains pending!

      const dbProfile = await VendorProfile.findById(vendorAProfileId);
      expect(dbProfile.approvalStatus).toBe('pending');
    });

    it('should block public discovery for unapproved profiles (HTTP 404)', async () => {
      const res = await request(app).get(`/api/vendors/${vendorAProfileId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not publicly listed');
    });

    it('should allow owner to view their own profile via GET /api/vendors/:id even when pending', async () => {
      const res = await request(app)
        .get(`/api/vendors/${vendorAProfileId}`)
        .set('Authorization', `Bearer ${vendorAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.stallName).toBe('Ramesh Fresh Fruits & Juice');
    });
  });

  describe('2. Stall Location & Availability Hub', () => {
    it('should update stall coordinates and record locationUpdatedAt', async () => {
      const res = await request(app)
        .patch('/api/vendor/location')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          longitude: 72.56012,
          latitude: 23.04115,
          street: 'Relocated to Crossroad No. 5',
          area: 'Navrangpura'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.location.coordinates).toEqual([72.56012, 23.04115]);
      expect(res.body.data.locationUpdatedAt).toBeDefined();
      expect(res.body.data.address.area).toBe('Navrangpura');
    });

    it('should reject invalid coordinates (e.g. longitude > 180)', async () => {
      const res = await request(app)
        .patch('/api/vendor/location')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          longitude: 195.5, // Invalid longitude
          latitude: 23.0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Longitude');
    });

    it('should update real-time availability status', async () => {
      const res = await request(app)
        .patch('/api/vendor/availability')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          availabilityStatus: 'away'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availabilityStatus).toBe('away');
    });

    it('should reject invalid availability status', async () => {
      const res = await request(app)
        .patch('/api/vendor/availability')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          availabilityStatus: 'unknown_status'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('status must be');
    });
  });

  describe('3. Product Catalogue Management', () => {
    it('should create a product with valid fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          name: 'Fresh Mosambi Juice',
          description: 'Cold pressed sweet lime juice',
          categoryId: testCategoryId,
          price: 40,
          isAvailable: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name).toBe('Fresh Mosambi Juice');
      expect(res.body.data.product.price).toBe(40);
      expect(res.body.data.product.isAvailable).toBe(true);

      vendorAProductId = res.body.data.product.id;
    });

    it('should allow creating a product with optional price omitted (price: null)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          name: 'Mixed Seasonal Cut Fruits',
          description: 'Sold by weight or custom bowl',
          categoryId: testCategoryId
        });

      expect(res.status).toBe(201);
      expect(res.body.data.product.price).toBeNull();
    });

    it('should reject negative product price', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          name: 'Negative Item',
          price: -10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('positive number or zero');
    });

    it('should retrieve all products belonging to authenticated vendor', async () => {
      const res = await request(app)
        .get('/api/products/my')
        .set('Authorization', `Bearer ${vendorAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
    });

    it('should update product details', async () => {
      const res = await request(app)
        .patch(`/api/products/${vendorAProductId}`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          price: 45
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.price).toBe(45);
    });

    it('should toggle product availability', async () => {
      const res = await request(app)
        .patch(`/api/products/${vendorAProductId}/availability`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          isAvailable: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isAvailable).toBe(false);
    });

    it('should FORBID Vendor B from modifying Vendor A product (HTTP 403 Cross-Vendor Check)', async () => {
      // First create profile for Vendor B
      await request(app)
        .post('/api/vendor/profile')
        .set('Authorization', `Bearer ${vendorBToken}`)
        .send({
          stallName: 'Vendor B Stall',
          description: 'Vendor B description',
          contactPublic: { phone: '+919876543211' },
          address: { street: 'B Street', area: 'Navrangpura' }
        });

      const res = await request(app)
        .patch(`/api/products/${vendorAProductId}`)
        .set('Authorization', `Bearer ${vendorBToken}`)
        .send({
          name: 'Tampered by Vendor B'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should FORBID Vendor B from deleting Vendor A product (HTTP 403)', async () => {
      const res = await request(app)
        .delete(`/api/products/${vendorAProductId}`)
        .set('Authorization', `Bearer ${vendorBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow owning Vendor A to delete their own product', async () => {
      const res = await request(app)
        .delete(`/api/products/${vendorAProductId}`)
        .set('Authorization', `Bearer ${vendorAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(vendorAProductId);
      expect(check).toBeNull();
    });
  });

  describe('4. Operational Dashboard Metrics (GET /api/vendor/stats)', () => {
    it('should return real calculated stats for Vendor A', async () => {
      const res = await request(app)
        .get('/api/vendor/stats')
        .set('Authorization', `Bearer ${vendorAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasProfile).toBe(true);
      expect(res.body.data.stallName).toBe('Ramesh Fresh Fruits & Juice');
      expect(res.body.data.approvalStatus).toBe('pending');
      expect(res.body.data.totalProducts).toBe(1); // One product remains after deleting one
      expect(res.body.data.completionPercentage).toBeGreaterThanOrEqual(70);
    });
  });

  describe('5. Image Upload Service Validation', () => {
    it('should reject non-image file uploads (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/vendor/upload')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .attach('image', Buffer.from('plain text content'), 'test.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only JPEG, PNG, and WebP');
    });

    it('should accept valid JPEG buffer and return public URL', async () => {
      // 1x1 valid transparent PNG buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/vendor/upload')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .attach('image', pngBuffer, 'stall.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toBeDefined();
    });
  });
});
