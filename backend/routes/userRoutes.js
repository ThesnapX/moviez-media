const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    // If password is provided, hash it
    if (password) {
      const bcrypt = require("bcryptjs");
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's watchlist
router.get("/watchlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "watchlist",
      populate: { path: "genres" },
    });

    res.json(user.watchlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add to watchlist
router.post("/watchlist/:movieId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.watchlist.includes(req.params.movieId)) {
      user.watchlist.push(req.params.movieId);
      await user.save();
      res.json({ message: "Added to watchlist", watchlist: user.watchlist });
    } else {
      res.status(400).json({ message: "Movie already in watchlist" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove from watchlist
router.delete("/watchlist/:movieId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== req.params.movieId,
    );

    await user.save();
    res.json({ message: "Removed from watchlist", watchlist: user.watchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if movie is in watchlist
router.get("/watchlist/check/:movieId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isInWatchlist = user.watchlist.includes(req.params.movieId);
    res.json({ isInWatchlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
