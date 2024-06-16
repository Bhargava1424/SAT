const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt');

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific teacher by ID
router.get('/:id', getTeacher, (req, res) => {
  res.json(res.teacher);
});

// Create a new teacher
router.post('/', async (req, res) => {
  try {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const teacher = new Teacher({
      name: req.body.name,
      email: req.body.email,
      gmail: req.body.gmail, // Store the provided Gmail
      password: req.body.password, 
      phoneNumber: req.body.phoneNumber,
      branch: req.body.branch,
      teacherID: req.body.teacherID,
      role: req.body.role,
    });
    const newTeacher = await teacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a teacher by ID
router.patch('/:id', getTeacher, async (req, res) => {
  if (req.body.name != null) {
    res.teacher.name = req.body.name;
  }
  // ... update other fields similarly ...

  try {
    const updatedTeacher = await res.teacher.save();
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a teacher by ID
router.delete('/:id', getTeacher, async (req, res) => {
  try {
    await res.teacher.deleteOne()
    res.json({ message: 'Teacher deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to find a teacher by ID
async function getTeacher(req, res, next) {
  let teacher
  try {
    teacher = await Teacher.findById(req.params.id);
    if (teacher == null) {
      return res.status(404).json({ message: 'Cannot find teacher' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.teacher = teacher;
  next();
}


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = password === teacher.password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // You might want to generate a JWT here for better security 

    res.json({ teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Director's Gmail by Branch
router.get('/director-gmail/:branch', async (req, res) => {
  try {
    const director = await Teacher.findOne({ 
      role: 'director', 
      branch: req.params.branch 
    });

    if (!director) {
      return res.status(404).json({ error: 'Director not found for this branch' });
    }

    res.json({ gmail: director.gmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;