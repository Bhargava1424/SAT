const mongoose = require('mongoose');
const { Teacher } = require('./Teacher');

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
  status: {
    type: String,
    enum: ['pending', 'complete', 'incomplete'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Session', sessionSchema);