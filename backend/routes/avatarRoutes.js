const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/avatars", (req, res) => {
  // Set CORS headers explicitly for this route
  res.header(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "http://localhost:5173",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  const avatarsDir = path.join(__dirname, "../uploads/avatars");

  // Create directory if it doesn't exist
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });

    // You might want to copy default avatars here
    // For now, we'll return an empty array
    return res.json({ avatars: [] });
  }

  fs.readdir(avatarsDir, (err, files) => {
    if (err) {
      console.error("Error reading avatars directory:", err);
      return res.status(500).json({ error: "Unable to read avatars folder" });
    }

    // Filter image files and sort them
    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .sort((a, b) => {
        // Sort numerically by the number in filename
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });

    const avatars = imageFiles.map((file, index) => ({
      id: index + 1,
      file,
      url: `/uploads/avatars/${file}`,
    }));

    res.json({ avatars });
  });
});

module.exports = router;
