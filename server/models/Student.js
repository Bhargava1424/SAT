//models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfJoining: String,
  course: String,
  firstName: {
    type: String,
    required: true,
  },
  surName: {
    type: String,
    required: true,
  },
  batch: String,
  branch: {
    type: String,
    required: true,
  },
  studentStatus: String,
  // New fields:
  clusterID: {
    type: String,
  },
  setType: {
    type: String,
  },
  attendance: {
    type: Object,
    default: {}
  },
  assessmentResults: {
    type: Array,
    default: []
  },
  photo: {
    type: String, 
    default: null
  }
});

module.exports = mongoose.model('Student', studentSchema);