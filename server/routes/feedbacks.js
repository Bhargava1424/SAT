const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Get all feedback
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get feedback for a specific student
router.get('/:applicationNumber', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ applicationNumber: req.params.applicationNumber });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit new feedback
router.post('/', async (req, res) => {
    const feedback = new Feedback(req.body);
    try {
        // Get the current session ID
        const currentSession = await getCurrentSession(req.body.sessionId); // Assuming you have a getCurrentSession helper
        if (!currentSession) {
            return res.status(400).json({ message: 'No active session found to associate feedback with.' });
        }
        feedback.sessionId = currentSession._id; // Associate feedback with the current session

        const newFeedback = await feedback.save();
        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update feedback by feedbackId
router.put('/:feedbackId', getFeedback, async (req, res) => {
    if (req.body.feedback != null) {
        res.feedback.feedback = req.body.feedback;
    }
    if (req.body.reviewer != null) { // Allow updating the reviewer
        res.feedback.reviewer = req.body.reviewer;
    }

    try {
        const updatedFeedback = await res.feedback.save();
        res.json(updatedFeedback);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete feedback by ID
router.delete('/:feedbackId', getFeedback, async (req, res) => { // Corrected parameter to feedbackId
    try {
        await res.feedback.remove();
        res.json({ message: 'Feedback deleted!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get feedback by ID using feedbackId
async function getFeedback(req, res, next) {
    let feedback;
    try {
        feedback = await Feedback.findOne({ feedbackId: req.params.feedbackId });
        if (feedback == null) {
            return res.status(404).json({ message: 'Cannot find feedback' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.feedback = feedback;
    next();
}

// Helper function to get the current session (you'll need to implement this)
async function getCurrentSession() {
    // Logic to get the current session based on date
}

module.exports = router;
