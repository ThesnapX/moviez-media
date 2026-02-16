const mongoose = require("mongoose");

const downloadUrlSchema = new mongoose.Schema({
  quality: {
    type: String,
    enum: ["360p", "480p", "720p", "1080p", "4K"],
    required: true,
  },
  size: String,
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
  posterVertical: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  posterHorizontal: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  imdbRating: {
    type: Number,
    min: 0,
    max: 10,
  },
  genres: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
    },
  ],
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

module.exports = mongoose.model("Movie", movieSchema);
