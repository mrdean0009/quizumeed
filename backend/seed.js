const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
require('dotenv').config();

const sampleQuestions = [
  // SSC Reasoning Questions
  {
    question: "If CODING is written as DPEJOH, how is FLOWER written?",
    options: ["GMPXFS", "GMPXFR", "GMPWFS", "GMPWFR"],
    correctAnswer: "GMPXFS",
    difficulty: "easy",
    category: "SSC",
    subject: "Reasoning",
    timeLimit: 60
  },
  {
    question: "Find the odd one out: 3, 5, 7, 12, 13, 17, 19",
    options: ["3", "5", "12", "17"],
    correctAnswer: "12",
    difficulty: "easy",
    category: "SSC",
    subject: "Reasoning",
    timeLimit: 45
  },
  {
    question: "In a certain code, CHAIR is written as FKDLU. How is TABLE written?",
    options: ["WDEOH", "WDCOH", "WDEOI", "WDCOI"],
    correctAnswer: "WDEOH",
    difficulty: "medium",
    category: "SSC",
    subject: "Reasoning",
    timeLimit: 90
  },
  
  // SSC Quant Questions
  {
    question: "What is 15% of 200?",
    options: ["25", "30", "35", "40"],
    correctAnswer: "30",
    difficulty: "easy",
    category: "SSC",
    subject: "Quant",
    timeLimit: 60
  },
  {
    question: "If the cost price of 10 articles is equal to selling price of 8 articles, find the profit percentage.",
    options: ["20%", "25%", "30%", "35%"],
    correctAnswer: "25%",
    difficulty: "medium",
    category: "SSC",
    subject: "Quant",
    timeLimit: 120
  },
  
  // Bank English Questions
  {
    question: "Choose the correct synonym for 'Abundant':",
    options: ["Scarce", "Plentiful", "Limited", "Rare"],
    correctAnswer: "Plentiful",
    difficulty: "easy",
    category: "Bank",
    subject: "English",
    timeLimit: 45
  },
  {
    question: "Fill in the blank: The meeting has been _____ due to unforeseen circumstances.",
    options: ["postponed", "preponed", "advanced", "delayed"],
    correctAnswer: "postponed",
    difficulty: "medium",
    category: "Bank",
    subject: "English",
    timeLimit: 60
  },
  
  // General Knowledge
  {
    question: "Who is the current President of India (as of 2024)?",
    options: ["Ram Nath Kovind", "Droupadi Murmu", "Pranab Mukherjee", "A.P.J. Abdul Kalam"],
    correctAnswer: "Droupadi Murmu",
    difficulty: "easy",
    category: "SSC",
    subject: "GK",
    timeLimit: 30
  },
  {
    question: "Which is the longest river in India?",
    options: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"],
    correctAnswer: "Ganga",
    difficulty: "easy",
    category: "SSC",
    subject: "GK",
    timeLimit: 30
  },
  
  // Computer Questions
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
    correctAnswer: "Central Processing Unit",
    difficulty: "easy",
    category: "Bank",
    subject: "Computer",
    timeLimit: 30
  }
];

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizumeed');
    console.log('Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Admin',
        email: 'admin@quizumeed.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Add sample questions
    const questionsWithCreator = sampleQuestions.map(q => ({
      ...q,
      createdBy: adminUser._id
    }));

    await Question.insertMany(questionsWithCreator);
    console.log(`Added ${questionsWithCreator.length} sample questions`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedQuestions();
