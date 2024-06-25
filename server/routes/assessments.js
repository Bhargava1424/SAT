const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');

// Get all assessment
router.get('/', async (req, res) => {
    try {
        const assessments = await Assessment.find();
        res.json(assessments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get assessment for a specific student
router.get('/:applicationNumber', async (req, res) => {
    try {
        const assessments = await Assessment.find({ applicationNumber: req.params.applicationNumber });
        res.json(assessments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit new assessment
router.post('/', async (req, res) => {
    const assessment = new Assessment(req.body);
    try {
        // Get the current session ID
        const currentSession = await getCurrentSession(req.body.sessionId); // Assuming you have a getCurrentSession helper
        if (!currentSession) {
            return res.status(400).json({ message: 'No active session found to associate assessment with.' });
        }
        assessment.sessionId = currentSession._id; // Associate assessment with the current session

        student = await Student.find({ applicationNumber: req.body.applicationNumber });

        // adding assesment to student assesments array 
        assessmentResults = Student.assessmentResults;
        assessmentResults.push(assessment);
        
        Student.assessmentResults = assessmentResults;
        
        Student.save();
        
        const newAssessment = await assessment.save();
        res.status(201).json(newAssessment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update assessment by assessmentId
router.put('/:assessmentId', getAssessment, async (req, res) => {
    if (req.body.assessment != null) {
        res.assessment.assessment = req.body.assessment;
    }
    if (req.body.reviewer != null) { // Allow updating the reviewer
        res.assessment.reviewer = req.body.reviewer;
    }

    try {
        const updatedAssessment = await res.assessment.save();
        res.json(updatedAssessment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete assessment by ID
router.delete('/:assessmentId', getAssessment, async (req, res) => { // Corrected parameter to assessmentId
    try {
        await res.assessment.remove();
        res.json({ message: 'Assessment deleted!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get assessment by ID using assessmentId
async function getAssessment(req, res, next) {
    let assessment;
    try {
        assessment = await Assessment.findOne({ assessmentId: req.params.assessmentId });
        if (assessment == null) {
            return res.status(404).json({ message: 'Cannot find assessment' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.assessment = assessment;
    next();
}

// Helper function to get the current session (you'll need to implement this)
async function getCurrentSession() {
    // Logic to get the current session based on date
}

module.exports = router;
