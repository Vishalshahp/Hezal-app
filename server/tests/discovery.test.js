import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import VendorProfile from '../src/models/VendorProfile.js';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Phase 5: Customer Discovery, Search & Geospatial API', () => {
  let approvedVendorUser;
  let approvedVendorProfile;
  let secondVendorUser;
  let secondVendorProfile;
  let unapprovedVendorUser;
  let unapprovedVendorProfile;
  let suspendedVendorUser;
  let suspendedVendorProfile;
  let streetFoodCategory;
  let handcraftCategory;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }

    // 1. Clean collections for discovery tests
    await Promise.all([
      Product.deleteMany({}),
      VendorProfile.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({ role: 'vendor' })
    ]);

    // 2. Create categories
    streetFoodCategory = await Category.create({
      name: 'Street Food',
      slug: 'street-food',
      icon: 'Utensils',
      isActive: true,
      displayOrder: 1
    });

    handcraftCategory = await Category.create({
      name: 'Handcrafts',
      slug: 'handcrafts',
      icon: 'Palette',
      isActive: true,
      displayOrder: 2
    });

    // 3. Create approved vendor 1 (Ahmedabad Law Garden: 72.5598, 23.0232)
    approvedVendorUser = await User.create({
      name: 'Ramesh Chatwala',
      email: 'ramesh.chat@test.com',
      passwordHash: 'hashedpassword123',
      role: 'vendor',
      accountStatus: 'active'
    });

    approvedVendorProfile = await VendorProfile.create({
      userId: approvedVendorUser._id,
      stallName: 'Ramesh Famous Chaat & Pani Puri',
      stallType: 'mobile',
      tagline: 'Best spicy pani puri in Law Garden',
      description: 'Serving fresh homemade sev puri, dahi puri, and famous spicy pani puri since 2012.',
      categories: [streetFoodCategory._id],
      contactPublic: {
        phone: '+919876543211',
        whatsapp: '+919876543211'
      },
      address: {
        street: 'Law Garden Khau Gali Stall #4',
        area: 'Ellisbridge',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380006',
        landmark: 'Near Law Garden Gate 2'
      },
      location: {
        type: 'Point',
        coordinates: [72.5598, 23.0232] // Law Garden [lng, lat]
      },
      approvalStatus: 'approved',
      availabilityStatus: 'open'
    });

    // Create product for Vendor 1
    await Product.create({
      vendorId: approvedVendorProfile._id,
      name: 'Special Mineral Water Pani Puri',
      description: 'Crispy puris with 3 flavoured waters',
      categoryId: streetFoodCategory._id,
      price: 40,
      isAvailable: true
    });

    // 4. Create approved vendor 2 (Vastrapur Lake: 72.5293, 23.0350 ~ 3.5 km away)
    secondVendorUser = await User.create({
      name: 'Geeta Clay Crafts',
      email: 'geeta.crafts@test.com',
      passwordHash: 'hashedpassword123',
      role: 'vendor',
      accountStatus: 'active'
    });

    secondVendorProfile = await VendorProfile.create({
      userId: secondVendorUser._id,
      stallName: 'Geeta Traditional Terracotta Pots',
      stallType: 'fixed',
      tagline: 'Handmade clay pots and decorative earthenware',
      description: 'Authentic handmade clay utensils, painted diyas, and decorative terracotta items.',
      categories: [handcraftCategory._id],
      contactPublic: {
        phone: '+919876543222'
      },
      address: {
        street: 'Vastrapur Lake Craft Market Stall #12',
        area: 'Vastrapur',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380015',
        landmark: 'Opposite Lake Amphitheatre'
      },
      location: {
        type: 'Point',
        coordinates: [72.5293, 23.035] // Vastrapur [lng, lat]
      },
      approvalStatus: 'approved',
      availabilityStatus: 'open'
    });

    await Product.create({
      vendorId: secondVendorProfile._id,
      name: 'Painted Clay Tea Kulhad Set',
      description: 'Pack of 6 handmade terracotta cups',
      categoryId: handcraftCategory._id,
      price: 150,
      isAvailable: true
    });

    // 5. Create unapproved vendor (Pending)
    unapprovedVendorUser = await User.create({
      name: 'Pending Vendor',
      email: 'pending.vendor@test.com',
      passwordHash: 'hashedpassword123',
      role: 'vendor',
      accountStatus: 'active'
    });

    unapprovedVendorProfile = await VendorProfile.create({
      userId: unapprovedVendorUser._id,
      stallName: 'Draft Snacks & Refreshments',
      description: 'Pending verification stall profile.',
      categories: [streetFoodCategory._id],
      contactPublic: { phone: '+919876543233' },
      address: { street: 'Main Rd', area: 'Ellisbridge', city: 'Ahmedabad' },
      location: { type: 'Point', coordinates: [72.56, 23.023] },
      approvalStatus: 'pending'
    });

    // 6. Create suspended vendor
    suspendedVendorUser = await User.create({
      name: 'Suspended Seller',
      email: 'suspended.seller@test.com',
      passwordHash: 'hashedpassword123',
      role: 'vendor',
      accountStatus: 'suspended'
    });

    suspendedVendorProfile = await VendorProfile.create({
      userId: suspendedVendorUser._id,
      stallName: 'Suspended Food Kiosk',
      description: 'Violation suspended stall.',
      categories: [streetFoodCategory._id],
      contactPublic: { phone: '+919876543244' },
      address: { street: 'Crossroads', area: 'Ellisbridge', city: 'Ahmedabad' },
      location: { type: 'Point', coordinates: [72.561, 23.024] },
      approvalStatus: 'approved' // even if approved, user is suspended
    });
  });

  afterAll(async () => {
    await Promise.all([
      Product.deleteMany({}),
      VendorProfile.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({ role: 'vendor' })
    ]);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Public Search & Discovery (GET /api/vendors)', () => {
    it('should return only approved and non-suspended vendors', async () => {
      const res = await request(app).get('/api/vendors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendors).toHaveLength(2);

      const stallNames = res.body.data.vendors.map((v) => v.stallName);
      expect(stallNames).toContain('Ramesh Famous Chaat & Pani Puri');
      expect(stallNames).toContain('Geeta Traditional Terracotta Pots');
      expect(stallNames).not.toContain('Draft Snacks & Refreshments');
      expect(stallNames).not.toContain('Suspended Food Kiosk');
    });

    it('should search vendors by stall name keyword', async () => {
      const res = await request(app).get('/api/vendors?q=Terracotta');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Geeta Traditional Terracotta Pots');
    });

    it('should search vendors by product name keyword', async () => {
      // Searching for "Pani Puri" should find Ramesh's stall
      const res = await request(app).get('/api/vendors?q=Pani Puri');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Ramesh Famous Chaat & Pani Puri');
      expect(res.body.data.vendors[0].sampleProducts[0].name).toBe('Special Mineral Water Pani Puri');
    });

    it('should filter vendors by category slug', async () => {
      const res = await request(app).get('/api/vendors?category=handcrafts');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Geeta Traditional Terracotta Pots');
    });

    it('should filter vendors by locality/area', async () => {
      const res = await request(app).get('/api/vendors?area=Vastrapur');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Geeta Traditional Terracotta Pots');
    });

    it('should return empty result safely when no vendors match', async () => {
      const res = await request(app).get('/api/vendors?q=NonExistentProductXYZ');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });

    it('should respect pagination parameters', async () => {
      const res = await request(app).get('/api/vendors?page=1&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(1);
    });
  });

  describe('2. Geospatial Nearby Discovery (GET /api/vendors/nearby)', () => {
    it('should reject missing coordinates with HTTP 400', async () => {
      const res = await request(app).get('/api/vendors/nearby');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/longitude and latitude/i);
    });

    it('should reject out-of-range coordinates with HTTP 400', async () => {
      const res = await request(app).get('/api/vendors/nearby?longitude=195&latitude=23.0');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid numbers/i);
    });

    it('should return nearby approved vendors sorted by distance ascending', async () => {
      // Customer at Law Garden entrance: [72.5595, 23.0230]
      // Ramesh is at [72.5598, 23.0232] (~38 meters away)
      // Geeta is at Vastrapur [72.5293, 23.0350] (~3.4 km away)
      const res = await request(app).get(
        '/api/vendors/nearby?longitude=72.5595&latitude=23.0230&radius=5'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vendors).toHaveLength(2);

      const first = res.body.data.vendors[0];
      const second = res.body.data.vendors[1];

      // Ramesh should be closest
      expect(first.stallName).toBe('Ramesh Famous Chaat & Pani Puri');
      expect(first.distance).toBeLessThan(100); // within 100 meters
      expect(first.distanceKm).toBeDefined();

      // Geeta should be second
      expect(second.stallName).toBe('Geeta Traditional Terracotta Pots');
      expect(second.distance).toBeGreaterThan(first.distance);
      expect(second.distanceKm).toBeGreaterThan(2.5);
    });

    it('should exclude vendors outside the specified radius', async () => {
      // Customer at Law Garden with a narrow radius of 0.5 km (500 meters)
      // Ramesh (~38m) is inside; Geeta (~3.4km) is outside!
      const res = await request(app).get(
        '/api/vendors/nearby?longitude=72.5595&latitude=23.0230&radius=0.5'
      );

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Ramesh Famous Chaat & Pani Puri');
    });

    it('should combine nearby coordinates with category filter', async () => {
      // Customer at Law Garden, search specifically for handcrafts within 10km
      const res = await request(app).get(
        '/api/vendors/nearby?longitude=72.5595&latitude=23.0230&radius=10&category=handcrafts'
      );

      expect(res.status).toBe(200);
      expect(res.body.data.vendors).toHaveLength(1);
      expect(res.body.data.vendors[0].stallName).toBe('Geeta Traditional Terracotta Pots');
    });

    it('should exclude unapproved and suspended vendors from nearby results', async () => {
      const res = await request(app).get(
        '/api/vendors/nearby?longitude=72.5595&latitude=23.0230&radius=10'
      );

      expect(res.status).toBe(200);
      const names = res.body.data.vendors.map((v) => v.stallName);
      expect(names).not.toContain('Draft Snacks & Refreshments');
      expect(names).not.toContain('Suspended Food Kiosk');
    });
  });

  describe('3. Public Vendor Stall Profile (GET /api/vendors/:id)', () => {
    it('should return approved vendor profile with active products', async () => {
      const res = await request(app).get(`/api/vendors/${approvedVendorProfile._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.stallName).toBe('Ramesh Famous Chaat & Pani Puri');
      expect(res.body.data.profile.location.coordinates).toEqual([72.5598, 23.0232]);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].name).toBe('Special Mineral Water Pani Puri');
    });

    it('should return 404 for unapproved vendor profile to public visitors', async () => {
      const res = await request(app).get(`/api/vendors/${unapprovedVendorProfile._id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not publicly listed/i);
    });

    it('should return 404 for suspended vendor profile', async () => {
      const res = await request(app).get(`/api/vendors/${suspendedVendorProfile._id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent profile ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).get(`/api/vendors/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
