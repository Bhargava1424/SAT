const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  applicationNumber: String,
  dateOfJoining: String,
  course: String,
  firstName: String,
  surName: String,
  parentName: String,
  gender: String,
  batch: String,
  branch: String,
  yearOfJoining: String,
  modeOfResidence: String,
  primaryContact: String,
  secondaryContact: String,
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;