const express = require('express');
const { Analytics, Query, Response, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard data (Admin only)
 */
router.get('/dashboard', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Query count
    const queryCount = await Query.countDocuments(dateFilter);

    // Response count
    const responseCount = await Response.countDocuments(dateFilter);

    // Average resolution time (in hours)
    const resolvedQueries = await Query.find({ ...dateFilter, status: 'Resolved' }).lean();
    const queryIds = resolvedQueries.map((q) => q._id);

    // Get all first responses for resolved queries using aggregation
    const firstResponses = await Response.aggregate([
      { $match: { queryId: { $in: queryIds } } },
      { $sort: { timestamp: 1 } },
      {
        $group: {
          _id: '$queryId',
          firstResponseTime: { $first: '$timestamp' },
        },
      },
    ]);

    // Create a map for quick lookup
    const responseMap = new Map(
      firstResponses.map((r) => [r._id.toString(), r.firstResponseTime])
    );

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const query of resolvedQueries) {
      const firstResponseTime = responseMap.get(query._id.toString());
      if (firstResponseTime) {
        const resolutionTime =
          (new Date(firstResponseTime) - new Date(query.timestamp)) / (1000 * 60 * 60); 
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    }

    const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    // User engagement (active users)
    const userDateFilter = {};
    if (startDate || endDate) {
      userDateFilter.createdAt = {};
      if (startDate) userDateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) userDateFilter.createdAt.$lte = new Date(endDate);
    }

    const activeUsers = await User.countDocuments({
      ...userDateFilter,
      points: { $gt: 0 },
    });

    // Category usage
    const categoryUsage = await Query.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      queryCount,
      responseCount,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      activeUsers,
      categoryUsage,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

/**
 * GET /api/analytics/metrics
 * Get time-series metrics
 */
router.get('/metrics', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { metricType, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      timestamp: { $gte: startDate },
    };

    if (metricType) {
      filter.metricType = metricType;
    }

    const metrics = await Analytics.find(filter).sort({ timestamp: 1 });

    res.json(metrics);
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ message: 'Failed to fetch metrics', error: error.message });
  }
});

module.exports = router;

