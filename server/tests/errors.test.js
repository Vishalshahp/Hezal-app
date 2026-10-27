import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Error Handling and 404 Routing', () => {
  it('should return 404 JSON response for an unmatched route', async () => {
    const res = await request(app).get('/api/unmatched-route-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error.path).toBe('/api/unmatched-route-xyz');
  });

  it('should return 404 for unknown root route', async () => {
    const res = await request(app).post('/random-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.method).toBe('POST');
  });
});
