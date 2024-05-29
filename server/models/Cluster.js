    const mongoose = require('mongoose');

    const clusterSchema = new mongoose.Schema({
        clusterID: {
            type: String,
            required: true,
            unique: true
        },
        setA: {
            type: Object,
            required: true
        },
        setB: {
            type: Object,
            required: true
        },
        clusterCount: {
            type: Number,
            required: true
        }
    });

    module.exports = mongoose.model('Cluster', clusterSchema);
