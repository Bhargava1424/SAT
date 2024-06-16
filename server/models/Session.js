const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    period: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
        required: true
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
    }],
    clusterAssignmentOrder: {
        type: Array, // Store the cluster assignment order for the session
        default: ['A', 'B', 'C']
    }
});

module.exports = mongoose.model('Session', sessionSchema);
