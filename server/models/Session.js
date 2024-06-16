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
  subject: {
    type: String,
    required: true,
  },
  clusterType: { // New field to store the cluster type (A, B, C)
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'complete', 'incomplete'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Session', sessionSchema);