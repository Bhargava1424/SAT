//models/Teacher.js

const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gmail: { 
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  branch: {
    type: String,
  },
  teacherID: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ['admin', 'director', 'vice president', 'teacher', 'receptionist'],
    default: 'teacher',
  }
});

module.exports = mongoose.model('Teacher', teacherSchema);