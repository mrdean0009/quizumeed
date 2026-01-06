const express = require('express');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get available quiz categories and subjects
router.get('/categories', async (req, res) => {
  try {
    const categories = await Question.distinct('category');
    const subjects = await Question.distinct('subject');
    res.json({ categories, subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start new quiz
router.post('/start', auth, async (req, res) => {
  try {
    const { category, subject } = req.body;
    
    let questionQuery;
    if (subject === 'all') {
      // For mixed quiz, get questions from all subjects in the category
      const Category = require('../models/Category');
      const categoryDoc = await Category.findById(category).populate('subjects');
      if (!categoryDoc || !categoryDoc.subjects.length) {
        return res.status(404).json({ message: 'No subjects found for this category' });
      }
      
      const subjectIds = categoryDoc.subjects.map(s => s._id);
      questionQuery = { subject: { $in: subjectIds } };
    } else {
      // For single subject quiz
      questionQuery = { subject };
    }
    
    // Check if questions exist
    const questionCount = await Question.countDocuments(questionQuery);
    if (questionCount === 0) {
      return res.status(404).json({ message: 'No questions found for this selection' });
    }
    
    const quiz = new Quiz({
      userId: req.user._id,
      category,
      subject: subject === 'all' ? 'mixed' : subject,
      currentLevel: 'easy'
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all questions for a quiz
router.get('/:quizId/questions', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz || quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let questionQuery;
    if (quiz.subject === 'mixed') {
      // For mixed quiz, get questions from all subjects in the category
      const Category = require('../models/Category');
      const categoryDoc = await Category.findById(quiz.category).populate('subjects');
      if (categoryDoc && categoryDoc.subjects.length) {
        const subjectIds = categoryDoc.subjects.map(s => s._id);
        questionQuery = { subject: { $in: subjectIds } };
      }
    } else {
      questionQuery = { subject: quiz.subject };
    }

    // Get 25 random questions
    const questions = await Question.aggregate([
      { $match: questionQuery },
      { $sample: { size: 25 } }
    ]);

    res.json({ quiz, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit complete quiz
router.post('/:quizId/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz || quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.isCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // Get all questions and calculate score
    const questionIds = Object.keys(answers);
    const questions = await Question.find({ _id: { $in: questionIds } });
    
    let correctAnswers = 0;
    questions.forEach(question => {
      const userAnswer = answers[question._id.toString()];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    // Save quiz result
    const QuizResult = require('../models/QuizResult');
    const result = new QuizResult({
      user: req.user._id,
      quiz: quiz._id,
      totalQuestions: questions.length,
      correctAnswers,
      timeTaken: 1800 - req.body.timeLeft || 1800,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        userAnswer: answer,
        isCorrect: questions.find(q => q._id.toString() === questionId)?.correctAnswer === answer
      }))
    });

    await result.save();

    // Mark quiz as completed
    quiz.isCompleted = true;
    quiz.completedAt = new Date();
    await quiz.save();

    res.json({ 
      score: correctAnswers,
      totalQuestions: questions.length,
      accuracy: Math.round((correctAnswers / questions.length) * 100),
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get next question for quiz
router.get('/:quizId/next-question', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz || quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.isCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // Get questions already answered
    const answeredQuestionIds = quiz.questions.map(q => q.questionId);
    
    // Find next question based on current level
    let questionQuery = {
      difficulty: quiz.currentLevel,
      _id: { $nin: answeredQuestionIds }
    };

    if (quiz.subject === 'mixed') {
      // For mixed quiz, get questions from all subjects in the category
      const Category = require('../models/Category');
      const categoryDoc = await Category.findById(quiz.category).populate('subjects');
      if (categoryDoc && categoryDoc.subjects.length) {
        const subjectIds = categoryDoc.subjects.map(s => s._id);
        questionQuery.subject = { $in: subjectIds };
      }
    } else {
      // For single subject quiz
      questionQuery.subject = quiz.subject;
    }

    const question = await Question.findOne(questionQuery).select('-correctAnswer');

    if (!question) {
      // No more questions at current level, try next level or complete
      if (quiz.questions.length === 0) {
        // No questions found at all for this category/subject/difficulty
        return res.status(404).json({ message: 'No questions found for this quiz configuration' });
      }
      
      const nextLevel = getNextLevel(quiz.currentLevel, quiz.questions);
      if (nextLevel) {
        quiz.currentLevel = nextLevel;
        await quiz.save();
        return res.json({ levelUp: true, newLevel: nextLevel, motivationalMessage: getMotivationalMessage(nextLevel) });
      } else {
        // Complete quiz
        await completeQuiz(quiz);
        return res.json({ quizCompleted: true, quiz });
      }
    }

    res.json({ question, currentLevel: quiz.currentLevel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit answer
router.post('/:quizId/answer', auth, async (req, res) => {
  try {
    const { questionId, userAnswer, timeSpent } = req.body;
    
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz || quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.findById(questionId);
    const isCorrect = question.correctAnswer === userAnswer;

    quiz.questions.push({
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      difficulty: quiz.currentLevel
    });

    quiz.totalDuration += timeSpent;
    if (isCorrect) quiz.score += getDifficultyPoints(quiz.currentLevel);

    await quiz.save();
    res.json({ isCorrect, correctAnswer: question.correctAnswer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz results
router.get('/:quizId/results', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('questions.questionId', 'question options correctAnswer');
    
    if (!quiz || quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getNextLevel(currentLevel, questions) {
  if (questions.length < 3) return null; // Need at least 3 questions to evaluate
  
  const recentQuestions = questions.slice(-5); // Last 5 questions
  const accuracy = recentQuestions.length > 0 ? 
    recentQuestions.filter(q => q.isCorrect).length / recentQuestions.length : 0;
  const avgTime = recentQuestions.length > 0 ?
    recentQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / recentQuestions.length : 0;

  if (currentLevel === 'easy' && accuracy >= 0.7 && avgTime <= 45 && questions.length >= 5) {
    return 'medium';
  } else if (currentLevel === 'medium' && accuracy >= 0.6 && avgTime <= 50 && questions.length >= 8) {
    return 'hard';
  }
  return null;
}

function getDifficultyPoints(difficulty) {
  const points = { easy: 1, medium: 2, hard: 3 };
  return points[difficulty] || 1;
}

function getMotivationalMessage(level) {
  const messages = {
    medium: "Great job! You've unlocked Medium level. Keep it up! 🚀",
    hard: "Excellent! You're now at Hard level. Show your expertise! 💪"
  };
  return messages[level] || "Keep going!";
}

async function completeQuiz(quiz) {
  const totalQuestions = quiz.questions.length;
  
  // Only complete if we have at least some questions answered
  if (totalQuestions === 0) {
    return;
  }
  
  const correctAnswers = quiz.questions.filter(q => q.isCorrect).length;
  
  quiz.accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  quiz.isCompleted = true;
  quiz.completedAt = new Date();
  
  await quiz.save();
  
  // Update user quiz history
  await User.findByIdAndUpdate(quiz.userId, {
    $push: {
      quizHistory: {
        quizId: quiz._id,
        score: quiz.score,
        accuracy: quiz.accuracy,
        duration: quiz.totalDuration,
        completedAt: quiz.completedAt
      }
    }
  });
}

module.exports = router;
