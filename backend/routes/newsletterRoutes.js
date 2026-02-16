const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Send newsletter (admin only)
router.post("/send", protect, admin, async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Get all users
    const users = await User.find({}, "email");
    const emails = users.map((user) => user.email);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send emails
    for (const email of emails) {
      await transporter.sendMail({
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f00000;">Moviez Media Newsletter</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              ${message}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              You're receiving this because you're subscribed to Moviez Media updates.
              <br>
              <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
            </p>
          </div>
        `,
      });
    }

    // Save newsletter record
    const newsletter = new Newsletter({
      subject,
      message,
      sentBy: req.user._id,
      sentTo: users.map((u) => u._id),
    });
    await newsletter.save();

    res.json({ message: "Newsletter sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get newsletter history (admin only)
router.get("/history", protect, admin, async (req, res) => {
  try {
    const newsletters = await Newsletter.find()
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
