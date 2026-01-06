const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC'], required: true },
  subject: { type: String, enum: ['Reasoning', 'Quant', 'English', 'GK', 'Computer'], required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number,
    difficulty: String
  }],
  currentLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
