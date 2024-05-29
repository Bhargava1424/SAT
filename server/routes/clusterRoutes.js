const express = require('express');
const router = express.Router();
const Cluster = require('../models/Cluster');

// Get all clusters
router.get('/', async (req, res) => {
    try {
        const clusters = await Cluster.find();
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific cluster
router.get('/:id', getCluster, (req, res) => {
    res.json(res.cluster);
});

// Create a new cluster
router.post('/', async (req, res) => {
    const cluster = new Cluster({
        clusterID: req.body.clusterID,
        setA: req.body.setA,
        setB: req.body.setB,
        clusterCount: req.body.clusterCount
    });

    try {
        const newCluster = await cluster.save();
        res.status(201).json(newCluster);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a cluster
router.patch('/:id', getCluster, async (req, res) => {
    if (req.body.clusterID != null) {
        res.cluster.clusterID = req.body.clusterID;
    }
    if (req.body.setA != null) {
        res.cluster.setA = req.body.setA;
    }
    if (req.body.setB != null) {
        res.cluster.setB = req.body.setB;
    }
    if (req.body.clusterCount != null) {
        res.cluster.clusterCount = req.body.clusterCount;
    }

    try {
        const updatedCluster = await res.cluster.save();
        res.json(updatedCluster);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a cluster
router.delete('/:id', getCluster, async (req, res) => {
    try {
        await res.cluster.remove();
        res.json({ message: 'Deleted Cluster' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

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
