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

module.exports = router;
