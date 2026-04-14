const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const { User, Query } = require('../models');
const jwt = require('jsonwebtoken');

describe('AI Draft Flow', () => {
  let moderatorToken;
  let moderatorId;
  let queryId;

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

    // Create moderator
    const moderator = await User.create({
      name: 'Moderator',
      email: 'mod@example.com',
      passwordHash: 'hashed',
      role: 'Moderator',
    });
    moderatorId = moderator._id;
    moderatorToken = jwt.sign(
      { userId: moderator._id },
      process.env.JWT_SECRET || 'test-secret'
    );

    // Create test query
    const query = await Query.create({
      userId: moderatorId,
      title: 'Test Query',
      content: 'This is a test query for AI draft',
      category: 'MRC',
      status: 'Open',
    });
    queryId = query._id;
  });

  describe('POST /api/moderator/generate-draft', () => {
    it('should generate AI draft for query', async () => {
      const res = await request(app)
        .post('/api/moderator/generate-draft')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ queryId: queryId.toString() });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('draft');
      expect(res.body).toHaveProperty('queryId');
    });

    it('should require moderator role', async () => {
      // Create regular user
      const user = await User.create({
        name: 'User',
        email: 'user@example.com',
        passwordHash: 'hashed',
        role: 'User',
      });
      const userToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-secret'
      );

      const res = await request(app)
        .post('/api/moderator/generate-draft')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ queryId: queryId.toString() });

      expect(res.statusCode).toBe(403);
    });
  });
});

