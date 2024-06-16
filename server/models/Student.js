const mongoose = require('mongoose');


const studentSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfJoining: String,
  course: String,
  firstName: {
    type: String,
    required: true,
  },
  surName: {
    type: String,
    required: true,
  },
  parentName: String,
  gender: String,
  batch: String,
  branch: {
    type: String,
    required: true,
  },
  yearOfJoining: String,
  modeOfResidence: String,
  primaryContact: String,
  secondaryContact: String,
  firstYearHostelFee: Number,
  firstYearTuitionFee: Number,
  secondYearHostelFee: Number,
  secondYearTuitionFee: Number,
  pendingFirstYearTuitionFee: Number,
  pendingFirstYearHostelFee: Number,
  pendingSecondYearTuitionFee: Number,
  pendingSecondYearHostelFee: Number,
  paidFirstYearTuitionFee: Number,
  paidFirstYearHostelFee: Number,
  paidSecondYearTuitionFee: Number,
  paidSecondYearHostelFee: Number,
  studentStatus: String,
});

module.exports = mongoose.model('Student', studentSchema);