require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/forums", require("./routes/forumRoutes"));

app.get("/", (req, res) => {
    res.send("EveZen API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});