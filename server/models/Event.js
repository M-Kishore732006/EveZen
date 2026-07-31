const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    participationType: { type: String, enum: ['Individual', 'Team'], required: true },
    teamSize: { type: Number, default: 1 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    assignedFaculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
