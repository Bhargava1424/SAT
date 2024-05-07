const express = require('express');
const Student = require('../models/student');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;