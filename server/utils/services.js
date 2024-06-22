const Cluster = require('../models/Cluster');
const Student = require('../models/Student');
const { MongoClient } = require('mongodb');

// Function to create clusters
async function createClusters(branch, batch, numberOfClusters){
    const clusters = [];

    for (let i = 0; i < numberOfClusters; i++) {
        const cluster = new Cluster({
            clusterID: `${branch}-${batch}-${i + 1}`,
            setA: 0,
            setB: 0,
            branch,
            batch,
            studentCount: 0,
            clusterType: `Cluster ${i + 1}`
        });

        clusters.push(cluster);
    }

    await Cluster.insertMany(clusters);
    await assignStudentsToClusters(branch, batch, numberOfClusters);
}

async function assignStudentsToClusters(branch, batch){
    try{
      // fetch all students from the older database from same branch
      const studentsFromOtherDB = await fetchStudentsFromOtherDB(branch, batch);
      
      // 1. Find existing students in this application's database
      const existingStudents = await Student.find();

      console.log('Existing students:', existingStudents);
  
     // 2. Identify new students (those not in this app's database) and those who need to be assigned clusters
        const newStudents = studentsFromOtherDB.filter(
            student => !existingStudents.some(
                existing => existing.applicationNumber === student.applicationNumber
            )
        ).map(student => {
            return {
                ...student,
                branch,
                batch,
            };
        });
      
      console.log('New students:', newStudents);

      // 3. Assign Clusters to new students
      for (const newStudent of newStudents) { 
        const assignedCluster = await assignCluster(newStudent.branch, newStudent.batch);
        const setType = await assignSet(newStudent.branch, newStudent.batch, assignedCluster); 
  
        newStudent.clusterID = assignedCluster;
        newStudent.setType = setType;
  
        await new Student(newStudent).save(); // Save the new student with assigned cluster
      }

      console.log('New students with clusters:', newStudents);
  
      // 5. Send all students from this app's database
      const allStudents = await Student.find();
      return(allStudents);

      console.log('All students:', allStudents);
    }
    catch (err) {
        console.error('Error fetching students from other database:', err);
        throw err;
    }
}

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
  
  
// Function to assign a cluster to a student
async function assignCluster(branch, batch) {
    const clusters = await Cluster.find({ branch, batch });

    // If no clusters exist, create them based on the number of lecturers
    if (clusters.length === 0) {
        return '' // Assign again after creating clusters
    }

    let leastStudents = Infinity;
    let assignedCluster;
    for (const cluster of clusters) {
        const studentCount = await Student.countDocuments({ clusterID: cluster.clusterID });
        if (studentCount < leastStudents) {
        leastStudents = studentCount;
        assignedCluster = cluster.clusterID;
        }
}

await Cluster.updateOne({ clusterID: assignedCluster }, { $inc: { studentCount: 1 } });

return assignedCluster;
}

async function assignSet(branch, batch, assignedCluster) {
    const cluster = await Cluster.findOne({ clusterID: assignedCluster });
    if (!cluster) {
        return ''; 
    }

    const setA = cluster.setA;
    const setB = cluster.setB;

    const assignedSet = setA <= setB ? 'A' : 'B';

    await Cluster.updateOne({ clusterID: assignedCluster }, { [`set${assignedSet}`]:  cluster[`set${assignedSet}`] + 1 });

    return assignedSet;
}

module.exports = { createClusters, assignStudentsToClusters, fetchStudentsFromOtherDB, assignCluster, assignSet };