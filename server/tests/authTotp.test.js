import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { generateTOTP } from '../src/utils/totp.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Passwordless TOTP & Google Authenticator API Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
    // Clean and seed a test admin user with 2FA enabled
    await User.deleteMany({ email: 'totpadmin@hezalmarket.com' });
    const passwordHash = await User.hashPassword('AdminPassword123!');
    await User.create({
      name: 'TOTP Admin',
      email: 'totpadmin@hezalmarket.com',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'totpadmin@hezalmarket.com' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/auth/totp/demo-code returns a live 6-digit TOTP code and countdown', async () => {
    const res = await request(app).get('/api/auth/totp/demo-code');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.demoEmail).toBe('admin@hezalmarket.com');
    expect(res.body.data.demoSecret).toBe('JBSWY3DPEHPK3PXP');
    expect(res.body.data.code).toMatch(/^\d{6}$/);
    expect(res.body.data.remainingSeconds).toBeGreaterThan(0);
    expect(res.body.data.remainingSeconds).toBeLessThanOrEqual(30);
  });

  it('POST /api/auth/login/totp succeeds with email and valid TOTP code without password', async () => {
    const validCode = generateTOTP('JBSWY3DPEHPK3PXP');
    const res = await request(app)
      .post('/api/auth/login/totp')
      .send({
        email: 'totpadmin@hezalmarket.com',
        code: validCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('totpadmin@hezalmarket.com');
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login/totp fails with an invalid TOTP code', async () => {
    const res = await request(app)
      .post('/api/auth/login/totp')
      .send({
        email: 'totpadmin@hezalmarket.com',
        code: '000000',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  it('POST /api/auth/login/totp fails with non-existent user email', async () => {
    const res = await request(app)
      .post('/api/auth/login/totp')
      .send({
        email: 'nonexistent@hezalmarket.com',
        code: '123456',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login/totp rejects request with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login/totp')
      .send({
        email: 'totpadmin@hezalmarket.com',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
