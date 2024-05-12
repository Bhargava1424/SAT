const router = require('express').Router();
const upload = require('../middleware/uploadMiddleware');
const { drive } = require('../config/googleConfig');
const fs = require('fs');
const path = require('path');

router.post('/upload-to-drive', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // Retrieve the application number from the request body
    const applicationNumber = req.body.applicationNumber;
    const filePath = path.join(__dirname, '..', req.file.path);
    const fileMetadata = {
        name: `${applicationNumber}.pdf`, // Assuming the uploaded file is a PDF, change extension if necessary
    };
    const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath)
    };
    
    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        fs.unlinkSync(filePath); // delete file from server after upload
        res.status(200).json({ fileId: file.data.id });
    } catch (error) {
        console.error('Failed to upload to Google Drive:', error);
        res.status(500).send('Failed to upload to Google Drive');
    }
});

module.exports = router;
