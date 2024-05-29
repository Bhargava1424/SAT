const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gmail: { type: String, required: true, unique: true }, // New Gmail field
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    branch: { type: String, required: true },
    teacherID: { type: String, required: true, unique: true },
    role: { type: String, required: true }
}, { strict: true });

module.exports = mongoose.model('Teacher', teacherSchema);

