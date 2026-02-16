const express = require("express");
const router = express.Router();
const Genre = require("../models/Genre");
const { protect, admin } = require("../middleware/auth");

// Get all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create genre (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if genre exists
    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) {
      return res.status(400).json({ message: "Genre already exists" });
    }

    const genre = new Genre({ name, description });
    await genre.save();
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update genre (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete genre (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.json({ message: "Genre deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
