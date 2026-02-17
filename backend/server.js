const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// IMPORTANT: CORS must be configured BEFORE any routes
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads - this should be BEFORE routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");

    // Create default admin if not exists
    const User = require("./models/User");
    const adminExists = await User.findOne({ email: "admin@moviezmedia.com" });
    if (!adminExists) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@moviezmedia.com",
        password: hashedPassword,
        role: "admin",
        profilePicture: "/uploads/avatars/avatar-1.png", // Changed to use avatar-1
      });
      console.log(
        "✅ Default admin created - Email: admin@moviezmedia.com, Password: admin123",
      );
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const genreRoutes = require("./routes/genreRoutes");
const requestRoutes = require("./routes/requestRoutes");
const commentRoutes = require("./routes/commentRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const avatarRoutes = require("./routes/avatarRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", avatarRoutes); // This should work now

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Other Routes
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
