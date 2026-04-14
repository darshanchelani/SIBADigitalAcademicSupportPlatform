const cron = require('node-cron');
const { User, Leaderboard, Quiz } = require('../models');

/**
 * Daily cron job to update leaderboard
 * Runs at midnight every day
 */
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 Updating leaderboard...');

    // Get all users sorted by points
    const users = await User.find({}).select('_id points').sort({ points: -1 }).limit(100);

    // Clear existing leaderboard
    await Leaderboard.deleteMany({});

    // Create new leaderboard entries
    if (users.length > 0) {
      const leaderboardEntries = users.map((user, index) => ({
        userId: user._id,
        rank: index + 1,
        score: user.points || 0,
      }));

      await Leaderboard.insertMany(leaderboardEntries);
      console.log(`✅ Leaderboard updated with ${leaderboardEntries.length} entries`);
    } else {
      console.log('⚠️  No users found for leaderboard');
    }
  } catch (error) {
    console.error('❌ Leaderboard update error:', error);
  }
});

console.log('✅ Cron jobs initialized');

/**
 * Every 5 minutes: deactivate expired quizzes
 */
cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await Quiz.updateMany(
      { isActive: true, expiresAt: { $lte: new Date() } },
      { $set: { isActive: false } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🕐 Deactivated ${result.modifiedCount} expired quiz(es)`);
    }
  } catch (error) {
    console.error('❌ Quiz expiry cron error:', error);
  }
});
