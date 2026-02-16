const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const { protect, admin } = require("../middleware/auth");

// Get comments for a movie
router.get("/movie/:movieId", async (req, res) => {
  try {
    const comments = await Comment.find({ movie: req.params.movieId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create comment
router.post("/", protect, async (req, res) => {
  try {
    const comment = new Comment({
      ...req.body,
      user: req.user._id,
    });
    await comment.save();
    await comment.populate("user", "name profilePicture");
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete comment (admin or comment owner)
router.delete("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is admin or comment owner
    if (
      req.user.role !== "admin" &&
      comment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all comments (admin only)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "name profilePicture email")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
