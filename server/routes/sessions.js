// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { addDays, format, isSameDay, nextMonday } = require('date-fns');
const Cluster = require('../models/Cluster');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const {createClusters} = require('../utils/services'); 
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Function to generate sessions for one year
const generateSessionsForOneYear = async (startDate, sessionEndDate, branch, batch, teachers) => {
  const sessions = [];

  // Create clusters for this branch and batch based on the number of teachers
  await createClusters(branch, batch, teachers.length);

  const clusters = await Cluster.find({ branch, batch });

  let currentDate = nextMonday(startDate);
  let teacherIndex = 0; // Initialize teacher index
  let clusterIndex = 0; // Initialize cluster index

  while (currentDate <= sessionEndDate) {
    const periodStartDate = new Date(currentDate);
    const periodEndDate = addDays(currentDate, 13);

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[teacherIndex]; // Assign teacher to session
      const cluster = clusters[(clusterIndex + i) % clusters.length]; // Assign different cluster to each teacher

      const session = {
        clusterID: cluster.clusterID,
        period: `${format(periodStartDate, 'MMM d, yyyy')} - ${format(periodEndDate, 'MMM d, yyyy')}`,
        startDate: periodStartDate,
        sessionEndDate: periodEndDate,
        branch: branch,
        batch: batch,
        clusterType: cluster.clusterType,
        teacher: teacher.name, // Convert teacher._id to ObjectId if needed
        status: 'pending',
      };
      sessions.push(session);

      teacherIndex = (teacherIndex + 1) % teachers.length; // Update teacher index in a cyclic manner
    }

    clusterIndex = (clusterIndex + 1) % clusters.length; // Update cluster index in a cyclic manner for each period
    currentDate = addDays(currentDate, 14); // Increment current date by 14 days
  }

  return sessions;
};


// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find();
    
    sessions.forEach(async (session) => {
      const assessment = await Assessment.find({ sessionId: session._id });
      session.assessment = assessment;
    });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific session by ID
router.get('/:id', getSession, (req, res) => {
  res.json(res.session);
});

// Get the current session
router.get('/current/:teacher', async (req, res) => {
  try {
    const today = new Date();
    const currentSession = await Session.findOne({
      teacher: req.params.teacher,
      startDate: { $lte: today },
      $expr: { $gt: [addDays(new Date("$startDate"), 13), today] }
    });

    if (!currentSession) {
      return res.status(404).json({ message: 'No active session found for the current date.' });
    }
    res.json(currentSession);
  } catch (err) {
    console.error("Error getting current session:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update a session
router.patch('/:id', getSession, async (req, res) => {
  // Update session fields (e.g., teachers, status)
  if (req.body.teachers) {
    res.session.teachers = req.body.teachers;
  }
  // ... other fields to update ...

  try {
    const updatedSession = await res.session.save();
    res.json(updatedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a session by ID
router.delete('/:id', getSession, async (req, res) => {
  try {
    await res.session.deleteOne();
    res.json({ message: 'Session deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a session by ID
async function getSession(req, res, next) {
  let session;
  try {
    session = await Session.findById(req.params.id);
    if (session == null) {
      return res.status(404).json({ message: 'Cannot find session' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.session = session;
  next();
}

// Function to reassign sessions
router.post('/reassign', async (req, res) => {
  try {
    const { branch, batch, teachers } = req.body; 
    console.log(teachers)
    if (!branch || !batch || !teachers) {
      return res.status(400).json({ message: 'Branch, batch, and teachers are required' });
    }

    // Delete existing sessions for the remainder of the year
    const existingSession = await Session.findOne({
      branch: branch,
      batch: batch,
      startDate: { $gte: new Date() } 
    });

    let sessionEndDate;
    if (existingSession) {
      sessionEndDate = existingSession.startDate;
    } else {
      sessionEndDate = addDays(new Date(), 365);
    }

    await Session.deleteMany({
      branch: branch,
      batch: batch,
      startDate: { $gte: new Date() } 
    });

    const startDate = new Date();
    const sessions = await generateSessionsForOneYear(startDate, sessionEndDate, branch, batch, teachers);
    await Session.insertMany(sessions);
    console.log('Sessions created for the remaining time in the year');
    res.status(200).json({ message: 'Sessions reassigned' });
  } catch (err) {
    console.error("Error reassigning sessions:", err);
    res.status(500).json({ message: err.message });
  }
});


// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific session by ID
router.get('/:id', getSession, (req, res) => {
  res.json(res.session);
});

// Get the current session
router.get('/current', async (req, res) => {
  try {
    const today = new Date();
    const currentSession = await Session.findOne({
      startDate: { $lte: today },
      $expr: { $gt: [addDays(new Date("$startDate"), 13), today] }
    });

    if (!currentSession) {
      return res.status(404).json({ message: 'No active session found for the current date.' });
    }
    res.json(currentSession);
  } catch (err) {
    console.error("Error getting current session:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update a session
router.patch('/:id', getSession, async (req, res) => {
  // Update session fields (e.g., teachers, status)
  if (req.body.teachers) {
    res.session.teachers = req.body.teachers;
  }
  // ... other fields to update ...

  try {
    const updatedSession = await res.session.save();
    res.json(updatedSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a session by ID
router.delete('/:id', getSession, async (req, res) => {
  try {
    await res.session.deleteOne();
    res.json({ message: 'Session deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a session by ID
async function getSession(req, res, next) {
  let session;
  try {
    session = await Session.findById(req.params.id);
    if (session == null) {
      return res.status(404).json({ message: 'Cannot find session' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.session = session;
  next();
}

module.exports = router;