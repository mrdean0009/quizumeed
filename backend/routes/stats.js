const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Content = require('../models/Content');
const QuizResult = require('../models/QuizResult');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get user dashboard stats
router.get('/user-dashboard', auth, async (req, res) => {
  try {
    const userQuizzes = await QuizResult.find({ user: req.user._id });
    
    const totalQuizzes = userQuizzes.length;
    const bestScore = userQuizzes.length > 0 
      ? Math.max(...userQuizzes.map(q => Math.round((q.correctAnswers / q.totalQuestions) * 100)))
      : 0;
    const avgAccuracy = userQuizzes.length > 0
      ? Math.round(userQuizzes.reduce((sum, q) => sum + ((q.correctAnswers / q.totalQuestions) * 100), 0) / userQuizzes.length)
      : 0;
    const totalContent = await Content.countDocuments();

    res.json({
      totalQuizzes,
      bestScore,
      avgAccuracy,
      totalContent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin dashboard stats
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalContent, totalQuizzes] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Content.countDocuments(),
      QuizResult.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalQuestions,
      totalContent,
      totalQuizzes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const recentQuizzes = await QuizResult.find({ user: req.user._id })
      .populate('quiz', 'title category subject')
      .sort({ createdAt: -1 })
      .limit(5);

    const activity = recentQuizzes.map(result => ({
      date: result.createdAt,
      score: `${result.correctAnswers}/${result.totalQuestions}`,
      accuracy: `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}%`,
      duration: `${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60).toString().padStart(2, '0')}`,
      category: result.quiz?.category || 'N/A',
      subject: result.quiz?.subject || 'N/A'
    }));

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity (Admin only)
router.get('/admin-activity', auth, admin, async (req, res) => {
  try {
    const recentQuizzes = await QuizResult.find()
      .populate('user', 'name email')
      .populate('quiz', 'title category subject')
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentQuizzes.map(result => ({
      type: 'quiz',
      message: `${result.user?.name || 'User'} completed quiz: ${result.quiz?.title || 'Quiz'}`,
      score: `${result.correctAnswers}/${result.totalQuestions}`,
      time: result.createdAt
    }));

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
