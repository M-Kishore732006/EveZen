const Venue = require('../models/Venue');
const Event = require('../models/Event');

const getVenues = async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAvailableAndBookedVenues = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.query;
        if (!date || !startTime || !endTime) {
             return res.status(400).json({ message: 'Please provide date, startTime, and endTime' });
        }

        const events = await Event.find({ date: new Date(date) }).populate('assignedStaff');
        const bookedVenueIds = events.map(e => e.venue.toString());

        const allVenues = await Venue.find();
        const availableVenues = allVenues.filter(v => !bookedVenueIds.includes(v._id.toString()));
        const bookedVenues = allVenues.filter(v => bookedVenueIds.includes(v._id.toString()));

        const bookedDetails = bookedVenues.map(v => {
            const ev = events.find(e => e.venue.toString() === v._id.toString());
            return { venue: v, event: ev };
        });

        res.json({ availableVenues, bookedDetails });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createVenue = async (req, res) => {
    try {
        const venue = await Venue.create(req.body);
        res.status(201).json(venue);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(venue);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteVenue = async (req, res) => {
    try {
        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getVenues, getAvailableAndBookedVenues, createVenue, updateVenue, deleteVenue };
