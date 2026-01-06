const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category: { type: String, enum: ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC'], required: true },
  subject: { type: String, enum: ['Reasoning', 'Quant', 'English', 'GK', 'Computer'], required: true },
  timeLimit: { type: Number, default: 60 }, // seconds
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Validation to ensure correct answer matches one of the options
questionSchema.pre('save', function(next) {
  if (!this.options.includes(this.correctAnswer)) {
    return next(new Error('Correct answer must match one of the options'));
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);
