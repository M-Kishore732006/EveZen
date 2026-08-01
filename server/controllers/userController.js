const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getFaculty = async (req, res) => {
    try {
        const faculty = await User.find({ role: 'Faculty' }).select('-password');
        res.json(faculty);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createFaculty = async (req, res) => {
    try {
        const exists = await User.findOne({ email: req.body.email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const faculty = await User.create({ ...req.body, role: 'Faculty' });
        res.status(201).json(faculty);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateFaculty = async (req, res) => {
    try {
        const faculty = await User.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
        
        Object.assign(faculty, req.body);
        const updated = await faculty.save();
        res.json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteFaculty = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Faculty removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'Supporting Staff' }).select('-password');
        res.json(staff);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createStaff = async (req, res) => {
    try {
        const exists = await User.findOne({ email: req.body.email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const staff = await User.create({ ...req.body, role: 'Supporting Staff' });
        res.status(201).json(staff);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateStaff = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
        
        Object.assign(staff, req.body);
        const updated = await staff.save();
        res.json(updated);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteStaff = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id || req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFaculty, createFaculty, updateFaculty, deleteFaculty, getStaff, createStaff, updateStaff, deleteStaff, changePassword };
