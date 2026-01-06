const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'text'], required: true },
  category: { type: String, enum: ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC'], required: true },
  subject: { type: String, enum: ['Reasoning', 'Quant', 'English', 'GK', 'Computer'], required: true },
  content: String, // For text content
  filePath: String, // For PDF files
  description: String,
  relatedQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
