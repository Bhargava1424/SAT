const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

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

// Create a new session (usually for a new 2-week period)
router.post('/', async (req, res) => {
  const session = new Session(req.body);

  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a session - to change teacher assignments, mark completion, etc.
router.patch('/:id', getSession, async (req, res) => {
  // Update session fields (e.g., teachers, status)

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