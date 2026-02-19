const mongoose = require("mongoose");

const downloadUrlSchema = new mongoose.Schema({
  episode: {
    type: String,
    default: "",
  },
  quality: {
    type: String,
    enum: ["360p", "480p", "720p", "1080p", "4K"],
    required: true,
  },
  size: {
    type: String,
    default: "",
  },
  sizeUnit: {
    type: String,
    enum: ["MB", "GB"],
    default: "GB",
  },
  url: {
    type: String,
    required: true,
  },
});

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["movie", "tv-series", "anime"],
    required: true,
  },

  releaseDate: {
    type: Date,
    required: true,
  },

  duration: {
    type: String,
    default: "",
  },

  ageRating: {
    type: String,
    enum: [
      "G",
      "PG",
      "PG-13",
      "R",
      "NC-17",
      "TV-Y",
      "TV-Y7",
      "TV-G",
      "TV-PG",
      "TV-14",
      "TV-MA",
    ],
    default: "PG-13",
  },

  quality: {
    type: String,
    enum: ["HD", "FHD", "WebRIP", "BluRay", "DVD", "CAM", "TS", "HDTV"],
    default: "HD",
  },

  language: {
    type: String,
    default: "",
  },

  posterVertical: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },

  posterHorizontal: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },

  imdbRating: {
    type: Number,
    min: 0,
    max: 10,
  },

  genres: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
      },
    ],
    validate: [(arr) => arr.length > 0, "At least one genre is required"],
  },

  downloadUrls: [downloadUrlSchema],

  spotlight: {
    type: Boolean,
    default: false,
  },

  views: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* 🔥 Performance Indexes */
movieSchema.index({ type: 1 });
movieSchema.index({ spotlight: 1 });
movieSchema.index({ views: -1 });

module.exports = mongoose.model("Movie", movieSchema);
