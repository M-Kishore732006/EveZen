const Message = require('../models/Message');
const Event = require('../models/Event');

exports.getMessages = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user._id || req.user.id;
        const role = req.user.role;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (role === 'Student' && !event.registeredStudents.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'Access denied. You are not registered for this event.' });
        }
        
        if ((role === 'Faculty' || role === 'Supporting Staff') && 
            !event.assignedFaculty.some(id => id.toString() === userId.toString()) && 
            !event.assignedStaff.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'Access denied. You are not assigned to this event.' });
        }

        const messages = await Message.find({ eventId }).populate('senderId', 'name role').sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.postMessage = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { content, category } = req.body;
        const userId = req.user._id || req.user.id;
        const role = req.user.role;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (role === 'Student' && !event.registeredStudents.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'Access denied. You are not registered for this event.' });
        }
        
        if ((role === 'Faculty' || role === 'Supporting Staff') && 
            !event.assignedFaculty.some(id => id.toString() === userId.toString()) && 
            !event.assignedStaff.some(id => id.toString() === userId.toString())) {
            return res.status(403).json({ message: 'Access denied. You are not assigned to this event.' });
        }

        if (role === 'Supporting Staff' && category !== 'Questions') {
            return res.status(403).json({ message: 'Access denied. Supporting staff can only post questions.' });
        }

        const newMessage = await Message.create({ eventId, senderId: userId, content, category });
        
        await newMessage.populate('senderId', 'name role');
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id || req.user.id;
        const role = req.user.role;

        const message = await Message.findById(messageId).populate('senderId');
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // Admins can delete anything
        if (role === 'Admin') {
            await Message.findByIdAndDelete(messageId);
            return res.json({ message: 'Message deleted successfully' });
        }

        // Students can only delete their own
        if (role === 'Student') {
            if (message.senderId._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }

        // Faculty can delete their own OR any student's message
        if (role === 'Faculty') {
            if (message.senderId._id.toString() !== userId.toString() && message.senderId.role !== 'Student') {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }
        
        // Supporting Staff can ONLY delete their own messages
        if (role === 'Supporting Staff') {
            if (message.senderId._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Access denied.' });
            }
        }

        await Message.findByIdAndDelete(messageId);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
