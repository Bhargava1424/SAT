const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  period: {
    type: String, 
    required: true, 
    unique: true 
  },
  teachers: [{
    teacherID: {
      type: String, 
      ref: 'Teacher'
    },
    status: {
      type: String,
      enum: ['pending', 'complete', 'incomplete'],
      default: 'pending'
    },
    clusterID: {
      type: String, 
      ref: 'Cluster'
    }
  }]
});

module.exports = mongoose.model('Session', sessionSchema);