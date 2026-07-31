const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("==================================");
        console.log("Connecting to MongoDB...");
        console.log("URI:", process.env.MONGODB_URI);
        console.log("==================================");

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;