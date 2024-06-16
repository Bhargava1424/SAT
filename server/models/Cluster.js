const mongoose = require('mongoose');

const clusterSchema = new mongoose.Schema({
    clusterID: {
        type: String,
        required: true,
        unique: true
    },
    setA: {
        type: Number,
        required: true,
    },
    setB: {
        type: Number,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    batch: {
        type: String,
        required: true,
    },
    studentCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Cluster', clusterSchema);