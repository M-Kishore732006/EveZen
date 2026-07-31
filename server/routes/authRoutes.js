const express = require('express');
const { login, studentSignup } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/student-signup', studentSignup);

module.exports = router;
