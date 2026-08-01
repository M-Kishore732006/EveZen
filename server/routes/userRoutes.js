const express = require('express');
const { getFaculty, createFaculty, updateFaculty, deleteFaculty, getStaff, createStaff, updateStaff, deleteStaff, changePassword, getStudents, deleteStudent } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/change-password', changePassword);

router.use(roleMiddleware(['Admin']));

router.route('/faculty').get(getFaculty).post(createFaculty);
router.route('/faculty/:id').put(updateFaculty).delete(deleteFaculty);

router.route('/staff').get(getStaff).post(createStaff);
router.route('/staff/:id').put(updateStaff).delete(deleteStaff);

router.route('/students').get(getStudents);
router.route('/students/:id').delete(deleteStudent);

module.exports = router;
