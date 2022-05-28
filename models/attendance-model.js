const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  email: String,
  attendenceConfAt: String
});
const Attendance = mongoose.model('attendance', attendanceSchema);

module.exports = Attendance;