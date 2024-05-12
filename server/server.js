const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes'); // Import the teacher routes
const driveRoutes = require('./routes/driveRoutes'); // Import the drive routes
const branchRoutes = require('./routes/branchRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes); // Use the teacher routes
app.use('/drive', driveRoutes); // Use the drive routes for Google Drive interactions
app.use('/branches', branchRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
