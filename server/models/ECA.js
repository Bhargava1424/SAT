const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ecaSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  applicationNumber: { // Assuming applicationNumber is part of ECAs
    type: String,
    required: true,
  },
  communicationRating: {
    type: Number,
    min: 1,
    max: 10,
  },
  participationRatings: {
    indoorSports: {
      type: Number,
      min: 1,
      max: 10,
    },
    outdoorSports: {
      type: Number,
      min: 1,
      max: 10,
    },
    music: {
      type: Number,
      min: 1,
      max: 10,
    },
    artLiterature: {
      type: Number,
      min: 1,
      max: 10,
    },
    leadershipTeamwork: {
      type: Number,
      min: 1,
      max: 10,
    },
    debatesActivities: {
      type: Number,
      min: 1,
      max: 10,
    },
  },
  parentFeedback: {
    type: String,
    maxLength: 50, // Limiting to 50 characters
  },
  date: {
    type: Date,
    default: Date.now,
  },
  uuid: {
    type: String,
    default: uuidv4, // Use uuid v4 for generating unique IDs
    unique: true,
  },
});

module.exports = mongoose.model('ECA', ecaSchema);