const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AttendancePass = require('../models/AttendancePass');

const checkConflicts = async (date, startTime, endTime, venueId, facultyIds, staffIds, eventId = null) => {
    const query = { date: new Date(date) };
    if (eventId) query._id = { $ne: eventId };
    
    const eventsOnDate = await Event.find(query);
    
    for (let ev of eventsOnDate) {
        const overlaps = (startTime < ev.endTime) && (ev.startTime < endTime);
        if (overlaps) {
            if (ev.venue.toString() === venueId) return 'Venue is already booked for this time.';
            const sharedFaculty = ev.assignedFaculty.filter(f => facultyIds.includes(f.toString()));
            if (sharedFaculty.length > 0) return 'Faculty member assigned to another event at this time.';
            const sharedStaff = ev.assignedStaff.filter(s => staffIds.includes(s.toString()));
            if (sharedStaff.length > 0) return 'Supporting staff member assigned to another event at this time.';
        }
    }
    return null;
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('venue', 'name location')
            .populate('assignedFaculty', 'name')
            .populate('assignedStaff', 'name workType')
            .populate('registeredStudents', 'name email')
            .populate('attendedStudents', 'name email');
        res.json(events);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createEvent = async (req, res) => {
    try {
        const { date, startTime, endTime, venue, assignedFaculty, assignedStaff } = req.body;
        const conflictError = await checkConflicts(date, startTime, endTime, venue, assignedFaculty || [], assignedStaff || []);
        if (conflictError) return res.status(400).json({ message: conflictError });

        const event = await Event.create(req.body);
        
        await Notification.create({
            title: 'New Event Scheduled',
            message: `A new event "${event.title}" has been scheduled for ${new Date(event.date).toLocaleDateString()}.`,
            type: 'event_created'
        });

        res.status(201).json(event);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateEvent = async (req, res) => {
    try {
        const { date, startTime, endTime, venue, assignedFaculty, assignedStaff } = req.body;
        const conflictError = await checkConflicts(date, startTime, endTime, venue, assignedFaculty || [], assignedStaff || [], req.params.id);
        if (conflictError) return res.status(400).json({ message: conflictError });

        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(event);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const eventsToday = await Event.countDocuments({ date: { $gte: today, $lt: tomorrow }});
        const upcomingEvents = await Event.countDocuments({ date: { $gte: tomorrow }});
        const totalFaculty = await User.countDocuments({ role: 'Faculty' });
        const totalStaff = await User.countDocuments({ role: 'Supporting Staff' });

        res.json({ eventsToday, upcomingEvents, totalFaculty, totalStaff });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const studentId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.registeredStudents.includes(studentId)) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        if (event.registeredStudents.length >= event.capacity) {
            return res.status(400).json({ message: 'Registration full. Capacity reached.' });
        }

        event.registeredStudents.push(studentId);
        await event.save();

        res.json({ message: 'Successfully registered for event.', event });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAttendance = async (req, res) => {
    try {
        const { qrData } = req.body;
        const eventId = req.params.id;

        // qrData format: EVENT:eventId|USER:userId|TS:timestamp
        if (!qrData || !qrData.startsWith('EVENT:')) {
            return res.status(400).json({ message: 'Invalid QR code.' });
        }

        const parts = qrData.split('|');
        const extractedEventId = parts[0].split(':')[1];
        const extractedUserId = parts[1].split(':')[1];
        const timestamp = parseInt(parts[2].split(':')[1]);

        if (extractedEventId !== eventId) {
            return res.status(400).json({ message: 'QR code does not match this event.' });
        }

        const now = new Date().getTime();
        if (now - timestamp > 5 * 60 * 1000) { // 5 minutes validity
            return res.status(400).json({ message: 'QR code expired. Please refresh the QR code.' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (!event.registeredStudents.some(id => id.toString() === extractedUserId.toString())) {
            return res.status(400).json({ message: 'Student is not registered for this event.' });
        }

        if (event.attendedStudents.some(id => id.toString() === extractedUserId.toString())) {
            return res.status(400).json({ message: 'Attendance already marked for this student.' });
        }

        event.attendedStudents.push(extractedUserId);
        await event.save();

        res.json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateOtp = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (!event.registeredStudents.some(id => id.toString() === userId.toString())) {
            return res.status(400).json({ message: 'Not registered for this event.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await AttendancePass.deleteMany({ eventId, userId }); // Clear old OTPs
        
        await AttendancePass.create({ eventId, userId, otp });
        
        res.json({ otp });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAttendanceOtp = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { otp } = req.body;

        const pass = await AttendancePass.findOne({ eventId, otp });
        if (!pass) return res.status(400).json({ message: 'Invalid or expired OTP.' });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (event.attendedStudents.some(id => id.toString() === pass.userId.toString())) {
            await AttendancePass.findByIdAndDelete(pass._id);
            return res.status(400).json({ message: 'Attendance already marked for this student.' });
        }

        event.attendedStudents.push(pass.userId);
        await event.save();
        await AttendancePass.findByIdAndDelete(pass._id);

        res.json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, getDashboardStats, registerForEvent, markAttendance, generateOtp, markAttendanceOtp };
