const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const driveRoutes = require('./routes/driveRoutes');
const branchRoutes = require('./routes/branchRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const ecaRoutes = require('./routes/ecaRoutes');
const sessionRoutes = require('./routes/sessionRoutes'); // Import session routes
const clusterRoutes = require('./routes/clusterRoutes'); // Import cluster routes

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
app.use('/feedbacks', feedbackRoutes);
app.use('/eca', ecaRoutes);
app.use('/sessions', sessionRoutes); // Use session routes
app.use('/clusters', clusterRoutes); // Use cluster routes

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
