const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    branch: { type: String, required: true },
    teacherID: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Teacher', teacherSchema);
