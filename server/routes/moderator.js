const express = require('express');
const { body, validationResult } = require('express-validator');
const { Query, Response } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { generateAIDraft } = require('../middleware/ai');

const router = express.Router();

/**
 * GET /api/moderator/queue
 * Get moderation queue (Pending queries for approval + Open/InProgress queries for response)
 */
router.get('/queue', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'pending', 'active', or 'all'
    
    let filter = {};
    if (type === 'pending') {
      filter = { moderationStatus: 'Pending' };
    } else if (type === 'active') {
      filter = {
        moderationStatus: 'Approved',
        status: { $in: ['Open', 'InProgress'] },
      };
    } else {
      // All: pending for approval + approved active queries (excluding closed)
      filter = {
        $or: [
          { moderationStatus: 'Pending' },
          {
            moderationStatus: 'Approved',
            status: { $in: ['Open', 'InProgress', 'Resolved', 'Closed'] },
          },
        ],
      };
    }

    const queries = await Query.find(filter)
      .populate('userId', 'name email')
      .populate('attachments')
      .sort({ timestamp: 1 }); // Oldest first

    res.json(queries);
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ message: 'Failed to fetch queue', error: error.message });
  }
});

/**
 * POST /api/moderator/approve-query
 * Approve a pending query
 */
router.post(
  '/approve-query',
  authenticate,
  authorize('Moderator', 'Admin'),
  [body('queryId').notEmpty().withMessage('Query ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { queryId } = req.body;

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      if (query.moderationStatus !== 'Pending') {
        return res.status(400).json({ message: 'Query is not pending approval' });
      }

      // Approve the query
      query.moderationStatus = 'Approved';
      await query.save();

      res.json({
        message: 'Query approved successfully',
        query: await Query.findById(queryId)
          .populate('userId', 'name email')
          .populate('attachments'),
      });
    } catch (error) {
      console.error('Approve query error:', error);
      res.status(500).json({ message: 'Failed to approve query', error: error.message });
    }
  }
);

/**
 * POST /api/moderator/reject-query
 * Reject a pending query
 */
router.post(
  '/reject-query',
  authenticate,
  authorize('Moderator', 'Admin'),
  [
    body('queryId').notEmpty().withMessage('Query ID is required'),
    body('rejectionReason').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { queryId, rejectionReason } = req.body;

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      if (query.moderationStatus !== 'Pending') {
        return res.status(400).json({ message: 'Query is not pending approval' });
      }

      // Reject the query
      query.moderationStatus = 'Rejected';
      if (rejectionReason) {
        query.rejectionReason = rejectionReason;
      }
      await query.save();

      res.json({
        message: 'Query rejected successfully',
        query: await Query.findById(queryId)
          .populate('userId', 'name email')
          .populate('attachments'),
      });
    } catch (error) {
      console.error('Reject query error:', error);
      res.status(500).json({ message: 'Failed to reject query', error: error.message });
    }
  }
);

/**
 * POST /api/moderator/generate-draft
 * Generate AI draft for a query
 */
router.post('/generate-draft', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const { queryId } = req.body;

    const query = await Query.findById(queryId);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    const queryText = query.content || query.title;
    const draft = await generateAIDraft(queryText, query.category);

    res.json({
      queryId,
      draft: draft.responseText,
      confidence: draft.confidence,
      model: draft.model || 'fallback',
    });
  } catch (error) {
    console.error('Generate draft error:', error);
    res.status(500).json({ message: 'Failed to generate draft', error: error.message });
  }
});

/**
 * POST /api/moderator/submit-response
 * Submit response (from draft or manual)
 */
router.post('/submit-response', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const { queryId, responseText, responseType = 'Text' } = req.body;

    const query = await Query.findById(queryId);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Create response
    const response = new Response({
      queryId,
      moderatorId: req.user._id,
      responseText,
      responseType,
    });

    await response.save();

    // Update query status to Resolved
    await Query.findByIdAndUpdate(queryId, { status: 'Resolved' });

    const populatedResponse = await Response.findById(response._id)
      .populate('queryId', 'title category')
      .populate('moderatorId', 'name email role');

    res.status(201).json(populatedResponse);
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Failed to submit response', error: error.message });
  }
});

/**
 * GET /api/moderator/templates
 * Get response templates
 */
router.get('/templates', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const templates = [
      {
        id: 'acknowledge',
        name: 'Acknowledgment',
        text: 'Thank you for your query. We have received your request and will provide a detailed response shortly.',
      },
      {
        id: 'clarification',
        name: 'Need Clarification',
        text: 'Thank you for your query. To provide you with the most accurate response, could you please provide more details about [specific aspect]?',
      },
      {
        id: 'resolved',
        name: 'Resolution',
        text: 'Thank you for your query. Based on the information provided, here is the solution: [your response here]',
      },
      {
        id: 'escalate',
        name: 'Escalation',
        text: 'Thank you for your query. This matter requires further investigation. We have escalated it to the appropriate department and will get back to you soon.',
      },
    ];

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
});

/**
 * POST /api/moderator/close-query
 * Close a query (moderator only)
 */
router.post(
  '/close-query',
  authenticate,
  authorize('Moderator', 'Admin'),
  [body('queryId').notEmpty().withMessage('Query ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { queryId } = req.body;

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      if (query.status === 'Closed') {
        return res.status(400).json({ message: 'Query is already closed' });
      }

      // Close the query
      query.status = 'Closed';
      await query.save();

      res.json({
        message: 'Query closed successfully',
        query: await Query.findById(queryId)
          .populate('userId', 'name email')
          .populate('attachments'),
      });
    } catch (error) {
      console.error('Close query error:', error);
      res.status(500).json({ message: 'Failed to close query', error: error.message });
    }
  }
);

/**
 * GET /api/moderator/stats
 * Get moderator statistics
 */
router.get('/stats', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const totalPending = await Query.countDocuments({
      status: { $in: ['Open', 'InProgress'] },
    });

    const openCount = await Query.countDocuments({ status: 'Open' });
    const inProgressCount = await Query.countDocuments({ status: 'InProgress' });

    const myResponses = await Response.countDocuments({
      moderatorId: req.user._id,
    });

    const todayResponses = await Response.countDocuments({
      moderatorId: req.user._id,
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    res.json({
      totalPending,
      openCount,
      inProgressCount,
      myResponses,
      todayResponses,
    });
  } catch (error) {
    console.error('Get moderator stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

module.exports = router;

