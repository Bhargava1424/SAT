const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const multer = require('multer');
const upload = multer(); // Use multer to handle file uploads
const XLSX = require('xlsx');

router.post('/attendance', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0];
        const requiredHeaders = ['Application Number', 'Student Name', 'FN/Total', 'AN/Total'];

        // Validate headers
        for (let header of requiredHeaders) {
            if (!headers.includes(header)) {
                return res.status(400).json({ message: 'Excel file has missing fields, please check.' });
            }
        }

        const attendanceData = jsonData.slice(1).map(row => {
            const [applicationNumber, studentName, fnTotal, anTotal] = row;
            const fnGrade = calculateGrade(fnTotal);
            const anGrade = calculateGrade(anTotal);
            return { applicationNumber, studentName, fnTotal, anTotal, fnGrade, anGrade };
        });

        // Update attendance for each student in the database
        for (const data of attendanceData) {
            const student = await Student.findOne({ applicationNumber: data.applicationNumber });
            if (student) {
                // Assuming you want to store attendance in a specific format
                // You might need to adjust this logic based on your needs
                student.attendance[currentSessionPeriod] = {
                    fn: data.fnTotal,
                    an: data.anTotal,
                    fnGrade: data.fnGrade, // Store calculated grades
                    anGrade: data.anGrade
                };
                await student.save();
            }
        }

        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Error processing attendance:', error);
        res.status(500).json({ message: 'Failed to process attendance' });
    }
});

// Helper function to calculate grade (you'll need to define the logic)
function calculateGrade(attendance) {
    // Implement your grade calculation logic here
    // For example:
    const [present, total] = attendance.split('/');
    const percentage = (present / total) * 100;
    if (percentage >= 90) return 'A';
    // ... other conditions ...
    else return 'F';
}

// Helper function to get the current session period (you'll need to implement this)
function currentSessionPeriod() {
    // Logic to get the current session period based on date
}

module.exports = router;
