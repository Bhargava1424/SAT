const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch'); // Import the Branch model
const MongoClient = require('mongodb').MongoClient;

// GET route to list all branches
router.get('/', async (req, res) => {
    try {
        // Create a MongoDB client
        const uri = process.env.MONGO_URI_ERP;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Connect to the MongoDB database
        await client.connect();
        console.log('Connected to MongoDB');

        // Access the "branches" collection
        const collection = client.db().collection('branches');

        // Fetch all branches from the database
        const branchesCollection = client.db().collection('branches');
        const branches = await branchesCollection.find().toArray();
        res.status(200).json(branches);
    
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ message: 'Error fetching branches', error: error.message });
    }
});

module.exports = router;
