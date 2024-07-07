//routes/student.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Cluster = require('../models/Cluster');
const Session = require('../models/Session');
const Assessment = require('../models/Assessment');
const MongoClient = require('mongodb').MongoClient;
const Teacher = require('../models/Teacher');
const {fetchStudentsFromOtherDB, assignCluster, assignSet} = require('../utils/services')


// Get all students (This will now also populate the database)
router.get('/', async (req, res) => {
  try {
    // Fetch students from the other database (replace with your logic)
    const studentsFromOtherDB = await fetchStudentsFromOtherDB(); 

    // 1. Find existing students in this application's database
    const existingStudents = await Student.find();

    // 2. Identify new students (those not in this app's database)
    const newStudents = studentsFromOtherDB.filter(
      student => !existingStudents.some(
        existing => existing.applicationNumber === student.applicationNumber
      )
    );

    // 3. Assign Clusters to new students
    for (const newStudent of newStudents) { 
      const assignedCluster = await assignCluster(newStudent.branch, newStudent.batch);
      const setType = await assignSet(newStudent.branch, newStudent.batch, assignedCluster); 

      newStudent.clusterID = assignedCluster;
      newStudent.setType = setType;

      await new Student(newStudent).save(); // Save the new student with assigned cluster
    }

    // 5. Send all students from this app's database
    const allStudents = await Student.find();
    res.json(studentsFromOtherDB); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// // Function to fetch students from the other database (replace with your logic)
// async function fetchStudentsFromOtherDB() {
//   try {
//     // Create a MongoDB client
//     const uri = process.env.MONGO_URI_ERP;
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//     // Connect to the MongoDB server
//     await client.connect();
//     console.log('Connected to other database');

//     // Access the "students" collection
//     const studentsCollection = client.db().collection('students');

//     // Query the "students" collection
//     const students = await studentsCollection.find().toArray();
//     // console.log(students);

//     // Close the MongoDB connection
//     await client.close();

//     return students;
//   } catch (err) {
//     console.error('Error fetching students from other database:', err);
//     throw err;
//   }
// }


// // Function to assign a cluster to a student
// async function assignCluster(branch, batch) {
//   const clusters = await Cluster.find({ branch, batch });

//   // If no clusters exist, create them based on the number of lecturers
//   if (clusters.length === 0) {
//     return '' // Assign again after creating clusters
//   }

//   let leastStudents = Infinity;
//   let assignedCluster;
//   for (const cluster of clusters) {
//     const studentCount = await Student.countDocuments({ clusterID: cluster.clusterID });
//     if (studentCount < leastStudents) {
//       leastStudents = studentCount;
//       assignedCluster = cluster.clusterID;
//     }
//   }

//   await Cluster.updateOne({ clusterID: assignedCluster }, { $inc: { studentCount: 1 } });

//   return assignedCluster;
// }

// async function assignSet(branch, batch, assignedCluster) {
//   const cluster = await Cluster.findOne({ clusterID: assignedCluster });
//   if (!cluster) {
//     return ''; 
//   }

//   const setA = cluster.setA;
//   const setB = cluster.setB;

//   const assignedSet = setA <= setB ? 'A' : 'B';

//   await Cluster.updateOne({ clusterID: assignedCluster }, { [`set${assignedSet}`]:  cluster[`set${assignedSet}`] + 1 });

//   return assignedSet;
// }

// Get a specific student by ID
router.get('/:id', getStudent, (req, res) => {
  res.json(res.student);
});

// Create a new student
router.post('/', async (req, res) => {
  const student = new Student(req.body);
  try {
    // Find cluster with the lowest student count for the student's branch
    const cluster = await Cluster.findOne({ branch: student.branch }).sort({ studentCount: 1 });

    if (!cluster) {
      return res.status(500).json({ message: 'No available clusters in this branch' });
    }

    student.cluster = cluster.clusterID;
    cluster.studentCount++;
    await cluster.save();
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student by ID
router.patch('/:id', getStudent, async (req, res) => {
  const { googleDriveLink } = req.body;

  if (googleDriveLink) {
    res.student.photo = googleDriveLink; // Update the googleDriveLink field 
  }

  try {
    const updatedStudent = await res.student.save();
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a student by ID
router.delete('/:id', getStudent, async (req, res) => {
  try {
    await res.student.deleteOne();
    res.json({ message: 'Student deleted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get student count by branch
router.get('/count-by-branch/:branch', async (req, res) => {
  try {
    const count = await Student.countDocuments({ branch: req.params.branch });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Middleware function to get a student by ID
async function getStudent(req, res, next) {
  let student;
  try {
    student = await Student.findById(req.params.id);
    if (student == null) {
      return res.status(404).json({ message: 'Cannot find student' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.student = student;
  next();
}
// Get students by cluster ID
router.get('/cluster/:clusterID/session/:sessionID', async (req, res) => {
  try {
    const students = await Student.find({ clusterID: req.params.clusterID });

    // Get assessed students from the sessions 
    const assessments = await Assessment.find({ sessionId: req.params.sessionID });
    console.log('Assessments:', assessments);
    const assessedStudentApplicationNumbers = assessments.map(assessment => assessment.applicationNumber);
    console.log('Assessed Students:', assessedStudentApplicationNumbers);
    
    // Student who are assessed add completed beside their name in the list
    const studentsWithAssessmentStatus = students.map(student => {
      console.log('Student: checked');
      if (assessedStudentApplicationNumbers.includes(student.applicationNumber)) {
        
        const assessment = assessments.find(assessment => assessment.applicationNumber === student.applicationNumber);
        const completionDate = new Date(assessment.date);
        const formattedDate = completionDate.toDateString().substring(4);
        student.surName = student.surName + (' (Completed) - ' + formattedDate);
      }
      return student; // Return the modified student object
    });
    console.log('Students with Assessment Status:', studentsWithAssessmentStatus);
    res.json(studentsWithAssessmentStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pendingStudents/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    // Get the current date
    const currentDate = new Date();
    console.log('Current Date:', currentDate);
    
    // Query to get sessions for the teacher within the period
    const session = await Session.findOne({
      _id: sessionId,
    });

    if (!session) {
      return res.status(404).json({ message: 'No pending sessions found for this teacher.' });
    }

    // Get students who are part of this session's cluster
    const sessionStudents = await Student.find({ clusterID: session.clusterID });

    console.log(session._id);
    console.log(String(session._id));


    // Get assessments for this session
    const assessments = await Assessment.find({ sessionId: String(session._id) });
    console.log('Assessments:', assessments);

    // Extract application numbers of assessed students
    const assessedStudentApplicationNumbers = assessments.map(assessment => assessment.applicationNumber);
    console.log('Assessed Students:', assessedStudentApplicationNumbers);


    // Filter out assessed students from session students
    const pendingStudents = sessionStudents.filter(student => !assessedStudentApplicationNumbers.includes(student.applicationNumber));
    console.log('Pending Students:', pendingStudents);

    res.status(200).json(pendingStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/completedStudents/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    
    // Get the current date
    const currentDate = new Date();
    console.log('Current Date:', currentDate);
    
    // Query to get sessions for the teacher within the period
    const session = await Session.findOne({
      _id: sessionId,
    });

    if (!session) {
      return res.status(404).json({ message: 'No completed sessions found for this teacher.' });
    }

    // Get students who are part of this session's cluster
    const sessionStudents = await Student.find({ clusterID: session.clusterID });

    // Get assessments for this session
    const assessments = await Assessment.find({ sessionId: String(session._id) });

    // Extract application numbers of assessed students
    const assessedStudentApplicationNumbers = assessments.map(assessment => assessment.applicationNumber);

    // Filter out assessed students from session students
    const completedStudents = sessionStudents.filter(student => assessedStudentApplicationNumbers.includes(student.applicationNumber));

    console.log('Completed Students:', completedStudents);

    res.status(200).json(completedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/upcomingStudents/:teacherName', async (req, res) => {
  try {
    const teacherName = req.params.teacherName;

    // Get all upcoming sessions for the teacher
    const upcomingSessions = await Session.find({
      teacher: teacherName,
      startDate: { $gt: new Date() } // Sessions starting after current date
    }).sort({ startDate: 1 });

    if (upcomingSessions.length === 0) {
      return res.status(404).json({ message: 'No upcoming sessions found' });
    }

    // Get the first upcoming session
    const firstSession = upcomingSessions[0]; 

    // Find students in the session's cluster
    const upcomingStudents = await Student.find({ clusterID: firstSession.clusterID });

    res.json(upcomingStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific student by applicationNumber
router.get('/applicationNumber/:applicationNumber', async (req, res) => {
  try {
    const student = await Student.findOne({ applicationNumber: req.params.applicationNumber });
    if (!student) {
      return res.status(404).json({ message: 'Cannot find student' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update attendance for multiple students
router.post('/updateAttendance', async (req, res) => {
  const attendanceData = req.body;

  try {
    for (const record of attendanceData) {
      const { applicationNumber, fnTotal, anTotal, exams } = record;

      // Find the student by application number
      const student = await Student.findOne({ applicationNumber: applicationNumber });

      if (student) {
        // Split the existing and new totals
        const [existingFnNumerator, existingFnDenominator] = student.attendance.fnTotal ? student.attendance.fnTotal.split('/').map(Number) : [0, 0];
        const [newFnNumerator, newFnDenominator] = fnTotal.split('/').map(Number);

        const [existingAnNumerator, existingAnDenominator] = student.attendance.anTotal ? student.attendance.anTotal.split('/').map(Number) : [0, 0];
        const [newAnNumerator, newAnDenominator] = anTotal.split('/').map(Number);

        const [existingExamNumerator, existingExamDenominator] = student.attendance.exams ? student.attendance.exams.split('/').map(Number) : [0, 0];
        const [newExamNumerator, newExamDenominator] = exams.split('/').map(Number);

        // Calculate the new totals
        const updatedFnTotal = `${existingFnNumerator + newFnNumerator}/${existingFnDenominator + newFnDenominator}`;
        const updatedAnTotal = `${existingAnNumerator + newAnNumerator}/${existingAnDenominator + newAnDenominator}`;
        const updatedExams = `${existingExamNumerator + newExamNumerator}/${existingExamDenominator + newExamDenominator}`;

        // Update the student's attendance record
        student.attendance.fnTotal = updatedFnTotal;
        student.attendance.anTotal = updatedAnTotal;
        student.attendance.exams = updatedExams;

        await student.save();
      }
    }

    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error });
  }
});


module.exports = router ;