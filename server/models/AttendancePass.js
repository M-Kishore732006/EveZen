const mongoose = require('mongoose');

const attendancePassSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 } // OTP expires automatically after 60 seconds
});

module.exports = mongoose.model('AttendancePass', attendancePassSchema);
