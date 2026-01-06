const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Question = require('../models/Question');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get questions by filters
router.get('/', auth, async (req, res) => {
  try {
    const { category, subject, difficulty, limit } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;

    let query = Question.find(filter).populate('category', 'name').populate('subject', 'name');
    
    // For admin, return all questions with correct answers
    if (req.user.role === 'admin') {
      if (limit) query = query.limit(parseInt(limit));
    } else {
      // For regular users, limit and hide correct answers
      query = query.limit(parseInt(limit || 10)).select('-correctAnswer');
    }

    const questions = await query.sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create question (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { question, options, correctAnswer, difficulty, category, subject, timeLimit } = req.body;
    
    // Validation
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must match one of the options' });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      difficulty,
      category,
      subject,
      timeLimit,
      createdBy: req.user._id
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload questions via CSV (Admin only)
router.post('/bulk-upload', adminAuth, upload.single('csvFile'), async (req, res) => {
  try {
    const questions = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
          
          if (!options.includes(row.correctAnswer)) {
            errors.push(`Row ${questions.length + 1}: Correct answer doesn't match options`);
            return;
          }

          questions.push({
            question: row.question,
            options,
            correctAnswer: row.correctAnswer,
            difficulty: row.difficulty,
            category: row.category,
            subject: row.subject,
            timeLimit: parseInt(row.timeLimit) || 60,
            createdBy: req.user._id
          });
        } catch (error) {
          errors.push(`Row ${questions.length + 1}: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (questions.length > 0) {
            await Question.insertMany(questions);
          }
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.json({
            message: `${questions.length} questions uploaded successfully`,
            errors: errors.length > 0 ? errors : undefined
          });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get question for quiz (with correct answer for validation)
router.get('/:id/answer', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ correctAnswer: question.correctAnswer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question (Admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete question (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
