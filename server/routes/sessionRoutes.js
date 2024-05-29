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

// Get a specific session
router.get('/:id', getSession, (req, res) => {
    res.json(res.session);
});

// Create a new session
router.post('/', async (req, res) => {
    const session = new Session({
        period: req.body.period,
        teachers: req.body.teachers
    });

    try {
        const newSession = await session.save();
        res.status(201).json(newSession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a session
router.patch('/:id', getSession, async (req, res) => {
    if (req.body.period != null) {
        res.session.period = req.body.period;
    }
    if (req.body.teachers != null) {
        res.session.teachers = req.body.teachers;
    }

    try {
        const updatedSession = await res.session.save();
        res.json(updatedSession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a session
router.delete('/:id', getSession, async (req, res) => {
    try {
        await res.session.remove();
        res.json({ message: 'Deleted Session' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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
