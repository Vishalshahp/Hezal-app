import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/hezal_market_test';

describe('Free Google Authentication API Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    }
    await User.deleteMany({ email: { $in: ['demo.google@hezalmarket.com', 'demo.user@gmail.com', 'admin@hezalmarket.com'] } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['demo.google@hezalmarket.com', 'demo.user@gmail.com'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('POST /api/auth/google signs in and provisions a new customer using Google credentials', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'demo-google:demo.google@hezalmarket.com:Aarav Google',
        role: 'customer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo.google@hezalmarket.com');
    expect(res.body.data.user.name).toBe('Aarav Google');
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/google assigns admin role when signing in with admin email', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'demo-google-admin',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@hezalmarket.com');
    expect(res.body.data.user.role).toBe('admin');
  });

  it('POST /api/auth/google rejects request when idToken is missing', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
