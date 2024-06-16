// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { addDays, format, isSameDay, nextMonday } = require('date-fns');
const Cluster = require('../models/Cluster'); // Import the Cluster model

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

// Helper function to generate sessions for two years (optimized)
const generateSessionsForTwoYears = async (startDate) => {
  const sessions = [];
  const subjectClusterMapping = {
    'Mathematics': ['A', 'B', 'C'],
    'Physics': ['B', 'C', 'A'],
    'Chemistry': ['C', 'A', 'B']
  };
  const clusters = await Cluster.find(); // Fetch all clusters once

  for (let week = 0; week < 104; week++) { // 104 weeks in two years
    for (const subject in subjectClusterMapping) {
      const clusterType = subjectClusterMapping[subject][(week % 6) / 2 | 0];

      // Find the corresponding cluster (optimized for cluster lookup)
      const cluster = clusters.find(c => 
        c.clusterType === clusterType &&
        c.branch === branch && 
        c.batch === batch
      );

      if (cluster) { // Only create the session if a cluster exists
        const currentDate = addDays(startDate, week * 7);
        const session = {
          clusterID: cluster.clusterID, // Directly assign the cluster ID
          period: `${format(currentDate, 'MMM d, yyyy')} - ${format(addDays(currentDate, 13), 'MMM d, yyyy')}`,
          startDate: currentDate,
          subject: subject,
          clusterType: clusterType
        };
        sessions.push(session);
      }
    }
  }
  return sessions;
};

// Create a new session (for a new 2-week period)
router.post('/', async (req, res) => {
  try {
    const startDate = new Date();
    const sessions = await generateSessionsForTwoYears(startDate);
    await Session.insertMany(sessions);
    res.status(201).json({ message: 'Sessions created for two years' });
  } catch (err) {
    console.error("Error creating sessions:", err);
    res.status(500).json({ message: err.message });
  }
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