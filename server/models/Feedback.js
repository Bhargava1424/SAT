const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FeedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, default: uuidv4 }, // Use UUID for feedbackId
  studentName: { type: String, required: true },
  applicationNumber: { type: String, required: true }, // Not unique
  date: { type: Date, required: true, default: Date.now }, // Includes time
  feedback: { type: String, required: true },
  reviewer: { type: String, required: true }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
