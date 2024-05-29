const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const driveRoutes = require('./routes/driveRoutes');
const branchRoutes = require('./routes/branchRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import the feedback routes
const ecaRoutes = require('./routes/ecaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/drive', driveRoutes);
app.use('/branches', branchRoutes);
app.use('/feedbacks', feedbackRoutes); // Use the feedback routes
app.use('/eca', ecaRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
