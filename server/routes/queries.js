const express = require('express');
const { body, validationResult } = require('express-validator');
const { Query, Attachment, User, Response, Notification } = require('../models');
const { authenticate } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { uploadFile } = require('../utils/firebase');

const router = express.Router();

/**
 * GET /api/queries
 * Get all queries (with filters)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, status, userId, search, moderationStatus } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) {
      // Handle 'me' as current user
      filter.userId = userId === 'me' ? req.user._id : userId;
    }

    // Moderation status filter
    if (moderationStatus) {
      filter.moderationStatus = moderationStatus;
    } else {
      // Regular users only see approved queries (unless viewing their own)
      if (req.user.role === 'User' && userId !== 'me') {
        filter.moderationStatus = 'Approved';
      }
      // Moderators and Admins can see all queries
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const queries = await Query.find(filter)
      .populate('userId', 'name email')
      .populate('attachments')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(queries);
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ message: 'Failed to fetch queries', error: error.message });
  }
});

/**
 * GET /api/queries/:id
 * Get single query
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('attachments');

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Regular users can only view approved queries (unless it's their own)
    if (
      req.user.role === 'User' &&
      query.userId._id.toString() !== req.user._id.toString() &&
      query.moderationStatus !== 'Approved'
    ) {
      return res.status(403).json({ message: 'This query is not available' });
    }

    // Fetch responses separately (Query model doesn't have responses field)
    const responses = await Response.find({ queryId: query._id })
      .populate('moderatorId', 'name email')
      .sort({ timestamp: 1 });

    // Convert query to object and add responses
    const queryObj = query.toObject();
    queryObj.responses = responses;

    res.json(queryObj);
  } catch (error) {
    console.error('Get query error:', error);
    res.status(500).json({ message: 'Failed to fetch query', error: error.message });
  }
});

/**
 * POST /api/queries
 * Create new query (with voice/file upload)
 */
router.post(
  '/',
  authenticate,
  uploadFields([
    { name: 'attachments', maxCount: 10 },
    { name: 'voiceFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 },
  ]),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('category').isIn(['MRC', 'PRC', 'ERC']).withMessage('Valid category is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, category } = req.body;

      // Handle voice file upload (from 'voiceFile' field)
      let voiceFileUrl = null;
      const voiceFiles = req.files?.voiceFile || [];
      if (voiceFiles.length > 0) {
        const voiceFile = voiceFiles[0];
        try {
          voiceFileUrl = await uploadFile(
            voiceFile.buffer,
            voiceFile.originalname || 'recording.webm',
            'query-voice'
          );
        } catch (error) {
          console.error('Voice file upload error:', error);
        }
      }

      // Handle video file upload (from 'videoFile' field)
      let videoFileUrl = null;
      const videoFiles = req.files?.videoFile || [];
      if (videoFiles.length > 0) {
        const videoFile = videoFiles[0];
        try {
          videoFileUrl = await uploadFile(videoFile.buffer, videoFile.originalname, 'query-video');
        } catch (error) {
          console.error('Video file upload error:', error);
        }
      }

      // Upload attachments if provided (from 'attachments' field)
      const attachmentIds = [];
      const attachmentFiles = req.files?.attachments || [];
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            const fileUrl = await uploadFile(file.buffer, file.originalname, 'query-attachments');
            const attachment = new Attachment({
              queryId: null, // Will be updated after query creation
              fileUrl,
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              type: determineFileType(file.mimetype),
            });
            await attachment.save();
            attachmentIds.push(attachment._id);
          } catch (error) {
            console.error('File upload error:', error);
          }
        }
      }

      // Create query (starts as Pending for moderation)
      const query = new Query({
        userId: req.user._id,
        title,
        content: content || '',
        voiceFile: voiceFileUrl,
        videoFile: videoFileUrl,
        attachments: attachmentIds,
        category,
        status: 'Open',
        moderationStatus: 'Pending', // New queries require moderator approval
      });

      await query.save();

      // Update attachments with queryId
      if (attachmentIds.length > 0) {
        await Attachment.updateMany(
          { _id: { $in: attachmentIds } },
          { $set: { queryId: query._id } }
        );
      }

      // Award points for posting query
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

      // Notify all moderators and admins about new query
      try {
        const moderators = await User.find({ role: { $in: ['Moderator', 'Admin'] } }).select('_id');
        if (moderators.length > 0) {
          const notifications = moderators.map((mod) => ({
            userId: mod._id,
            type: 'NewQuery',
            title: 'New Query Submitted',
            message: `A new ${category} query "${title}" has been submitted and needs review.`,
            relatedQuery: query._id,
          }));
          await Notification.insertMany(notifications);
        }
      } catch (notifyError) {
        console.error('Failed to create notifications:', notifyError);
      }

      const populatedQuery = await Query.findById(query._id)
        .populate('userId', 'name email')
        .populate('attachments');

      res.status(201).json(populatedQuery);
    } catch (error) {
      console.error('Create query error:', error);
      res.status(500).json({ message: 'Failed to create query', error: error.message });
    }
  }
);

/**
 * PATCH /api/queries/:id/status
 * Update query status (Moderator/Admin only)
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Open', 'InProgress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && req.user.role !== 'Moderator') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const query = await Query.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'userId',
      'name email'
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json(query);
  } catch (error) {
    console.error('Update query status error:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

/**
 * Helper: Determine file type from MIME type
 */
function determineFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'Image';
  if (
    mimetype.includes('code') ||
    mimetype.includes('text/plain') ||
    mimetype.includes('text/x-') ||
    mimetype.includes('javascript') ||
    mimetype.includes('json')
  )
    return 'Code';
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('document') ||
    mimetype.includes('word') ||
    mimetype.includes('sheet')
  )
    return 'Document';
  if (mimetype.startsWith('audio/')) return 'Audio';
  if (mimetype.startsWith('video/')) return 'Video';
  return 'Other';
}

module.exports = router;
