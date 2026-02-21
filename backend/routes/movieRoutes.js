const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const { protect, admin } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { cloudinary } = require("../config/cloudinary");

// Get all movies with filters
router.get("/", async (req, res) => {
  try {
    const { type, genre, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (genre) query.genres = genre;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const movies = await Movie.find(query)
      .populate("genres")
      .sort({ createdAt: -1 });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get popular movies (most viewed)
router.get("/popular", async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate("genres")
      .sort({ views: -1 })
      .limit(20);

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get spotlight movies
router.get("/spotlight", async (req, res) => {
  try {
    const movies = await Movie.find({ spotlight: true }).populate("genres");
    // .limit(5);

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single movie
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("genres");

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Ensure all fields exist to prevent frontend errors
    const safeMovie = {
      ...movie.toObject(),
      language: movie.language || "",
      duration: movie.duration || "",
      ageRating: movie.ageRating || "PG-13",
      quality: movie.quality || "HD",
      imdbRating: movie.imdbRating || null,
      downloadUrls: movie.downloadUrls || [],
      spotlight: movie.spotlight || false,
      views: movie.views || 0,
    };

    // Increment views
    await Movie.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json(safeMovie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create movie with file uploads (admin only)
router.post(
  "/",
  protect,
  admin,
  upload.fields([
    { name: "posterVertical", maxCount: 1 },
    { name: "posterHorizontal", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const movieData = JSON.parse(req.body.data);

      // Add Cloudinary image info
      if (req.files["posterVertical"]) {
        movieData.posterVertical = {
          public_id: req.files["posterVertical"][0].filename,
          url: req.files["posterVertical"][0].path,
        };
      }

      if (req.files["posterHorizontal"]) {
        movieData.posterHorizontal = {
          public_id: req.files["posterHorizontal"][0].filename,
          url: req.files["posterHorizontal"][0].path,
        };
      }

      const movie = new Movie(movieData);
      await movie.save();
      res.status(201).json(movie);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Update movie with file uploads (admin only)
router.put(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "posterVertical", maxCount: 1 },
    { name: "posterHorizontal", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Received update request for movie:", req.params.id);
      console.log("Request body data:", req.body.data);

      const movieData = JSON.parse(req.body.data);
      const existingMovie = await Movie.findById(req.params.id);

      if (!existingMovie) {
        return res.status(404).json({ message: "Movie not found" });
      }

      // Clean the language field - ensure it's a single string
      let languageValue = movieData.language || "";
      if (typeof languageValue === "string") {
        // If it's a comma-separated string, keep it as is (it's fine)
        languageValue = languageValue.trim();
      } else {
        languageValue = "";
      }

      // Ensure all required fields have defaults
      const updatedData = {
        title: movieData.title || existingMovie.title,
        description: movieData.description || existingMovie.description,
        type: movieData.type || existingMovie.type,
        releaseDate: movieData.releaseDate || existingMovie.releaseDate,
        duration: movieData.duration || existingMovie.duration || "",
        ageRating: movieData.ageRating || existingMovie.ageRating || "PG-13",
        quality: movieData.quality || existingMovie.quality || "HD",
        language: languageValue, // Use the cleaned language value
        imdbRating: movieData.imdbRating
          ? parseFloat(movieData.imdbRating)
          : existingMovie.imdbRating,
        genres: movieData.genres || existingMovie.genres || [],
        downloadUrls:
          movieData.downloadUrls || existingMovie.downloadUrls || [],
        spotlight:
          movieData.spotlight !== undefined
            ? movieData.spotlight
            : existingMovie.spotlight,
      };

      console.log("Updated data being saved:", updatedData);

      // Handle new vertical poster upload
      if (
        req.files &&
        req.files["posterVertical"] &&
        req.files["posterVertical"][0]
      ) {
        // Delete old image from Cloudinary if it exists
        if (existingMovie.posterVertical?.public_id) {
          try {
            await cloudinary.uploader.destroy(
              existingMovie.posterVertical.public_id,
            );
          } catch (cloudinaryError) {
            console.error(
              "Error deleting old vertical poster:",
              cloudinaryError,
            );
          }
        }

        updatedData.posterVertical = {
          public_id: req.files["posterVertical"][0].filename,
          url: req.files["posterVertical"][0].path,
        };
      } else {
        // Keep existing poster if no new upload
        updatedData.posterVertical = existingMovie.posterVertical;
      }

      // Handle new horizontal poster upload
      if (
        req.files &&
        req.files["posterHorizontal"] &&
        req.files["posterHorizontal"][0]
      ) {
        // Delete old image from Cloudinary if it exists
        if (existingMovie.posterHorizontal?.public_id) {
          try {
            await cloudinary.uploader.destroy(
              existingMovie.posterHorizontal.public_id,
            );
          } catch (cloudinaryError) {
            console.error(
              "Error deleting old horizontal poster:",
              cloudinaryError,
            );
          }
        }

        updatedData.posterHorizontal = {
          public_id: req.files["posterHorizontal"][0].filename,
          url: req.files["posterHorizontal"][0].path,
        };
      } else {
        // Keep existing poster if no new upload
        updatedData.posterHorizontal = existingMovie.posterHorizontal;
      }

      // Use findByIdAndUpdate with $set to avoid schema validation issues
      const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true, runValidators: true },
      );

      console.log("Movie updated successfully:", movie._id);
      res.json(movie);
    } catch (error) {
      console.error("Error updating movie:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
      });

      // Send a more detailed error response
      res.status(500).json({
        message: "Server error",
        error: error.message,
        details: error.stack,
      });
    }
  },
);

// Delete movie (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    // Delete images from Cloudinary
    if (movie.posterVertical?.public_id) {
      await cloudinary.uploader.destroy(movie.posterVertical.public_id);
    }
    if (movie.posterHorizontal?.public_id) {
      await cloudinary.uploader.destroy(movie.posterHorizontal.public_id);
    }

    await movie.deleteOne();
    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Search movies by title, description, or genre
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const searchRegex = new RegExp(query, "i");

    const movies = await Movie.find({
      $or: [{ title: searchRegex }, { description: searchRegex }],
    })
      .populate("genres")
      .limit(20)
      .sort({ views: -1 });

    res.json(movies);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
