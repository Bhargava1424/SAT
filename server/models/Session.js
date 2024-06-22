const mongoose = require('mongoose');

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
  lecturer: { 
    type: mongoose.Schema.Types.ObjectId, // Reference to the Teacher model
    ref: 'Teacher',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'complete', 'incomplete'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Session', sessionSchema);