const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Teacher = require('../models/Teacher');
const Cluster = require('../models/Cluster');
const { addDays, format, isSameDay } = require('date-fns');

// Get all sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await Session.find().populate('teachers.teacherID');
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific session by ID
router.get('/:id', getSession, (req, res) => {
    res.json(res.session);
});

// Create a new session (for a new 2-week period)
router.post('/', async (req, res) => {
    const { startDate, clusterAssignmentOrder } = req.body;
    const period = `${format(startDate, 'MMM d, yyyy')} - ${format(addDays(startDate, 13), 'MMM d, yyyy')}`;

    const newSession = new Session({
        period,
        startDate: new Date(startDate), // Make sure startDate is a Date object
        clusterAssignmentOrder, // Assign the provided order
        teachers: [] // Initialize with an empty array
    });

    try {
        // Get all teachers and available clusters for each branch
        const teachersByBranch = await getTeachersByBranch();
        const clustersByBranch = await getClustersByBranch();

        for (const branch in teachersByBranch) {
            const teachers = teachersByBranch[branch];
            const clusters = clustersByBranch[branch];
            const numClusters = clusters.length;

            // Cycle through teachers and assign clusters
            let clusterIndex = 0;
            for (const teacher of teachers) {
                const assignedCluster = clusters[clusterIndex % numClusters];

                // Determine the subset (A or B) for assignment based on week
                const weekNumber = getWeekNumber(new Date(startDate)); // Calculate week number
                const subset = weekNumber % 2 === 0 ? 'setA' : 'setB'; // Even week: setA, Odd week: setB

                newSession.teachers.push({
                    teacherID: teacher._id,
                    clusterID: assignedCluster.clusterID,
                    subset: subset, // Assign the subset here
                });
                clusterIndex++;
            }
        }
        await newSession.save();
        res.status(201).json(newSession);
    } catch (err) {
        console.error("Error creating session:", err);
        res.status(400).json({ message: err.message });
    }
});

// Helper function to get week number
const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / (24 * 60 * 60 * 1000);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Helper functions to get teachers and clusters grouped by branch
const getTeachersByBranch = async () => {
    const teachers = await Teacher.find({ role: 'teacher' });
    const teachersByBranch = {};
    teachers.forEach(teacher => {
        if (!teachersByBranch[teacher.branch]) {
            teachersByBranch[teacher.branch] = [];
        }
        teachersByBranch[teacher.branch].push(teacher);
    });
    return teachersByBranch;
};

const getClustersByBranch = async () => {
    const clusters = await Cluster.find();
    const clustersByBranch = {};
    clusters.forEach(cluster => {
        if (!clustersByBranch[cluster.branch]) {
            clustersByBranch[cluster.branch] = [];
        }
        clustersByBranch[cluster.branch].push(cluster);
    });
    return clustersByBranch;
};


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

// Get the current session
router.get('/current', async (req, res) => {
    try {
        const today = new Date();
        const currentSession = await Session.findOne({
            startDate: { $lte: today },
            $expr: { $gt: [addDays(new Date("$startDate"), 13), today] }
        }).populate('teachers.teacherID');

        if (!currentSession) {
            return res.status(404).json({ message: 'No active session found for the current date.' });
        }
        res.json(currentSession);
    } catch (err) {
        console.error("Error getting current session:", err);
        res.status(500).json({ message: err.message });
    }
});


// Get sessions for a specific teacher based on their ID
router.get('/teacher/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const today = new Date();

    try {
        const sessions = await Session.find({ 'teachers.teacherID': teacherID })
            .populate('teachers.teacherID') // Populate the teacher details
            .populate('teachers.clusterID')
            .sort({ startDate: 1 }); // Sort sessions by startDate

        const pendingSessions = sessions.filter(session => {
            return session.teachers.some(t => t.teacherID.toString() === teacherID && t.status === 'pending');
        });

        const completedSessions = sessions.filter(session => {
            return session.teachers.some(t => t.teacherID.toString() === teacherID && t.status === 'complete');
        });

        const upcomingSessions = sessions.filter(session => {
            return new Date(session.startDate) > today &&
                   session.teachers.some(t => t.teacherID.toString() === teacherID);
        });

        res.json({ pendingSessions, completedSessions, upcomingSessions });
    } catch (err) {
        console.error(`Error fetching sessions for teacher ${teacherID}:`, err);
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
