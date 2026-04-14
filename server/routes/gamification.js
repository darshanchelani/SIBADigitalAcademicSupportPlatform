const express = require('express');
const { User, Badge, UserBadge, Leaderboard } = require('../models');
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

module.exports = router;
