const express = require('express');
const { getVenues, getAvailableAndBookedVenues, createVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['Admin']));

router.route('/').get(getVenues).post(createVenue);
router.route('/status').get(getAvailableAndBookedVenues);
router.route('/:id').put(updateVenue).delete(deleteVenue);

module.exports = router;
