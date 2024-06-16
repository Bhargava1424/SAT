const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedbackSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    applicationNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    reviewer: {
        type: String,
        required: true
    },
    feedbackId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    // New field:
    sessionId: {
        type: String,
        ref: 'Session'
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
