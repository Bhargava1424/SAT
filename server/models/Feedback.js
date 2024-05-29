const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  applicationNumber: { type: String, required: true, unique: true }, // Ensure unique constraint
  date: { type: String, required: true },
  feedback: { type: String, required: true },
  reviewer: { type: String, required: true }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
