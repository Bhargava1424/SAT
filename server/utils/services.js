const Cluster = require('../models/Cluster');
const Student = require('../models/Student');
const { MongoClient } = require('mongodb');

async function createClusters(branch, batch, numberOfClusters) {
  try {
      await Cluster.deleteMany({ branch, batch });

      const clusters = Array.from({ length: numberOfClusters }, (_, i) => ({
          clusterID: `${branch}-${batch}-${i + 1}`,
          setA: 0,
          setB: 0,
          branch,
          batch,
          studentCount: 0,
          clusterType: `Cluster ${i + 1}`
      }));

      await Cluster.insertMany(clusters);
      await assignStudentsToClusters(branch, batch);
  } catch (error) {
      console.error(`Error creating clusters: ${error.message}`);
      throw error;
  }
}

async function assignStudentsToClusters(branch, batch) {
  try {
      const studentsFromOtherDB = await fetchStudentsFromOtherDB();
      const existingStudents = await Student.find({}, { applicationNumber: 1 });

      const existingAppNumbers = new Set(existingStudents.map(s => s.applicationNumber));
      const newStudents = studentsFromOtherDB.filter(s => !existingAppNumbers.has(s.applicationNumber));

      if (newStudents.length > 0) {
          await Student.insertMany(newStudents);
      }

      const students = await Student.find({ branch, batch });
      console.info(`Assigning clusters to ${students.length} students of ${branch} - ${batch}`);

      for (const student of students) {
          const assignedCluster = await assignCluster(student.branch, student.batch);
          const setType = await assignSet(student.branch, student.batch, assignedCluster);

          await Student.findByIdAndUpdate(student._id, { 
              clusterID: assignedCluster, 
              setType: setType 
          });
      }
  } catch (error) {
      console.error(`Error assigning students to clusters: ${error.message}`);
      throw error;
  }
}

async function fetchStudentsFromOtherDB() {
  let client;
  try {
      const uri = process.env.MONGO_URI_ERP;
      client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();

      const studentsCollection = client.db().collection('students');
      const currentYear = new Date().getFullYear();
      const students = await studentsCollection.find({ yearOfJoining: String(currentYear), studentStatus: "Active" }).toArray();

      console.info(`Fetched ${students.length} students from other database`);
      return students;
  } catch (error) {
      console.error(`Error fetching students from other database: ${error.message}`);
      throw error;
  } finally {
      if (client) await client.close();
  }
}

async function assignCluster(branch, batch) {
  try {
      const clusters = await Cluster.find({ branch, batch });
      if (clusters.length === 0) {
          console.warn(`No clusters found for ${branch} - ${batch}`);
          return '';
      }

      const clusterWithLeastStudents = await Cluster.findOne({ branch, batch })
          .sort({ studentCount: 1 })
          .limit(1);

      await Cluster.findByIdAndUpdate(clusterWithLeastStudents._id, { $inc: { studentCount: 1 } });
      return clusterWithLeastStudents.clusterID;
  } catch (error) {
      console.error(`Error assigning cluster: ${error.message}`);
      throw error;
  }
}

async function assignSet(branch, batch, assignedCluster) {
  try {
      const cluster = await Cluster.findOne({ clusterID: assignedCluster });
      if (!cluster) {
          console.warn(`Cluster not found: ${assignedCluster}`);
          return '';
      }

      const assignedSet = cluster.setA <= cluster.setB ? 'A' : 'B';
      await Cluster.findByIdAndUpdate(cluster._id, { $inc: { [`set${assignedSet}`]: 1 } });
      return assignedSet;
  } catch (error) {
      console.error(`Error assigning set: ${error.message}`);
      throw error;
  }
}

module.exports = { createClusters, assignStudentsToClusters, fetchStudentsFromOtherDB, assignCluster, assignSet };