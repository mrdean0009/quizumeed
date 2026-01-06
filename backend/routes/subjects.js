const express = require('express');
const Subject = require('../models/Subject');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().populate('category', 'name');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get subjects by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const category = await Category.findById(req.params.categoryId).populate('subjects');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category.subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create subject (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const subject = new Subject({ name, description, category });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update subject (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete subject (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
