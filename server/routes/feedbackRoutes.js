const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Create a new feedback
router.post('/', async (req, res) => {
  const { studentName, applicationNumber, date, feedback, reviewer } = req.body;

  console.log('Received payload:', req.body); // Debugging line

  try {
    const newFeedback = new Feedback({ studentName, applicationNumber, date, feedback, reviewer });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error); // Debugging line
    res.status(400).json({ error: error.message });
  }
});

// Get all feedbacks for a student
router.get('/:applicationNumber', async (req, res) => {
  const { applicationNumber } = req.params;

  try {
    const feedbacks = await Feedback.find({ applicationNumber });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;
