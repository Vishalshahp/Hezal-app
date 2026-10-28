import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import OtpVerification from '../src/models/OtpVerification.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('SMS & Phone OTP Verification API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
    await User.deleteMany({});
    await OtpVerification.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await OtpVerification.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('1. Request OTP (POST /api/auth/otp/send)', () => {
    it('should reject request when phone number is missing', async () => {
      const res = await request(app)
        .post('/api/auth/otp/send')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Mobile phone number is required');
    });

    it('should reject invalid phone numbers', async () => {
      const res = await request(app)
        .post('/api/auth/otp/send')
        .send({ phone: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid 10-digit mobile number');
    });

    it('should successfully dispatch OTP to a valid Indian mobile number', async () => {
      const res = await request(app)
        .post('/api/auth/otp/send')
        .send({ phone: '+91 98765 43210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('9876543210');
      expect(res.body.data.expiresInSeconds).toBe(300);
      expect(res.body.data.devOtp).toBeDefined(); // Dev simulator provides OTP for easy testing

      // Verify OTP stored in MongoDB
      const record = await OtpVerification.findOne({ phone: '9876543210' });
      expect(record).not.toBeNull();
      expect(record.verified).toBe(false);
      expect(record.otpHash).toBeDefined();
    });
  });

  describe('2. Verify OTP (POST /api/auth/otp/verify)', () => {
    let devOtp;

    beforeAll(async () => {
      const sendRes = await request(app)
        .post('/api/auth/otp/send')
        .send({ phone: '9123456789' });
      devOtp = sendRes.body.data.devOtp;
    });

    it('should reject verification if OTP is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phone: '9123456789', otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid verification code');
    });

    it('should reject verification if OTP is not 6 digits', async () => {
      const res = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phone: '9123456789', otp: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('must be exactly 6 digits');
    });

    it('should verify successfully when correct OTP is provided', async () => {
      const res = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phone: '9123456789', otp: devOtp });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);
      expect(res.body.data.verificationToken).toBeDefined();

      // Check DB record updated
      const record = await OtpVerification.findOne({ phone: '9123456789' });
      expect(record.verified).toBe(true);
      expect(record.verificationToken).toBe(res.body.data.verificationToken);
    });
  });

  describe('3. Register Account with Verified Phone', () => {
    it('should register a customer and mark phoneVerified: true when verification token is supplied', async () => {
      // Step 1: Send OTP
      const sendRes = await request(app)
        .post('/api/auth/otp/send')
        .send({ phone: '9888877777' });
      const otp = sendRes.body.data.devOtp;

      // Step 2: Verify OTP
      const verifyRes = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phone: '9888877777', otp });
      const token = verifyRes.body.data.verificationToken;

      // Step 3: Register Customer
      const regRes = await request(app)
        .post('/api/auth/register/customer')
        .send({
          name: 'Verified Customer',
          email: 'verified.cust@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9888877777',
          verificationToken: token
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.phoneVerified).toBe(true);
    });

    it('should register a vendor with verified phone and stall notice', async () => {
      // Step 1: Send OTP
      const sendRes = await request(app)
        .post('/api/auth/otp/send')
        .send({ phone: '9999900000' });
      const otp = sendRes.body.data.devOtp;

      // Step 2: Verify OTP
      const verifyRes = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phone: '9999900000', otp });
      const token = verifyRes.body.data.verificationToken;

      // Step 3: Register Vendor
      const regRes = await request(app)
        .post('/api/auth/register/vendor')
        .send({
          name: 'Verified Chai Stall Owner',
          email: 'chaivala@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          phone: '9999900000',
          verificationToken: token
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.phoneVerified).toBe(true);
      expect(regRes.body.data.user.role).toBe('vendor');
    });
  });
});
