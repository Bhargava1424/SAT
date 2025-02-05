//routes/cluster.js
const express = require('express');
const router = express.Router();
const Cluster = require('../models/Cluster');
const Student = require('../models/Student');

// Get all clusters
router.get('/', async (req, res) => {
    try {
        // Optional: Filter clusters by branch if branch query parameter is present
        if (req.query.branch) {
            const clusters = await Cluster.find({ branch: req.query.branch });
            return res.json(clusters);
        }

        const clusters = await Cluster.find();
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific cluster by ID
router.get('/:id', getCluster, (req, res) => {
    res.json(res.cluster);
});

// Create a new cluster
router.post('/', async (req, res) => {
    const cluster = new Cluster(req.body);

    try {
        const newCluster = await cluster.save();
        res.status(201).json(newCluster);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a cluster by ID
router.patch('/:id', getCluster, async (req, res) => {
    // Update cluster fields (clusterID, setA, setB, branch)
    try {
        const updatedCluster = await res.cluster.save();
        res.json(updatedCluster);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a cluster by ID
router.delete('/:id', getCluster, async (req, res) => {
    try {
        // Find all students associated with this cluster
        const students = await Student.find({ cluster: req.params.id });

        // Remove the cluster reference from the students and decrement studentCount
        for (const student of students) {
            student.cluster = undefined;
            const studentCluster = await Cluster.findOne({ clusterID: req.params.id });
            if (studentCluster) {
                studentCluster.studentCount--;
                await studentCluster.save();
            }
            await student.save();
        }

        // Delete the cluster
        await res.cluster.deleteOne();

        res.json({ message: 'Cluster deleted!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware function to get a cluster by ID
async function getCluster(req, res, next) {
    let cluster;
    try {
        cluster = await Cluster.findById(req.params.id);
        if (cluster == null) {
            return res.status(404).json({ message: 'Cannot find cluster' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.cluster = cluster;
    next();
}

module.exports = router;
