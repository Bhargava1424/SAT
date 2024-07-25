// server/routes/sessions.js

const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { addDays, format, isSameDay, nextMonday, previousMonday } = require('date-fns');
const Cluster = require('../models/Cluster');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const {createClusters} = require('../utils/services'); 
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const generateSessionsForOneYear = async (startDate, sessionEndDate, branch, batch, teachers, upcomingMonday) => {
  try {
    console.log(`Starting session generation for ${branch} - ${batch}`);
    console.log(`Start Date: ${startDate}, End Date: ${sessionEndDate}`);
    console.log(`Number of teachers: ${teachers.length}`);

    await createClusters(branch, batch, teachers.length);
    const clusters = await Cluster.find({ branch, batch });
    console.log(`Created ${clusters.length} clusters`);

    let currentDate = upcomingMonday ? nextMonday(startDate) : startDate.getDay() === 1 ? startDate : previousMonday(startDate);
    console.log(`First session start date: ${currentDate}`);

    let teacherIndex = 0;
    let clusterIndex = 0;
    const sessions = [];

    let loopCount = 0;
    while (currentDate <= sessionEndDate) {
      loopCount++;
      console.log(`Loop ${loopCount}: Current Date: ${currentDate}`);

      const periodStartDate = new Date(currentDate);
      const periodEndDate = addDays(currentDate, 13);
      console.log(`Period: ${format(periodStartDate, 'MMM d, yyyy')} - ${format(periodEndDate, 'MMM d, yyyy')}`);

      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[teacherIndex];
        const cluster = clusters[(clusterIndex + i) % clusters.length];

        sessions.push({
          clusterID: cluster.clusterID,
          period: `${format(periodStartDate, 'MMM d, yyyy')} - ${format(periodEndDate, 'MMM d, yyyy')}`,
          startDate: periodStartDate,
          endDate: periodEndDate,
          sessionEndDate: sessionEndDate,
          branch,
          batch,
          clusterType: cluster.clusterType,
          teacher: teacher.name,
          status: 'pending',
        });

        console.log(`Created session for teacher: ${teacher.name}, cluster: ${cluster.clusterID}`);

        teacherIndex = (teacherIndex + 1) % teachers.length;
      }

      clusterIndex = (clusterIndex + 1) % clusters.length;
      currentDate = addDays(currentDate, 14);
      console.log(`Next start date: ${currentDate}`);
    }

    console.log(`Loop ended. Total sessions generated: ${sessions.length}`);
    console.info(`Generated ${sessions.length} sessions for ${branch} - ${batch}`);
    return sessions;
  } catch (error) {
    console.error(`Error generating sessions: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    throw error;
  }
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

// Get sessions of teacher 
router.get('/teacher/:teacher', async (req, res) => {
  try {
    console.log(req.params.teacher);
    const teacher = req.params.teacher;
    const sessions = await Session.find({ teacher: teacher });
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
    const { branch, batch, teachers, upcomingMonday} = req.body; 
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
      sessionEndDate = existingSession.sessionEndDate;
    } else {
      sessionEndDate = addDays(new Date(), 365);
    }

    const deleteStartDate = (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  
      if (today.getDay() === 1) { // If today is Monday
          return today;
      } else {
          // Find the previous Monday
          const prevMonday = new Date(today);
          prevMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
          return prevMonday;
      }
    })();

    await Session.deleteMany({
      branch: branch,
      batch: batch,
      startDate: { $gte: deleteStartDate} 
    });

    const startDate = new Date();
    const sessions = await generateSessionsForOneYear(startDate, sessionEndDate, branch, batch, teachers, upcomingMonday);
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


// Route to get sessions by multiple IDs
router.post('/byIds', async (req, res) => {
  try {
    const { sessionIds } = req.body;
    if (!sessionIds || !sessionIds.length) {
      return res.status(400).json({ message: 'Session IDs are required' });
    }

    const objectIds = sessionIds.map((id) => new mongoose.Types.ObjectId(id));

    const sessions = await Session.find({
      _id: { $in: objectIds },
    });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;