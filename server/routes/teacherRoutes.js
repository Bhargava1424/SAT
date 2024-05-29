// Routes
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher'); // Import the teacher model

// POST route to add a new teacher
router.post('/', async (req, res) => {
    try {
        const newTeacher = new Teacher(req.body);
        const savedTeacher = await newTeacher.save();
        res.status(201).json(savedTeacher);
    } catch (error) {
        console.error('Error adding teacher:', error);
        res.status(400).json({ message: 'Error adding teacher', error: error.message });
    }
});
// GET route to list all teachers
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Error fetching teachers', error: error.message });
    }
});

// GET route to list all admins
router.get('/admin', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        const admins = teachers.filter(teacher => teacher.role === 'admin');  
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
});

// POST route for login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email, password });
        if (teacher) {
            res.status(200).json({ message: 'Login successful', teacher });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch the Gmail of the director of a specific branch
router.get('/director-gmail/:branch', async (req, res) => {
    const branch = req.params.branch;
    console.log("Fetching director for branch:", branch); // Debug: Log the branch being searched
    try {
        // Use .select() correctly by specifying the field you want to retrieve
        const director = await Teacher.findOne({ branch: branch, role: 'director' })
                                      .select('gmail -_id'); // Only select the gmail field, exclude _id
        console.log("Director found:", director); // Debug: Log the fetched director

        if (director) {
            res.status(200).json({ gmail: director.gmail });
        } else {
            res.status(404).json({ message: 'No director found for this branch' });
        }
    } catch (error) {
        console.error('Error fetching director:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});





module.exports = router;
