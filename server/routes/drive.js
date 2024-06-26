// const router = require('express').Router();
// const upload = require('../middleware/uploadMiddleware');
// const { drive } = require('../config/googleConfig');
// const fs = require('fs');
// const path = require('path');

// router.post('/upload-to-drive', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   // Retrieve the application number from the request body
//   const applicationNumber = req.body.applicationNumber;
//   const filePath = path.join(__dirname, '..', req.file.path);

//   // Customize file name based on application number and file type
//   const fileMetadata = {
//     name: `${applicationNumber}.${req.file.originalname.split('.').pop()}`, 
//     // The `req.file.originalname.split('.').pop()` part gets the file extension (e.g., ".pdf", ".jpg", etc.) from the uploaded file.
//   };

//   const media = {
//     mimeType: req.file.mimetype,
//     body: fs.createReadStream(filePath)
//   };

//   try {
//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink' // Get both the file ID and web view link
//     });

//     fs.unlinkSync(filePath); // Delete file from server after upload

//     // Make the file publicly accessible
//     await drive.permissions.create({
//       fileId: file.data.id,
//       resource: {
//         role: 'reader',
//         type: 'anyone'
//       }
//     });

//     res.status(200).json({ fileId: file.data.id, webViewLink: file.data.webViewLink });
//   } catch (error) {
//     console.error('Failed to upload to Google Drive:', error);
//     res.status(500).send('Failed to upload to Google Drive');
//   }
// });

// module.exports = router;