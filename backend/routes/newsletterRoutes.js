const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send newsletter to all users
router.post("/send", protect, admin, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required" });
    }

    // Get all users
    const users = await User.find({}, "email name");

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "No users found to send newsletter" });
    }

    const transporter = createTransporter();
    const sentTo = [];
    const failedTo = [];

    // Send emails to all users
    for (const user of users) {
      try {
        await transporter.sendMail({
          to: user.email,
          subject: `📧 Moviez Media: ${subject}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: 'Poppins', Arial, sans-serif;
                  background-color: #0a0a0a;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                  border-radius: 16px;
                  border: 1px solid rgba(240, 0, 0, 0.2);
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(240, 0, 0, 0.1);
                }
                .header {
                  background: linear-gradient(90deg, #f00000 0%, #d00000 100%);
                  padding: 30px 20px;
                  text-align: center;
                }
                .header h1 {
                  font-family: 'Bebas Neue', cursive;
                  font-size: 48px;
                  margin: 0;
                  color: white;
                  letter-spacing: 2px;
                  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                .header p {
                  font-size: 18px;
                  margin: 10px 0 0;
                  color: rgba(255,255,255,0.9);
                }
                .content {
                  padding: 30px;
                  color: #e7e7e7;
                }
                .greeting {
                  font-size: 18px;
                  margin-bottom: 20px;
                  color: #f00000;
                }
                .message {
                  background: rgba(255,255,255,0.05);
                  border-radius: 12px;
                  padding: 20px;
                  margin: 20px 0;
                  border-left: 4px solid #f00000;
                  line-height: 1.6;
                }
                .footer {
                  background: rgba(0,0,0,0.3);
                  padding: 20px;
                  text-align: center;
                  border-top: 1px solid rgba(240, 0, 0, 0.2);
                }
                .footer p {
                  margin: 5px 0;
                  color: rgba(255,255,255,0.6);
                  font-size: 12px;
                }
                .button {
                  display: inline-block;
                  background: #f00000;
                  color: white;
                  text-decoration: none;
                  padding: 12px 30px;
                  border-radius: 8px;
                  margin-top: 20px;
                  font-weight: 600;
                  transition: background 0.3s;
                }
                .button:hover {
                  background: #d00000;
                }
                .social-links {
                  margin-top: 20px;
                }
                .social-links a {
                  display: inline-block;
                  margin: 0 10px;
                  color: rgba(255,255,255,0.6);
                  text-decoration: none;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Moviez<span style="color: #0a0a0a;">Media</span></h1>
                  <p>Stay Updated with the Latest Content!</p>
                </div>
                
                <div class="content">
                  <div class="greeting">
                    Hello ${user.name || "Valued Member"}! 👋
                  </div>
                  
                  <h2 style="color: #f00000; margin-bottom: 15px;">${subject}</h2>
                  
                  <div class="message">
                    ${message.replace(/\n/g, "<br/>")}
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}" class="button">Visit MoviezMedia</a>
                  </div>
                  
                  <div class="social-links">
                    <a href="#">Facebook</a>
                    <a href="#">Twitter</a>
                    <a href="#">Instagram</a>
                    <a href="#">Telegram</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p>© ${new Date().getFullYear()} MoviezMedia. All rights reserved.</p>
                  <p>You're receiving this email because you're subscribed to MoviezMedia updates.</p>
                  <p>
                    <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #f00000; text-decoration: none;">Unsubscribe</a> • 
                    <a href="${process.env.FRONTEND_URL}/privacy" style="color: #f00000; text-decoration: none;">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        sentTo.push(user._id);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedTo.push(user.email);
      }
    }

    // Save newsletter record
    const newsletter = new Newsletter({
      subject,
      message,
      sentBy: req.user._id,
      sentTo: sentTo,
      status: failedTo.length === users.length ? "failed" : "sent",
    });
    await newsletter.save();

    res.json({
      message: "Newsletter sent successfully",
      stats: {
        total: users.length,
        sent: sentTo.length,
        failed: failedTo.length,
      },
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    res.status(500).json({ message: "Failed to send newsletter" });
  }
});

// Get newsletter history
router.get("/history", protect, admin, async (req, res) => {
  try {
    const newsletters = await Newsletter.find()
      .populate("sentBy", "name email profilePicture")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get newsletter stats
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNewsletters = await Newsletter.countDocuments();
    const lastNewsletter = await Newsletter.findOne().sort({ createdAt: -1 });

    res.json({
      totalUsers,
      totalNewsletters,
      lastNewsletter: lastNewsletter
        ? {
            subject: lastNewsletter.subject,
            date: lastNewsletter.createdAt,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
