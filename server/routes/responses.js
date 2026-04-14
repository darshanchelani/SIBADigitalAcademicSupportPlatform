const express = require('express');
const { body, validationResult } = require('express-validator');
const { Response, Query, Attachment } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');
const { uploadFile } = require('../utils/firebase');

const router = express.Router();

/**
 * GET /api/responses
 * Get responses (with filters)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { queryId } = req.query;
    const filter = {};

    if (queryId) filter.queryId = queryId;

    const responses = await Response.find(filter)
      .populate('queryId', 'title category')
      .populate('moderatorId', 'name email role') // Include role to distinguish moderators from peers
      .populate('attachments')
      .sort({ timestamp: -1 });

    res.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Failed to fetch responses', error: error.message });
  }
});

/**
 * POST /api/responses
 * Create response (All authenticated users can respond)
 */
router.post(
  '/',
  authenticate,
  uploadFields([
    { name: 'attachments', maxCount: 10 },
    { name: 'voiceFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 },
    { name: 'file', maxCount: 1 }, // Legacy support
  ]),
  [
    body('queryId').notEmpty().withMessage('Query ID is required'),
    body('responseType').isIn(['Text', 'Audio', 'Video']).withMessage('Valid response type is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { queryId, responseText, responseType } = req.body;

      // Verify query exists
      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ message: 'Query not found' });
      }

      // Prevent users from responding to their own queries
      if (query.userId.toString() === req.user._id.toString()) {
        return res.status(403).json({ message: 'You cannot respond to your own query' });
      }

      // Validate that at least one form of content is provided
      const hasVoice = req.files?.voiceFile && req.files.voiceFile.length > 0;
      const hasVideo = req.files?.videoFile && req.files.videoFile.length > 0;
      const hasAttachments = req.files?.attachments && req.files.attachments.length > 0;
      const hasText = responseText && responseText.trim().length > 0;

      if (!hasText && !hasVoice && !hasVideo && !hasAttachments) {
        return res.status(400).json({ message: 'Response must include text, voice, video, or attachments' });
      }

      // Handle voice file upload
      let voiceFileUrl = null;
      const voiceFiles = req.files?.voiceFile || [];
      if (voiceFiles.length > 0) {
        const voiceFile = voiceFiles[0];
        try {
          voiceFileUrl = await uploadFile(voiceFile.buffer, voiceFile.originalname || 'recording.webm', 'response-voice');
        } catch (error) {
          console.error('Voice file upload error:', error);
        }
      }

      // Handle video file upload
      let videoFileUrl = null;
      const videoFiles = req.files?.videoFile || [];
      if (videoFiles.length > 0) {
        const videoFile = videoFiles[0];
        try {
          videoFileUrl = await uploadFile(videoFile.buffer, videoFile.originalname, 'response-video');
        } catch (error) {
          console.error('Video file upload error:', error);
        }
      }

      // Legacy support: handle 'file' field for Audio/Video
      let fileUrl = null;
      const legacyFiles = req.files?.file || [];
      if (legacyFiles.length > 0 && (responseType === 'Audio' || responseType === 'Video')) {
        const file = legacyFiles[0];
        fileUrl = await uploadFile(file.buffer, file.originalname, 'responses');
      }

      // Upload attachments
      const attachmentIds = [];
      const attachmentFiles = req.files?.attachments || [];
      if (attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          try {
            const uploadedUrl = await uploadFile(file.buffer, file.originalname, 'response-attachments');
            const attachment = new Attachment({
              responseId: null, // Will be updated after response creation
              fileUrl: uploadedUrl,
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              type: determineFileType(file.mimetype),
            });
            await attachment.save();
            attachmentIds.push(attachment._id);
          } catch (error) {
            console.error('Attachment upload error:', error);
          }
        }
      }

      // Create response (moderatorId field stores the responder, can be any user)
      const response = new Response({
        queryId,
        moderatorId: req.user._id, // This field stores the responder (user or moderator)
        responseText: responseText || null,
        responseType,
        fileUrl: fileUrl || videoFileUrl || voiceFileUrl, // Legacy support
        voiceFile: voiceFileUrl,
        videoFile: videoFileUrl,
        attachments: attachmentIds,
      });

      await response.save();

      // Update attachments with responseId
      if (attachmentIds.length > 0) {
        await Attachment.updateMany(
          { _id: { $in: attachmentIds } },
          { $set: { responseId: response._id } }
        );
      }

      // Award points for responding (only for regular users, not moderators/admins)
      if (req.user.role === 'User') {
        const { User } = require('../models');
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });
      }

      // Update query status to Resolved if moderator/admin responds, or InProgress if peer responds
      if (req.user.role === 'Moderator' || req.user.role === 'Admin') {
        if (query.status !== 'Resolved') {
          await Query.findByIdAndUpdate(queryId, { status: 'Resolved' });
        }
      } else {
        // Peer response - set to InProgress if still Open
        if (query.status === 'Open') {
          await Query.findByIdAndUpdate(queryId, { status: 'InProgress' });
        }
      }

      const populatedResponse = await Response.findById(response._id)
        .populate('queryId', 'title category')
        .populate('moderatorId', 'name email role');

      res.status(201).json(populatedResponse);
    } catch (error) {
      console.error('Create response error:', error);
      res.status(500).json({ message: 'Failed to create response', error: error.message });
    }
  }
);

module.exports = router;

