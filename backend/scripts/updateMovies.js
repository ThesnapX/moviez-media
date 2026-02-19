const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");

dotenv.config();

const updateMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all movies that don't have language field
    const result = await Movie.updateMany(
      { language: { $exists: false } },
      {
        $set: {
          language: "",
          duration: { $ifNull: ["$duration", ""] },
          ageRating: { $ifNull: ["$ageRating", "PG-13"] },
          quality: { $ifNull: ["$quality", "HD"] },
        },
      },
    );

    console.log(`Updated ${result.modifiedCount} movies`);

    // Also update downloadUrls to ensure sizeUnit exists
    const movies = await Movie.find({});
    for (const movie of movies) {
      let modified = false;

      if (movie.downloadUrls && movie.downloadUrls.length > 0) {
        movie.downloadUrls.forEach((url) => {
          if (!url.sizeUnit) {
            url.sizeUnit = "GB";
            modified = true;
          }
        });
      }

      if (modified) {
        await movie.save();
      }
    }

    console.log("Download URLs updated");
  } catch (error) {
    console.error("Error updating movies:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

updateMovies();
