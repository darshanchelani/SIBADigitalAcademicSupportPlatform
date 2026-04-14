const express = require('express');
const { Query, Response } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/kb/search
 * Search knowledge base (queries with resolved responses)
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, category, limit = 50 } = req.query;

    // Build filter - show only approved queries to regular users
    const filter = { moderationStatus: 'Approved' };

    // Category filter
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Text search - use escaped regex for safe search
    if (q && q.trim()) {
      const searchTerm = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    console.log('KB Search Filter:', JSON.stringify(filter, null, 2));

    // Fetch queries
    const queries = await Query.find(filter)
      .populate('userId', 'name email')
      .sort({ status: 1, timestamp: -1 }) // Resolved first, then by date
      .limit(parseInt(limit))
      .lean();

    console.log(`Found ${queries.length} queries`);

    // Fetch responses for each query (only if we have queries)
    let queriesWithResponses = queries;
    if (queries.length > 0) {
      const queryIds = queries.map((query) => query._id);
      const responses = await Response.find({ queryId: { $in: queryIds } })
        .populate('moderatorId', 'name')
        .sort({ timestamp: 1 })
        .lean();

      // Group responses by queryId
      const responsesByQuery = {};
      responses.forEach((response) => {
        const queryId = response.queryId ? response.queryId.toString() : null;
        if (queryId) {
          if (!responsesByQuery[queryId]) {
            responsesByQuery[queryId] = [];
          }
          responsesByQuery[queryId].push(response);
        }
      });

      // Attach responses to queries
      queriesWithResponses = queries.map((query) => ({
        ...query,
        responses: responsesByQuery[query._id.toString()] || [],
      }));
    }

    res.json(queriesWithResponses);
  } catch (error) {
    console.error('KB search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

/**
 * GET /api/kb/categories
 * Get query counts by category
 */
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await Query.aggregate([
      {
        $match: { status: 'Resolved' },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

module.exports = router;
