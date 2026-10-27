import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { COOKIE_NAME } from '../src/utils/token.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Phase 3: Authentication & Role-Based Access Control API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
    // Clean test collection
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Customer Registration (POST /api/auth/register/customer)', () => {
    it('should successfully register a customer and set HttpOnly auth cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Aarav Patel',
          email: 'aarav.customer@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '+919876543210'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('aarav.customer@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.user.accountStatus).toBe('active');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose passwordHash
      expect(res.body.data.token).toBeDefined();

      // Verify HttpOnly cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes(COOKIE_NAME))).toBe(true);
      expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);

      // Verify database record has hashed password
      const dbUser = await User.findOne({ email: 'aarav.customer@example.com' }).select('+passwordHash');
      expect(dbUser).toBeDefined();
      expect(dbUser.passwordHash).not.toBe('Password123!');
      expect(dbUser.passwordHash.startsWith('$2')).toBe(true);
    });

    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Incomplete User'
          // missing email and password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('required');
    });

    it('should reject registration when password is under 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: '12345',
          confirmPassword: '12345'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('8 characters');
    });

    it('should reject registration when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Mismatch Pass',
          email: 'mismatch@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not match');
    });

    it('should prevent duplicate registration with the same normalized email', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Duplicate Aarav',
          email: '  AARAV.CUSTOMER@EXAMPLE.COM  ', // uppercase and whitespace test
          password: 'AnotherPassword123!',
          confirmPassword: 'AnotherPassword123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should strictly prevent role escalation: public registration cannot create an administrator', async () => {
      const res = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Malicious Attacker',
          email: 'attacker@example.com',
          password: 'AttackerPassword123!',
          confirmPassword: 'AttackerPassword123!',
          role: 'admin' // Attempted privilege escalation
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('customer'); // Role must remain 'customer'

      const dbUser = await User.findOne({ email: 'attacker@example.com' });
      expect(dbUser.role).toBe('customer');
    });
  });

  describe('2. Vendor Registration (POST /api/auth/register/vendor)', () => {
    it('should register a vendor account with role "vendor"', async () => {
      const res = await request(app)
        .post('/api/auth/register/vendor')
        .send({
          name: 'Ramesh Prajapati',
          email: 'ramesh.vendor@example.com',
          phone: '+919876543211',
          password: 'VendorPassword123!',
          confirmPassword: 'VendorPassword123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('vendor');
      expect(res.body.data.user.email).toBe('ramesh.vendor@example.com');
      expect(res.body.data.token).toBeDefined();

      const dbVendor = await User.findOne({ email: 'ramesh.vendor@example.com' });
      expect(dbVendor.role).toBe('vendor');
    });

    it('should reject vendor registration attempting role escalation to admin', async () => {
      const res = await request(app)
        .post('/api/auth/register/vendor')
        .send({
          name: 'Fake Vendor Admin',
          email: 'fakeadmin@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'admin'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('vendor'); // Hardcoded to 'vendor'
    });
  });

  describe('3. Login & Authentication Flow (POST /api/auth/login)', () => {
    it('should authenticate user with valid credentials and return token & cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.customer@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('aarav.customer@example.com');
      expect(res.body.data.token).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies.some((c) => c.includes(COOKIE_NAME))).toBe(true);
    });

    it('should reject login with incorrect password with safe generic error', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.customer@example.com',
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email address or password');
    });

    it('should reject login for non-existent email with identical generic error', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user@example.com',
          password: 'AnyPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email address or password');
    });

    it('should block suspended accounts from logging in', async () => {
      // Suspend vendor
      await User.updateOne(
        { email: 'ramesh.vendor@example.com' },
        { accountStatus: 'suspended' }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ramesh.vendor@example.com',
          password: 'VendorPassword123!'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('suspended');

      // Restore vendor status
      await User.updateOne(
        { email: 'ramesh.vendor@example.com' },
        { accountStatus: 'active' }
      );
    });
  });

  describe('4. Current User Verification (GET /api/auth/me)', () => {
    let customerToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.customer@example.com',
          password: 'Password123!'
        });
      customerToken = loginRes.body.data.token;
    });

    it('should return current user data when authenticated via Bearer header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('aarav.customer@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return current user data when authenticated via HttpOnly cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`${COOKIE_NAME}=${customerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Aarav Patel');
    });

    it('should return 401 when no token or cookie is supplied', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for an invalid or tampered token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_tampered_token_xyz');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Role-Based Access Control Middleware (RBAC)', () => {
    let customerToken;
    let vendorToken;
    let adminToken;

    beforeAll(async () => {
      // 1. Create admin user
      const adminPassHash = await User.hashPassword('AdminPass123!');
      await User.create({
        name: 'System Admin',
        email: 'sysadmin@example.com',
        passwordHash: adminPassHash,
        role: 'admin',
        accountStatus: 'active'
      });

      // 2. Obtain tokens
      const custRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'aarav.customer@example.com', password: 'Password123!' });
      customerToken = custRes.body.data.token;

      const vendRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ramesh.vendor@example.com', password: 'VendorPassword123!' });
      vendorToken = vendRes.body.data.token;

      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sysadmin@example.com', password: 'AdminPass123!' });
      adminToken = adminRes.body.data.token;
    });

    it('should permit customer to access customer endpoint', async () => {
      const res = await request(app)
        .get('/api/customer/dashboard-test')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should FORBID customer from accessing vendor-only endpoint (HTTP 403)', async () => {
      const res = await request(app)
        .get('/api/vendor/dashboard-test')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should FORBID customer from accessing admin-only endpoint (HTTP 403)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-test')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should permit vendor to access vendor endpoint', async () => {
      const res = await request(app)
        .get('/api/vendor/dashboard-test')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should FORBID vendor from accessing admin-only endpoint (HTTP 403)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-test')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should permit administrator to access admin-only endpoint', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject unauthenticated request to protected endpoint (HTTP 401)', async () => {
      const res = await request(app).get('/api/admin/dashboard-test');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Logout Flow (POST /api/auth/logout)', () => {
    it('should clear the authentication cookie and return 200 OK', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Cleared cookie should have empty value or past expiration
      expect(cookies.some((c) => c.includes(`${COOKIE_NAME}=;`))).toBe(true);
    });
  });

  describe('7. Password Recovery Flow', () => {
    let resetToken;

    it('should return generic success when requesting reset for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ghost.user@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If an account with that email exists');
    });

    it('should generate secure reset token for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'aarav.customer@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body._testResetToken).toBeDefined(); // Test helper
      resetToken = res.body._testResetToken;

      const user = await User.findOne({ email: 'aarav.customer@example.com' }).select('+resetPasswordToken +resetPasswordExpires');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
      expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
    });

    it('should reject reset request with invalid or expired token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/invalid_token_12345')
        .send({
          password: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalid or has expired');
    });

    it('should successfully reset password when valid token is supplied', async () => {
      const res = await request(app)
        .post(`/api/auth/reset-password/${resetToken}`)
        .send({
          password: 'BrandNewPassword123!',
          confirmPassword: 'BrandNewPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('reset successfully');

      // Verify old password no longer works
      const oldLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'aarav.customer@example.com', password: 'Password123!' });
      expect(oldLogin.status).toBe(401);

      // Verify new password works
      const newLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'aarav.customer@example.com', password: 'BrandNewPassword123!' });
      expect(newLogin.status).toBe(200);
    });
  });
});
