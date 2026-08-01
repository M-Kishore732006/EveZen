const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent, getDashboardStats, registerForEvent, markAttendance, generateOtp, markAttendanceOtp } = require('../controllers/eventController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/stats', roleMiddleware(['Admin']), getDashboardStats);
router.route('/')
    .get(getEvents)
    .post(roleMiddleware(['Admin']), createEvent);

router.route('/:id')
    .put(roleMiddleware(['Admin']), updateEvent)
    .delete(roleMiddleware(['Admin']), deleteEvent);

router.post('/:id/register', registerForEvent);
router.post('/:id/attendance', roleMiddleware(['Faculty', 'Supporting Staff']), markAttendance);
router.post('/:id/generate-pass', roleMiddleware(['Student']), generateOtp);
router.post('/:id/attendance-otp', roleMiddleware(['Faculty', 'Supporting Staff']), markAttendanceOtp);

module.exports = router;
