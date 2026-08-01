const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/forumController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.route('/:eventId/messages')
    .get(getMessages)
    .post(postMessage);

module.exports = router;
