const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const assessmentSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    assessment: {
        type: Object,
        required: true
    },
    assessmentId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    assessedBy: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    // New field:
    sessionId: {
        type: String,
        ref: 'Session',
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
