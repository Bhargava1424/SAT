// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { addDays, format, isSameDay, nextMonday } = require('date-fns');
const Cluster = require('../models/Cluster');
const Student = require('../models/Student');
const {createClusters} = require('../utils/services'); 

// Function to generate sessions for one year
const generateSessionsForOneYear = (startDate, sessionEndDate, branch, batch, lecturers) => {
  const sessions = [];

  // Create clusters for this branch and batch based on lecturers 
  createClusters(branch, batch, lecturers.length);

  let currentDate = nextMonday(startDate); 
  let clusterIndex = 0; // Initialize cluster index

  while (currentDate <= sessionEndDate) {
    const clusterType = `Cluster ${clusterIndex + 1}`; // Calculate cluster type based on cluster index

    for (let i = 0; i < lecturers.length; i++) { // Iterate over lecturers
      const lecturer = lecturers[i]; // Assign lecturer to session

      const session = {
        clusterID: `${clusterType}-${branch}-${batch}`,
        period: `${format(currentDate, 'MMM d, yyyy')} - ${format(addDays(currentDate, 13), 'MMM d, yyyy')}`,
        startDate: new Date(currentDate),
        sessionEndDate: sessionEndDate,
        branch: branch,
        batch: batch,
        clusterType: clusterType,
        lecturer: lecturer, // Assign lecturer to the session
        status: 'pending',
      };
      sessions.push(session);
    }

    currentDate = addDays(currentDate, 14); // Increment current date by 14 days
    clusterIndex = (clusterIndex + 1) % lecturers.length; // Update cluster index in a cyclic manner
  }
  return sessions;
};

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

// Function to reassign sessions
router.post('/reassign', async (req, res) => {
  try {
    const { branch, batch, lecturers } = req.body; 
    if (!branch || !batch || !lecturers) {
      return res.status(400).json({ message: 'Branch, batch, and lecturers are required' });
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
    const sessions = generateSessionsForOneYear(startDate, branch, sessionEndDate, batch, lecturers);
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