const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// Create a new feedback
router.post('/', async (req, res) => {
  const { studentName, applicationNumber, date, feedback, reviewer } = req.body;

  try {
    const newFeedback = new Feedback({ studentName, applicationNumber, date, feedback, reviewer });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error); // Debugging line
    res.status(400).json({ error: error.message });
  }
});

// Get all feedbacks for a student by application number
router.get('/:applicationNumber', async (req, res) => {
  const { applicationNumber } = req.params;

  try {
    const feedbacks = await Feedback.find({ applicationNumber }).sort({ date: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific feedback by feedbackId
router.get('/feedback/:feedbackId', async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback by feedbackId
router.put('/:feedbackId', async (req, res) => {
  const { feedbackId } = req.params;
  console.log('debugging',feedbackId);
  const { feedback, reviewer } = req.body;

  try {
    // Find and update by custom feedbackId
    const updatedFeedback = await Feedback.findOneAndUpdate({ feedbackId }, { feedback, reviewer }, { new: true });

    if (!updatedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Error updating feedback: ' + error.message });
  }
});


module.exports = router;
