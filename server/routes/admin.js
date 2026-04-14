const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Query, Response, Badge, UserBadge, Attachment } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require Admin role
router.use(authenticate);
router.use(authorize('Admin'));

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role } = req.query;
    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role (promote/demote)
 */
router.patch(
  '/users/:id/role',
  [body('role').isIn(['Admin', 'Moderator', 'User']).withMessage('Invalid role')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const userId = req.params.id;

      // Prevent changing own role
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }

      const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select(
        '-passwordHash'
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Failed to update role', error: error.message });
    }
  }
);

/**
 * PATCH /api/admin/users/:id/points
 * Update user points
 */
router.patch(
  '/users/:id/points',
  [body('points').isInt({ min: 0 }).withMessage('Points must be a non-negative integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { points } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { points }, { new: true }).select(
        '-passwordHash'
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update points error:', error);
      res.status(500).json({ message: 'Failed to update points', error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting own account
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related data
    await Query.deleteMany({ userId });
    await Response.deleteMany({ moderatorId: userId });
    await UserBadge.deleteMany({ userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// ========================================
// QUERY MANAGEMENT
// ========================================

/**
 * GET /api/admin/queries
 * Get all queries (admin view)
 */
router.get('/queries', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { content: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const queries = await Query.find(filter)
      .populate('userId', 'name email')
      .populate('attachments')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Query.countDocuments(filter);

    res.json({
      queries,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ message: 'Failed to fetch queries', error: error.message });
  }
});

/**
 * PATCH /api/admin/queries/:id
 * Update query (admin)
 */
router.patch(
  '/queries/:id',
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('status').optional().isIn(['Open', 'InProgress', 'Resolved']),
    body('category').optional().isIn(['MRC', 'PRC', 'ERC']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = await Query.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate('userId', 'name email')
        .populate('attachments');

      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      res.json(query);
    } catch (error) {
      console.error('Update query error:', error);
      res.status(500).json({ message: 'Failed to update query', error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/queries/:id
 * Delete query
 */
router.delete('/queries/:id', async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Delete related data
    await Response.deleteMany({ queryId: req.params.id });
    await Attachment.deleteMany({ queryId: req.params.id });

    res.json({ message: 'Query deleted successfully' });
  } catch (error) {
    console.error('Delete query error:', error);
    res.status(500).json({ message: 'Failed to delete query', error: error.message });
  }
});

// ========================================
// RESPONSE MANAGEMENT
// ========================================

/**
 * GET /api/admin/responses
 * Get all responses
 */
router.get('/responses', async (req, res) => {
  try {
    const { page = 1, limit = 50, queryId } = req.query;
    const filter = {};

    if (queryId) filter.queryId = queryId;

    const responses = await Response.find(filter)
      .populate('queryId', 'title category')
      .populate('moderatorId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Response.countDocuments(filter);

    res.json({
      responses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error: error.message });
  }
});

/**
 * PATCH /api/admin/responses/:id
 * Update response
 */
router.patch(
  '/responses/:id',
  [
    body('responseText').optional().trim(),
    body('responseType').optional().isIn(['Text', 'Audio', 'Video']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const response = await Response.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate('queryId', 'title category')
        .populate('moderatorId', 'name email role');

      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }

      res.json(response);
    } catch (error) {
      console.error('Update response error:', error);
      res.status(500).json({ message: 'Failed to update response', error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/responses/:id
 * Delete response
 */
router.delete('/responses/:id', async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ message: 'Failed to delete response', error: error.message });
  }
});

// ========================================
// BADGE MANAGEMENT
// ========================================

/**
 * GET /api/admin/badges
 * Get all badges
 */
router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    res.json(badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to fetch badges', error: error.message });
  }
});

/**
 * POST /api/admin/badges
 * Create badge
 */
router.post(
  '/badges',
  [
    body('name').trim().notEmpty().withMessage('Badge name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;
      const badge = new Badge({ name, description });
      await badge.save();

      res.status(201).json(badge);
    } catch (error) {
      console.error('Create badge error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Badge name already exists' });
      }
      res.status(500).json({ message: 'Failed to create badge', error: error.message });
    }
  }
);

/**
 * PATCH /api/admin/badges/:id
 * Update badge
 */
router.patch(
  '/badges/:id',
  [body('name').optional().trim().notEmpty(), body('description').optional().trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }

      res.json(badge);
    } catch (error) {
      console.error('Update badge error:', error);
      res.status(500).json({ message: 'Failed to update badge', error: error.message });
    }
  }
);

/**
 * DELETE /api/admin/badges/:id
 * Delete badge
 */
router.delete('/badges/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    // Delete user badge associations
    await UserBadge.deleteMany({ badgeId: req.params.id });

    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ message: 'Failed to delete badge', error: error.message });
  }
});

/**
 * POST /api/admin/badges/:id/assign
 * Assign badge to user
 */
router.post(
  '/badges/:id/assign',
  [body('userId').notEmpty().withMessage('User ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.body;
      const badgeId = req.params.id;

      // Check if already assigned
      const existing = await UserBadge.findOne({ userId, badgeId });
      if (existing) {
        return res.status(400).json({ message: 'Badge already assigned to user' });
      }

      const userBadge = new UserBadge({ userId, badgeId });
      await userBadge.save();

      const populated = await UserBadge.findById(userBadge._id)
        .populate('userId', 'name email')
        .populate('badgeId', 'name description');

      res.status(201).json(populated);
    } catch (error) {
      console.error('Assign badge error:', error);
      res.status(500).json({ message: 'Failed to assign badge', error: error.message });
    }
  }
);

module.exports = router;
