const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const { User, Query } = require('../models');
const jwt = require('jsonwebtoken');

describe('Query Posting', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdasp-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Query.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Query.deleteMany({});

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    userId = user._id;

    // Generate token
    authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /api/queries', () => {
    it('should create a new query', async () => {
      const res = await request(app)
        .post('/api/queries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Query',
          content: 'This is a test query',
          category: 'MRC',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Query');
    });

    it('should require authentication', async () => {
      const res = await request(app).post('/api/queries').send({
        title: 'Test Query',
        category: 'MRC',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});

