import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

describe('PawPair Backend API Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('PawPair API');
  });

  it('GET /api/dogs should return seeded dogs from MongoDB Atlas', async () => {
    const res = await request(app).get('/api/dogs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('breed');
    expect(res.body[0]).toHaveProperty('adoptionFee');
  });

  it('GET /api/shelters should return seeded shelters', async () => {
    const res = await request(app).get('/api/shelters');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('POST /api/auth/demo-switch should authenticate demo user and set cookie', async () => {
    const res = await request(app)
      .post('/api/auth/demo-switch')
      .send({ email: 'maya.lin@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('maya.lin@example.com');
    expect(res.headers['set-cookie']).toBeDefined();

    const cookies = res.headers['set-cookie'];
    // Use cookie to check /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('maya.lin@example.com');
  });

  it('GET /api/auth/me without token returns 401 unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Authentication required');
  });

  it('GET /api/auth/me with Bearer token header authenticates correctly', async () => {
    const loginRes = await request(app)
      .post('/api/auth/demo-switch')
      .send({ email: 'maya.lin@example.com' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('maya.lin@example.com');
  });

  it('POST /api/auth/logout should clear session', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
