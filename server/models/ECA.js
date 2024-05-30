const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ecaSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4 }, // Add UUID field
  studentName: { type: String, required: true },
  applicationNumber: { type: String, required: true, unique: true },
  communicationRating: { type: Number, required: true },
  participationRatings: {
    indoorSports: Number,
    outdoorSports: Number,
    music: Number,
    artLiterature: Number,
    leadershipTeamwork: Number,
    debatesActivities: Number
  },
  parentFeedback: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ECA = mongoose.model('ECA', ecaSchema);

module.exports = ECA;
