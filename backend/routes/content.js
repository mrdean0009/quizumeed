const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/content/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get content by filters
router.get('/', auth, async (req, res) => {
  try {
    const { category, subject, type } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (type) filter.type = type;

    const content = await Content.find(filter)
      .populate('createdBy', 'name')
      .select('-filePath'); // Don't expose file paths

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create text content (Admin only)
router.post('/text', adminAuth, async (req, res) => {
  try {
    const { title, content, category, subject, description } = req.body;
    
    const newContent = new Content({
      title,
      type: 'text',
      content,
      category,
      subject,
      description,
      createdBy: req.user._id
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload PDF content (Admin only)
router.post('/pdf', adminAuth, upload.single('pdfFile'), async (req, res) => {
  try {
    const { title, category, subject, description } = req.body;
    
    const newContent = new Content({
      title,
      type: 'pdf',
      filePath: req.file.path,
      category,
      subject,
      description,
      createdBy: req.user._id
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View content with watermark
router.get('/:id/view', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.type === 'text') {
      // Return text content with metadata
      res.json({
        _id: content._id,
        title: content.title,
        type: content.type,
        content: content.content,
        category: content.category,
        subject: content.subject,
        description: content.description,
        createdAt: content.createdAt
      });
    } else if (content.type === 'pdf') {
      // Generate token for PDF access
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: req.user._id, contentId: content._id }, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
      );
      
      // Return PDF metadata and file URL with token
      res.json({
        _id: content._id,
        title: content.title,
        type: content.type,
        pdfUrl: `${req.protocol}://${req.get('host')}/api/content/${content._id}/pdf/${token}`,
        category: content.category,
        subject: content.subject,
        description: content.description,
        createdAt: content.createdAt
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve PDF file with token in URL
router.get('/:id/pdf/:token', async (req, res) => {
  try {
    const { id, token } = req.params;
    
    // Verify token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const content = await Content.findById(id);
    if (!content || content.type !== 'pdf') {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const fs = require('fs');
    if (!fs.existsSync(content.filePath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + content.title + '.pdf"');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-cache');
    
    const absolutePath = path.resolve(content.filePath);
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('PDF serving error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Helper function to add text watermark
function addTextWatermark(content, userName, userId) {
  const watermark = `\n\n--- This content is licensed to ${userName} (ID: ${userId}) ---\n`;
  return content + watermark;
}

// Create sample content (for testing)
router.post('/create-sample', auth, async (req, res) => {
  try {
    const sampleContent = [
      {
        title: "SSC Reasoning - Basic Concepts",
        type: "text",
        content: `# SSC Reasoning - Basic Concepts

## Introduction to Logical Reasoning

Logical reasoning is a fundamental skill tested in SSC examinations. It involves the ability to think logically and solve problems systematically.

### Key Topics:

1. **Analogies**: Finding relationships between pairs of words or concepts
2. **Classification**: Identifying the odd one out from a group
3. **Series**: Completing number, letter, or figure series
4. **Coding-Decoding**: Understanding patterns in coded information
5. **Blood Relations**: Solving family relationship problems

### Practice Tips:

- Practice regularly with different types of questions
- Understand the underlying patterns
- Time management is crucial
- Learn shortcuts and tricks

### Sample Questions:

**Question 1**: If CODING is written as DPEJOH, how is FLOWER written?
Answer: GMPXFS (Each letter is shifted by +1 position)

**Question 2**: Find the odd one out: 3, 5, 7, 12, 13, 17, 19
Answer: 12 (Only even number among prime numbers)

Remember: Consistent practice leads to improvement!`,
        category: "SSC",
        subject: "Reasoning",
        description: "Basic concepts and practice questions for SSC Reasoning",
        createdBy: req.user._id
      },
      {
        title: "Bank English - Grammar Fundamentals",
        type: "text",
        content: `# Bank English - Grammar Fundamentals

## Essential Grammar Rules for Banking Exams

### 1. Subject-Verb Agreement
- Singular subjects take singular verbs
- Plural subjects take plural verbs
- Example: The book is on the table. / The books are on the table.

### 2. Tenses
- **Present Tense**: I write letters daily.
- **Past Tense**: I wrote a letter yesterday.
- **Future Tense**: I will write a letter tomorrow.

### 3. Articles (A, An, The)
- Use 'a' before consonant sounds
- Use 'an' before vowel sounds  
- Use 'the' for specific nouns

### 4. Prepositions
- **Time**: at, on, in
- **Place**: at, on, in, under, over
- **Direction**: to, from, towards

### 5. Common Errors to Avoid
- Double negatives
- Incorrect pronoun usage
- Misplaced modifiers
- Run-on sentences

### Practice Exercises:
1. Fill in the blanks with appropriate articles
2. Correct the grammatical errors
3. Choose the right preposition
4. Identify subject-verb agreement errors

Regular practice with these fundamentals will improve your English score significantly!`,
        category: "Bank",
        subject: "English", 
        description: "Grammar fundamentals for banking examinations",
        createdBy: req.user._id
      }
    ];

    await Content.insertMany(sampleContent);
    res.json({ message: `Created ${sampleContent.length} sample content items` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete content (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete file if it's a PDF
    if (content.type === 'pdf' && content.filePath) {
      const fs = require('fs');
      if (fs.existsSync(content.filePath)) {
        fs.unlinkSync(content.filePath);
      }
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
