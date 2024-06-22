//models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        required: true,
        unique: true,
    },
    dateOfJoining: String,
    course: String,
    firstName: {
        type: String,
        required: true,
    },
    surName: {
        type: String,
        required: true,
    },
    batch: String,
    branch: {
        type: String,
        required: true,
    },
    studentStatus: String,
    // New fields:
    clusterID: {
        type: String,
        required: true
    },
    setType: {
        type: String,
        required: true
    },
    attendance: {
        type: Object,
        default: {}
    },
    assessmentResults: {
        type: Array,
        default: []
    },
    photo: {
        type: String, // This will store the Google Drive link
        default: null
    }
});

module.exports = mongoose.model('Student', studentSchema);
