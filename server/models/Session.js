const mongoose = require('mongoose');
const feedback = require('./Feedback');

const sessionSchema = new mongoose.Schema({
  clusterID: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  sessionEndDate: {
    type: Date,
    required: true
  },
  branch: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  clusterType: { 
    type: String,
    required: true
  },
  teacher: { 
    type: String,
    required: true
  },
  assessmentIds: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'upcoming'],
    default: 'pending'
  }
});


module.exports = mongoose.model('Session', sessionSchema);