const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
        const events = await Event.find().populate('venue', 'name location').populate('assignedFaculty', 'name').populate('assignedStaff', 'name workType');
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

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, getDashboardStats };
