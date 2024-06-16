const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: '../.env' });

console.log(process.env.MONGODB_URI);

const teacherRouter = require('./routes/teachers.js');
const studentRouter = require('./routes/students.js');
const clusterRouter = require('./routes/clusters.js');
const sessionRouter = require('./routes/sessions.js');
const feedbackRouter = require('./routes/feedbacks.js');
const ecaRouter = require('./routes/ecas.js');
const receptionistRouter = require('./routes/receptionist.js'); // New receptionist routes
const branchRouter = require('./routes/branches.js');
const driveRouter = require('./routes/drive.js');

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('Could not connect to MongoDB', error));

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Use the routers
app.use('/teachers', teacherRouter);
app.use('/students', studentRouter);
app.use('/clusters', clusterRouter);
app.use('/sessions', sessionRouter);
app.use('/feedbacks', feedbackRouter);
app.use('/eca', ecaRouter);
app.use('/receptionist', receptionistRouter); // New route for receptionist actions
app.use('/branches', branchRouter); 
app.use('/', driveRouter);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});