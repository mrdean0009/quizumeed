const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/questions');
const contentRoutes = require('./routes/content');
const leaderboardRoutes = require('./routes/leaderboard');
const categoryRoutes = require('./routes/categories');
const subjectRoutes = require('./routes/subjects');
const statsRoutes = require('./routes/stats');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/stats', statsRoutes);

// Seed endpoint for development
app.post('/api/seed', async (req, res) => {
  try {
    const Question = require('./models/Question');
    const User = require('./models/User');
    
    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);;
      adminUser = new User({
        name: 'Admin',
        email: 'admin@quizumeed.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();
    }

    const sampleQuestions = [
      {
        question: "If CODING is written as DPEJOH, how is FLOWER written?",
        options: ["GMPXFS", "GMPXFR", "GMPWFS", "GMPWFR"],
        correctAnswer: "GMPXFS",
        difficulty: "easy",
        category: "SSC",
        subject: "Reasoning",
        timeLimit: 60,
        createdBy: adminUser._id
      },
      {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        correctAnswer: "30",
        difficulty: "easy",
        category: "SSC",
        subject: "Quant",
        timeLimit: 60,
        createdBy: adminUser._id
      },
      {
        question: "Choose the correct synonym for 'Abundant':",
        options: ["Scarce", "Plentiful", "Limited", "Rare"],
        correctAnswer: "Plentiful",
        difficulty: "easy",
        category: "Bank",
        subject: "English",
        timeLimit: 45,
        createdBy: adminUser._id
      },
      {
        question: "Who is the current President of India?",
        options: ["Ram Nath Kovind", "Droupadi Murmu", "Pranab Mukherjee", "A.P.J. Abdul Kalam"],
        correctAnswer: "Droupadi Murmu",
        difficulty: "easy",
        category: "SSC",
        subject: "GK",
        timeLimit: 30,
        createdBy: adminUser._id
      },
      {
        question: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
        correctAnswer: "Central Processing Unit",
        difficulty: "easy",
        category: "Bank",
        subject: "Computer",
        timeLimit: 30,
        createdBy: adminUser._id
      }
    ];

    await Question.deleteMany({});
    await Question.insertMany(sampleQuestions);
    
    res.json({ message: `Added ${sampleQuestions.length} sample questions successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizumeed')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
