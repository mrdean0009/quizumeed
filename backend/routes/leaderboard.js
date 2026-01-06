const express = require('express');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const { category, subject, timeframe = 'all' } = req.query;
    
    // Build match criteria for aggregation
    const matchCriteria = { isCompleted: true };
    if (category) matchCriteria.category = category;
    if (subject) matchCriteria.subject = subject;
    
    // Add time filter
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchCriteria.completedAt = { $gte: weekAgo };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchCriteria.completedAt = { $gte: monthAgo };
    }

    const leaderboard = await Quiz.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          avgAccuracy: { $avg: '$accuracy' },
          totalQuizzes: { $sum: 1 },
          bestScore: { $max: '$score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          totalScore: 1,
          avgAccuracy: { $round: ['$avgAccuracy', 2] },
          totalQuizzes: 1,
          bestScore: 1
        }
      },
      { $sort: { totalScore: -1, avgAccuracy: -1 } },
      { $limit: 50 }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user rank
router.get('/my-rank', auth, async (req, res) => {
  try {
    const { category, subject } = req.query;
    
    const matchCriteria = { isCompleted: true };
    if (category) matchCriteria.category = category;
    if (subject) matchCriteria.subject = subject;

    const userStats = await Quiz.aggregate([
      { $match: { ...matchCriteria, userId: req.user._id } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          avgAccuracy: { $avg: '$accuracy' },
          totalQuizzes: { $sum: 1 }
        }
      }
    ]);

    if (userStats.length === 0) {
      return res.json({ rank: null, message: 'No completed quizzes found' });
    }

    const userTotalScore = userStats[0].totalScore;
    
    // Count users with higher scores
    const higherScoreCount = await Quiz.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' }
        }
      },
      { $match: { totalScore: { $gt: userTotalScore } } },
      { $count: 'count' }
    ]);

    const rank = (higherScoreCount[0]?.count || 0) + 1;
    
    res.json({
      rank,
      stats: userStats[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
