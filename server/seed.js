require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    await connectDB();
    try {
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: '732006',
                phone: '0000000000',
                role: 'Admin'
            });
            await admin.save();
            console.log('Admin user seeded successfully');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding admin', error);
        process.exit(1);
    }
}

seedAdmin();
