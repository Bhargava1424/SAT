//routes/student.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Cluster = require('../models/Cluster');
const Session = require('../models/Session');
const MongoClient = require('mongodb').MongoClient;

// Get all students
// router.get('/', async (req, res) => {
//   console.log('Get all students');
//   try {
//     // Create a MongoDB client
//     const uri = process.env.MONGO_URI_ERP;
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//     // Connect to the MongoDB server
//     await client.connect();
//     console.log('Connected to MongoDB');

//     // Access the "students" collection
//     const studentsCollection = client.db().collection('students');

//     // Query the "students" collection
//     const students = await studentsCollection.find().toArray();
//     // console.log(students);

//     // Close the MongoDB connection
//     await client.close();

//     res.json(students);
//   } catch (err) {
//     console.error('Error fetching students:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

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

    // 3. Create Clusters if none exist
    for (const newStudent of newStudents){
      if (newStudent.branch && newStudent.batch) {
        await createClustersIfNecessary(newStudent.branch, newStudent.batch);
      }

    // 4. Assign Clusters to new students
      const assignedCluster = await assignCluster(newStudent.branch, newStudent.batch);
      console.log('assignedCluster', assignedCluster);
      const setType = await assignSet(newStudent.branch, newStudent.batch, assignedCluster);
      console.log('setType', setType);
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

// Function to fetch students from the other database (replace with your logic)
async function fetchStudentsFromOtherDB() {
  try {
    // Create a MongoDB client
    const uri = process.env.MONGO_URI_ERP;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to other database');

    // Access the "students" collection
    const studentsCollection = client.db().collection('students');

    // Query the "students" collection
    const students = await studentsCollection.find().toArray();
    // console.log(students);

    // Close the MongoDB connection
    await client.close();

    return students;
  } catch (err) {
    console.error('Error fetching students from other database:', err);
    throw err;
  }
}

// Function to create clusters if they don't exist
async function createClustersIfNecessary(branch, batch) {
  const existingClusters = await Cluster.find({ branch, batch });
  if (existingClusters.length === 0) {
    console.log('Creating clusters for branch and batch:', branch, batch);
    const clusters = [
      { clusterID: `A-${branch}-${batch}`, setA: 0, setB: 0, branch, batch, clusterType: 'A' },
      { clusterID: `B-${branch}-${batch}`, setA: 0, setB: 0, branch, batch, clusterType: 'B' },
      { clusterID: `C-${branch}-${batch}`, setA: 0, setB: 0, branch, batch, clusterType: 'C' }
    ];
    await Cluster.insertMany(clusters);
    // Call the function to create sessions after creating clusters
    await createSessionsForTwoYears(branch, batch); 
  }
}

// Function to create sessions for two years
const createSessionsForTwoYears = async (branch, batch) => {
  try {
    const startDate = new Date();
    const sessions = generateSessionsForTwoYears(startDate, branch, batch);
    await Session.insertMany(sessions);
    console.log('Sessions created for two years');
  } catch (err) {
    console.error("Error creating sessions:", err);
    throw err; // Re-throw the error to be handled at a higher level
  }
};

// Function to generate sessions for two years
const generateSessionsForTwoYears = (startDate, branch, batch) => {
  const sessions = [];
  const subjectClusterMapping = {
    'Mathematics': ['A', 'B', 'C'],
    'Physics': ['B', 'C', 'A'],
    'Chemistry': ['C', 'A', 'B']
  };

  let currentDate = nextMonday(startDate); // Start from next Monday

  for (let year = 0; year < 2; year++) {
    for (let week = 0; week < 52; week++) {
      for (const subject in subjectClusterMapping) {
        const clusterType = subjectClusterMapping[subject][(week % 6) / 2 | 0]; 

        const session = {
          clusterID: `${clusterType}-${branch}-${batch}`,
          period: `${format(currentDate, 'MMM d, yyyy')} - ${format(addDays(currentDate, 13), 'MMM d, yyyy')}`,
          startDate: new Date(currentDate),
          subject: subject,
          branch: branch, // Replace with dynamic branch assignment
          batch: batch, // Replace with dynamic batch assignment
          clusterType: clusterType,
          status: 'pending',
        };
        sessions.push(session);
      }
      currentDate = addDays(currentDate, 14); 
    }
  }
  return sessions;
};

const nextMonday = (date) => {
  const day = date.getDay();
  const diff = 1 - day + (day === 0 ? -6 : 1);
  return addDays(date, diff);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const format = (date, format) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Function to assign a cluster to a student
async function assignCluster(branch, batch) {
  const clusters = await Cluster.find({ branch, batch });
  let leastStudents = Infinity;
  let assignedCluster;
  let updatedStudentCount = 0;
  for (const cluster of clusters) {
    console.log('cluster', cluster);
    const studentCount = await Student.countDocuments({ clusterID: cluster.clusterID });
    if (studentCount < leastStudents) {
      leastStudents = studentCount;
      assignedCluster = cluster.clusterID;
      updatedStudentCount = studentCount + 1;
    }
  }

  // update studentCount in the assigned cluster
  console.log('assignedCluster', assignedCluster);
  console.log('updatedStudentCount', updatedStudentCount);
  await Cluster.updateOne({ clusterID: assignedCluster }, {studentCount: updatedStudentCount });

  return assignedCluster;
}

async function assignSet(branch, batch, assignedCluster) {
  const cluster = await Cluster.find({ clusterID: assignedCluster }); 
  console.log('cluster', cluster);
  const setA = cluster[0].setA;
  const setB = cluster[0].setB;
  console.log('setA', setA);
  console.log('setB', setB);
  const assignedSet = setA <= setB ? 'A' : 'B';
  const updatedSetCount = assignedSet === 'A' ? setA + 1 : setB + 1;

  await Cluster.updateOne({ clusterID: assignedCluster }, { ['set' + assignedSet]: updatedSetCount });

  return assignedSet;
}


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
  // ... update student fields ...
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

module.exports = router;