const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const { protect, admin } = require("../middleware/auth");

// Create request
router.post("/", protect, async (req, res) => {
  try {
    const request = new Request({
      ...req.body,
      user: req.user._id,
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's requests
router.get("/my-requests", protect, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all requests (admin only)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update request status (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete request (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
