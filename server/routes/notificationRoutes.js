const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

module.exports = router;
