const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Session = require('../models/Session');

// Get all assessments
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
    try {
        const teacher = req.body.teacher;
        const sessionId = req.body.sessionId;
        const applicationNumber = req.body.applicationNumber;
        const assessmentData = req.body.assessment;

        // Use await to get teacher details
        const teacherDetails = await Teacher.findOne({ name: teacher });

        const assessment = new Assessment();
        assessment.assessment = assessmentData;
        assessment.applicationNumber = applicationNumber;
        assessment.sessionId = sessionId;
        assessment.date = new Date();
        assessment.assessedBy = teacher;
        assessment.branch = teacherDetails.branch;

        const newAssessment = await assessment.save();

        const currentSession = await Session.findById(sessionId);
        if (!currentSession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const student = await Student.findOne({ applicationNumber: applicationNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add assessment to student's assessment array
        studentAssessments = student.assessmentResults
        studentAssessments.push(newAssessment._id)
        student.assessmentResults = studentAssessments
        await student.save();

        // Add assessment to session's assessment array
        const currentSessionAssignments = currentSession.assessmentIds;
        currentSessionAssignments.push(newAssessment._id);
        currentSession.assessmentIds = currentSessionAssignments;
        // if all assessments are done, update session status to completed
        if (currentSession.assessmentIds.length === currentSession.students.length) {
            currentSession.status = 'completed';
        }
        await currentSession.save();

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
    if (req.body.reviewer != null) {
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
router.delete('/:assessmentId', getAssessment, async (req, res) => {
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
        assessment = await Assessment.findOne({ _id: req.params.assessmentId });
        if (assessment == null) {
            return res.status(404).json({ message: 'Cannot find assessment' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.assessment = assessment;
    next();
}

// Get assessment by application number and session ID
router.get('/:applicationNumber/:sessionId', async (req, res) => {
    try {
      const { applicationNumber, sessionId } = req.params;
      const assessment = await Assessment.findOne({ applicationNumber, sessionId });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      res.json(assessment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


// Update assessment by assessmentId
router.put('/:assessmentId', async (req, res) => {
    try {
      const assessment = await Assessment.findById(req.params.assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
  
      assessment.assessment = req.body.assessment;
      assessment.date = new Date();
  
      const updatedAssessment = await assessment.save();
      res.json(updatedAssessment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

module.exports = router;
