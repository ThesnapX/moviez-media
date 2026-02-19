const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("../models/Movie");

dotenv.config();

const updateMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Movie.updateMany({}, [
      {
        $set: {
          language: { $ifNull: ["$language", ""] },
          duration: { $ifNull: ["$duration", ""] },
          ageRating: { $ifNull: ["$ageRating", "PG-13"] },
          quality: { $ifNull: ["$quality", "HD"] },
        },
      },
    ]);

    const movies = await Movie.find({});
    for (const movie of movies) {
      let modified = false;

      movie.downloadUrls.forEach((url) => {
        if (!url.sizeUnit) {
          url.sizeUnit = "GB";
          modified = true;
        }
        if (!url.episode) {
          url.episode = "";
          modified = true;
        }
      });

      if (modified) await movie.save();
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

updateMovies();
