import { describe, it, expect, vi, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';

describe('Health API Endpoints', () => {
  afterAll(async () => {
    // Ensure clean state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('GET /api/health', () => {
    it('should return 200 and report API is running', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ok');
      expect(res.body.message).toBe('Hezal Market API is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('should return 200 welcome info on the root route', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.name).toBe('Hezal Market API');
    });
  });

  describe('GET /api/health/db', () => {
    it('should return 503 when database is disconnected without exposing secrets', async () => {
      // Force disconnected state
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);

      const res = await request(app).get('/api/health/db');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.status).toBe('disconnected');
      expect(res.body.message).toContain('Database is not connected');

      // Crucial: ensure no connection string or password is leaked
      const bodyString = JSON.stringify(res.body);
      expect(bodyString).not.toContain('mongodb://');
      expect(bodyString).not.toContain('mongodb+srv://');
      expect(bodyString).not.toContain('password');
    });
  });
});
