const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");
const Genre = require("../models/Genre");
const Comment = require("../models/Comment");
const Request = require("../models/Request");
const { protect, admin } = require("../middleware/auth");

// Get dashboard stats
router.get("/dashboard", protect, admin, async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments({ type: "movie" });
    const totalTVSeries = await Movie.countDocuments({ type: "tv-series" });
    const totalAnime = await Movie.countDocuments({ type: "anime" });
    const totalGenres = await Genre.countDocuments();
    const totalUsers = await User.countDocuments();

    const latestComments = await Comment.find()
      .populate("user", "name profilePicture")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    const latestUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalMovies,
        totalTVSeries,
        totalAnime,
        totalGenres,
        totalUsers,
      },
      latestComments,
      latestUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (admin only)
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true },
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
