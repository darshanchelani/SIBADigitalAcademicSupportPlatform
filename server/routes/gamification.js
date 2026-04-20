const express = require('express');
const { User, Badge, UserBadge, Leaderboard, Certificate, Response, Notification } = require('../models');
const crypto = require('crypto');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/gamification/points
 * Get user points
 */
router.get('/points', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points');
    res.json({ points: user.points });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: 'Failed to fetch points', error: error.message });
  }
});

/**
 * GET /api/gamification/badges
 * Get user badges
 */
router.get('/badges', authenticate, async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.user._id }).populate('badgeId');
    res.json(userBadges.map((ub) => ({ badge: ub.badgeId, awardedTime: ub.awardedTime })));
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Failed to fetch badges', error: error.message });
  }
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard (generates on-the-fly from user points)
 */
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    // Get all users sorted by points (descending)
    const users = await User.find({})
      .select('_id name email points')
      .sort({ points: -1 })
      .limit(100)
      .lean();

    // Generate leaderboard entries on-the-fly
    const leaderboard = users.map((user, index) => ({
      _id: `lb_${user._id}`,
      userId: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      rank: index + 1,
      score: user.points || 0,
    }));

    // Optionally update the Leaderboard collection in the background (non-blocking)
    if (leaderboard.length > 0) {
      // Update leaderboard collection asynchronously
      Leaderboard.deleteMany({})
        .then(() => {
          const entries = leaderboard.map((entry) => ({
            userId: entry.userId._id,
            rank: entry.rank,
            score: entry.score,
          }));
          return Leaderboard.insertMany(entries);
        })
        .then(() => {
          console.log('✅ Leaderboard collection updated');
        })
        .catch((err) => {
          console.error('Error updating leaderboard collection:', err);
        });
    }

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

/**
 * POST /api/gamification/update-leaderboard
 * Manually update leaderboard (optional, for admin use)
 */
router.post('/update-leaderboard', authenticate, authorize('Admin'), async (req, res) => {
  try {
    // Get all users sorted by points
    const users = await User.find({}).select('_id points').sort({ points: -1 }).limit(100);

    // Clear existing leaderboard
    await Leaderboard.deleteMany({});

    // Create new leaderboard entries
    const leaderboardEntries = users.map((user, index) => ({
      userId: user._id,
      rank: index + 1,
      score: user.points || 0,
    }));

    if (leaderboardEntries.length > 0) {
      await Leaderboard.insertMany(leaderboardEntries);
    }

    res.json({
      message: 'Leaderboard updated successfully',
      entries: leaderboardEntries.length,
    });
  } catch (error) {
    console.error('Update leaderboard error:', error);
    res.status(500).json({ message: 'Failed to update leaderboard', error: error.message });
  }
});

/**
 * POST /api/gamification/award-badge
 * Award badge to user (Admin only, or automatic)
 */
router.post('/award-badge', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    // Check if badge already awarded
    const existing = await UserBadge.findOne({ userId, badgeId });
    if (existing) {
      return res.status(400).json({ message: 'Badge already awarded' });
    }

    const userBadge = new UserBadge({
      userId,
      badgeId,
    });

    await userBadge.save();

    res.status(201).json(userBadge);
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ message: 'Failed to award badge', error: error.message });
  }
});

/**
 * GET /api/gamification/certificates
 * Get certificates for current user
 */
router.get('/certificates', authenticate, async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id })
      .populate('issuedBy', 'name')
      .sort({ issuedAt: -1 });
    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
  }
});

/**
 * GET /api/gamification/certificate/:certificateId
 * Get a single certificate by its unique certificateId (public, for sharing/verification)
 */
router.get('/certificate/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('userId', 'name email')
      .populate('issuedBy', 'name');
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Failed to fetch certificate', error: error.message });
  }
});

/**
 * POST /api/gamification/award-certificate
 * Admin awards certificate to a moderator who has responded to 50+ queries
 */
router.post('/award-certificate', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { userId } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== 'Moderator') {
      return res.status(400).json({ message: 'User must be a moderator' });
    }

    // Count responses by this moderator
    const responseCount = await Response.countDocuments({ moderatorId: userId });
    if (responseCount < 50) {
      return res.status(400).json({
        message: `Moderator has only ${responseCount} responses. Minimum 50 required.`,
      });
    }

    // Check if already awarded
    const existing = await Certificate.findOne({ userId, type: 'ModeratorAppreciation' });
    if (existing) {
      return res.status(400).json({ message: 'Certificate already awarded to this moderator' });
    }

    const certificate = new Certificate({
      userId,
      type: 'ModeratorAppreciation',
      title: 'Certificate of Appreciation',
      description: `Awarded for outstanding contribution by responding to ${responseCount} student queries on the SDASP platform.`,
      responseCount,
      issuedBy: req.user._id,
      certificateId: crypto.randomBytes(16).toString('hex'),
    });

    await certificate.save();

    // Notify the moderator
    await new Notification({
      userId,
      type: 'Certificate',
      title: 'Certificate Awarded!',
      message: 'You have been awarded a Certificate of Appreciation for your outstanding contributions!',
    }).save();

    const populated = await Certificate.findById(certificate._id)
      .populate('userId', 'name email')
      .populate('issuedBy', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Award certificate error:', error);
    res.status(500).json({ message: 'Failed to award certificate', error: error.message });
  }
});

/**
 * GET /api/gamification/eligible-moderators
 * Get moderators eligible for certificate (50+ responses, not yet awarded)
 */
router.get('/eligible-moderators', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const moderators = await User.find({ role: 'Moderator' }).select('name email').lean();

    const eligibleList = [];
    for (const mod of moderators) {
      const responseCount = await Response.countDocuments({ moderatorId: mod._id });
      const hasCertificate = await Certificate.findOne({ userId: mod._id, type: 'ModeratorAppreciation' });
      eligibleList.push({
        ...mod,
        responseCount,
        eligible: responseCount >= 50,
        certificateAwarded: !!hasCertificate,
      });
    }

    res.json(eligibleList);
  } catch (error) {
    console.error('Get eligible moderators error:', error);
    res.status(500).json({ message: 'Failed to fetch eligible moderators', error: error.message });
  }
});

module.exports = router;
