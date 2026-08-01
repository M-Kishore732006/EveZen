const express = require('express');
const router = express.Router();
const { getMessages, postMessage, deleteMessage } = require('../controllers/forumController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.route('/:eventId/messages')
    .get(getMessages)
    .post(postMessage);

router.delete('/:eventId/messages/:messageId', deleteMessage);

module.exports = router;
