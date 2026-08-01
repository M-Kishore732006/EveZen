const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        const mapped = notifications.map(n => {
            const obj = n.toObject();
            obj.read = obj.readBy && obj.readBy.some(id => id.toString() === req.user.id);
            return obj;
        });
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

router.post('/mark-read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { readBy: { $ne: req.user.id } },
            { $addToSet: { readBy: req.user.id } }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notifications as read' });
    }
});

module.exports = router;
