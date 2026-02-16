const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { cloudinary } = require("../config/cloudinary");
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
// Update profile with picture upload
router.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const user = await User.findById(req.user._id);

      if (name) user.name = name;

      if (req.file) {
        // Delete old profile picture from Cloudinary
        if (user.profilePicture?.public_id) {
          await cloudinary.uploader.destroy(user.profilePicture.public_id);
        }

        user.profilePicture = {
          public_id: req.file.filename,
          url: req.file.path,
        };
      }

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Add to watchlist
router.post("/watchlist/:movieId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.watchlist.includes(req.params.movieId)) {
      user.watchlist.push(req.params.movieId);
      await user.save();
    }
    res.json({ message: "Added to watchlist" });
  } catch (error) {
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
    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get watchlist
router.get("/watchlist", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("watchlist");
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
