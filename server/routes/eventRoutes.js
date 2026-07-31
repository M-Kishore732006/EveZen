const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent, getDashboardStats } = require('../controllers/eventController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

router.get('/stats', getDashboardStats);
router.route('/').get(getEvents).post(createEvent);
router.route('/:id').put(updateEvent).delete(deleteEvent);

module.exports = router;
