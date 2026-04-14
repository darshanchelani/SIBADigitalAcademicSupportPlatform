const express = require('express');
const { Session, Query } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

/**
 * POST /api/sessions/schedule
 * Schedule Zoom session (Moderator/Admin only)
 */
router.post('/schedule', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const { queryId, scheduledTime } = req.body;

    const query = await Query.findById(queryId);
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Generate Zoom link (mock implementation)
    // In production, use Zoom API to create actual meeting
    let zoomLink = null;

    if (process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET) {
      try {
        // Create Zoom meeting (simplified - use Zoom SDK in production)
        const meetingResponse = await createZoomMeeting(scheduledTime);
        zoomLink = meetingResponse.join_url;
      } catch (error) {
        console.error('Zoom API error:', error);
        // Fallback to mock link
        zoomLink = `https://zoom.us/j/mock-${Date.now()}`;
      }
    } else {
      // Mock link for development
      zoomLink = `https://zoom.us/j/mock-${Date.now()}`;
    }

    const session = new Session({
      queryId,
      zoomLink,
      scheduledTime: new Date(scheduledTime),
    });

    await session.save();

    res.status(201).json(session);
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ message: 'Failed to schedule session', error: error.message });
  }
});

/**
 * PATCH /api/sessions/:id/recording
 * Update session with recording URL
 */
router.patch('/:id/recording', authenticate, authorize('Moderator', 'Admin'), async (req, res) => {
  try {
    const { recordingUrl } = req.body;

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { recordingUrl },
      { new: true }
    ).populate('queryId', 'title');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Update recording error:', error);
    res.status(500).json({ message: 'Failed to update recording', error: error.message });
  }
});

/**
 * Helper: Create Zoom meeting (mock implementation)
 */
async function createZoomMeeting(scheduledTime) {
  // This is a simplified mock. In production, use Zoom SDK properly
  return {
    join_url: `https://zoom.us/j/${Math.random().toString(36).substring(7)}`,
    start_url: `https://zoom.us/s/${Math.random().toString(36).substring(7)}`,
  };
}

module.exports = router;

