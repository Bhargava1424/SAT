const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch'); // Import the Branch model

// GET route to list all branches
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find();
        res.status(200).json(branches);
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error fetching branches', error: error.message });
    }
});

module.exports = router;
