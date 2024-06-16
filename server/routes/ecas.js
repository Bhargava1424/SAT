const express = require('express');
const router = express.Router();
const ECA = require('../models/ECA');
const { drive } = require('../config/googleConfig'); // Make sure googleConfig is set up
const fs = require('fs');
const path = require('path');

// Get all ECA entries
router.get('/', async (req, res) => {
    try {
        const ecas = await ECA.find();
        res.json(ecas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get ECA entries for a specific student by application number
router.get('/:applicationNumber', async (req, res) => {
    try {
        const ecas = await ECA.find({ applicationNumber: req.params.applicationNumber });
        res.json(ecas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit new ECA entry
router.post('/', async (req, res) => {
    const eca = new ECA(req.body);
    try {
        // Get the current session ID (assuming you have a getCurrentSession helper)
        const currentSession = await getCurrentSession();
        if (!currentSession) {
            return res.status(400).json({ message: 'No active session found to associate ECA entry with.' });
        }
        eca.sessionId = currentSession._id;

        const newECA = await eca.save();
        res.status(201).json(newECA);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update ECA entry by ID
router.patch('/:id', getECA, async (req, res) => {
    // Update ECA fields
    try {
        const updatedECA = await res.eca.save();
        res.json(updatedECA);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete ECA entry by ID
router.delete('/:id', getECA, async (req, res) => {
    try {
        await res.eca.remove();
        res.json({ message: 'ECA entry deleted!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get ECA entry by ID
async function getECA(req, res, next) {
    let eca;
    try {
        eca = await ECA.findById(req.params.id);
        if (eca == null) {
            return res.status(404).json({ message: 'Cannot find ECA entry' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.eca = eca;
    next();
}

// Helper function to get the current session (you'll need to implement this)
async function getCurrentSession() {
    // Logic to get the current session based on date
}

// Route for uploading photos to Google Drive
router.post('/upload-photo', async (req, res) => {
    const { applicationNumber, file } = req.body; // Assuming file is sent as base64

    if (!applicationNumber || !file) {
        return res.status(400).json({ message: 'Application number and file are required' });
    }

    try {
        // Convert base64 to buffer
        const buffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        const fileMetadata = {
            name: `${applicationNumber}.jpg`, // Assuming JPG format
            parents: ['your-google-drive-folder-id'] // Replace with your folder ID
        };
        const media = {
            mimeType: 'image/jpeg',
            body: buffer
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink' // Get the web view link
        });

        // Make the file publicly accessible
        await drive.permissions.create({
            fileId: file.data.id,
            resource: {
                role: 'reader',
                type: 'anyone'
            }
        });

        res.json({ googleDriveLink: file.data.webViewLink });
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        res.status(500).json({ message: 'Failed to upload to Google Drive' });
    }
});

module.exports = router;
