import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const PostTab = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "movie",
    releaseDate: "",
    duration: "",
    ageRating: "PG-13",
    quality: "HD",
    language: "", // New language field
    imdbRating: "",
    genres: [],
    downloadUrls: [
      {
        episode: "",
        quality: "1080p",
        size: "",
        sizeUnit: "GB",
        url: "",
      },
    ],
    spotlight: false,
  });

  // File states
  const [verticalPoster, setVerticalPoster] = useState(null);
  const [horizontalPoster, setHorizontalPoster] = useState(null);
  const [verticalPreview, setVerticalPreview] = useState("");
  const [horizontalPreview, setHorizontalPreview] = useState("");

  // New states for upload preview
  const [verticalUploadPreview, setVerticalUploadPreview] = useState("");
  const [horizontalUploadPreview, setHorizontalUploadPreview] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showModal) {
        setShowModal(false);
        resetForm();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [showModal]);

  const fetchData = async () => {
    try {
      const [moviesRes, genresRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/movies`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/genres`),
      ]);
      setMovies(moviesRes.data);
      setGenres(genresRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      toast.error("Only image files are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "vertical") {
        setVerticalPreview(reader.result);
        setVerticalUploadPreview(reader.result);
        setVerticalPoster(file);
      } else {
        setHorizontalPreview(reader.result);
        setHorizontalUploadPreview(reader.result);
        setHorizontalPoster(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate files for new posts
    if (!editingMovie) {
      if (!verticalPoster) {
        toast.error("Please select vertical poster");
        return;
      }
      if (!horizontalPoster) {
        toast.error("Please select horizontal poster");
        return;
      }
    }

    setUploading(true);

    try {
      const submitData = new FormData();

      // Append files
      if (verticalPoster) {
        submitData.append("posterVertical", verticalPoster);
      }
      if (horizontalPoster) {
        submitData.append("posterHorizontal", horizontalPoster);
      }

      // Debug: Check what's being saved
      console.log("Saving download URLs:", formData.downloadUrls);
      console.log("Language:", formData.language);

      // Append form data as JSON string
      submitData.append("data", JSON.stringify(formData));

      if (editingMovie) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/movies/${editingMovie._id}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Movie updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/movies`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        toast.success("Movie added successfully");
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save movie");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies/${movieId}`,
      );
      toast.success("Movie deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete movie");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "movie",
      releaseDate: "",
      duration: "",
      ageRating: "PG-13",
      quality: "HD",
      language: "", // Reset language field
      imdbRating: "",
      genres: [],
      downloadUrls: [
        {
          episode: "",
          quality: "1080p",
          size: "",
          sizeUnit: "GB",
          url: "",
        },
      ],
      spotlight: false,
    });
    setVerticalPoster(null);
    setHorizontalPoster(null);
    setVerticalPreview("");
    setHorizontalPreview("");
    setVerticalUploadPreview("");
    setHorizontalUploadPreview("");
    setEditingMovie(null);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);

    // Format download URLs with proper size and unit separation
    const downloadUrls = movie.downloadUrls?.map((url) => {
      // If the movie already has separate size and sizeUnit fields, use them
      if (url.sizeUnit) {
        return {
          ...url,
          episode: url.episode || "",
          size: url.size || "",
          sizeUnit: url.sizeUnit,
        };
      }

      // For backward compatibility: parse size string if it contains unit
      let sizeValue = url.size || "";
      let sizeUnit = "GB"; // default

      if (url.size) {
        // Extract unit from size string if it exists
        const unitMatch = url.size.match(/(MB|GB)$/i);
        if (unitMatch) {
          sizeUnit = unitMatch[0].toUpperCase();
          sizeValue = url.size.replace(/(MB|GB)$/i, "").trim();
        }
      }

      return {
        ...url,
        episode: url.episode || "",
        size: sizeValue,
        sizeUnit: sizeUnit,
      };
    }) || [
      {
        episode: "",
        quality: "1080p",
        size: "",
        sizeUnit: "GB",
        url: "",
      },
    ];

    setFormData({
      title: movie.title,
      description: movie.description,
      type: movie.type,
      releaseDate: movie.releaseDate.split("T")[0],
      duration: movie.duration || "",
      ageRating: movie.ageRating || "PG-13",
      quality: movie.quality || "HD",
      language: movie.language || "", // Set language from movie data
      imdbRating: movie.imdbRating,
      genres: movie.genres.map((g) => g._id || g),
      downloadUrls,
      spotlight: movie.spotlight,
    });

    setVerticalPreview(
      `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical.url}`,
    );
    setHorizontalPreview(
      `${import.meta.env.VITE_BACKEND_URL}${movie.posterHorizontal.url}`,
    );
    setShowModal(true);
  };

  const addDownloadUrl = () => {
    setFormData({
      ...formData,
      downloadUrls: [
        ...formData.downloadUrls,
        { episode: "", quality: "1080p", size: "", sizeUnit: "GB", url: "" },
      ],
    });
  };

  const removeDownloadUrl = (index) => {
    const newUrls = formData.downloadUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, downloadUrls: newUrls });
  };

  const updateDownloadUrl = (index, field, value) => {
    const newUrls = [...formData.downloadUrls];
    newUrls[index] = {
      ...newUrls[index],
      [field]: value,
    };

    // If updating size, make sure it's a clean number without units
    if (field === "size") {
      // Remove any units that might have been typed
      const cleanSize = value.replace(/[^0-9.]/g, "");
      newUrls[index].size = cleanSize;
    }

    setFormData({ ...formData, downloadUrls: newUrls });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-primary">Manage Posts</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Post</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start sm:items-center justify-center min-h-screen p-2 sm:p-4">
            <div
              className="fixed inset-0 blur-backdrop"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            ></div>
            <div className="relative bg-[#1a1a1a] rounded-lg w-full max-w-3xl p-4 sm:p-6 border border-primary/20 max-h-[98vh] sm:max-h-[90vh] overflow-y-auto mt-16 sm:mt-0">
              {/* Header with sticky on mobile */}
              <div className="sticky top-0 bg-[#1a1a1a] z-10 pb-2 mb-2 border-b border-primary/20">
                <h3 className="text-lg sm:text-xl text-primary pr-8">
                  {editingMovie ? "Edit Post" : "Add New Post"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors z-20"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-secondary mb-1 text-sm sm:text-base">
                      Title <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-secondary mb-1 text-sm sm:text-base">
                      Type <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                      required
                    >
                      <option value="movie">Movie</option>
                      <option value="tv-series">TV Series</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-secondary mb-1 text-sm sm:text-base">
                    Description <span className="text-primary">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="4"
                    className="w-full bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Date and Details */}
                {/* Date and Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-secondary mb-1 text-sm sm:text-base">
                      Release Date <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          releaseDate: e.target.value,
                        })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
                    <div>
                      <label className="block text-secondary mb-1 text-sm sm:text-base">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        placeholder="e.g., 2h 30m"
                        className="w-full bg-[#2a2a2a] text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-secondary mb-1 text-sm sm:text-base">
                        Age Rating
                      </label>
                      <select
                        value={formData.ageRating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ageRating: e.target.value,
                          })
                        }
                        className="w-full bg-[#2a2a2a] text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                      >
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                        <option value="TV-Y">TV-Y</option>
                        <option value="TV-Y7">TV-Y7</option>
                        <option value="TV-G">TV-G</option>
                        <option value="TV-PG">TV-PG</option>
                        <option value="TV-14">TV-14</option>
                        <option value="TV-MA">TV-MA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-secondary mb-1 text-sm sm:text-base">
                        Quality
                      </label>
                      <select
                        value={formData.quality}
                        onChange={(e) =>
                          setFormData({ ...formData, quality: e.target.value })
                        }
                        className="w-full bg-[#2a2a2a] text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                      >
                        <option value="HD">HD</option>
                        <option value="FHD">FHD</option>
                        <option value="WebRIP">WebRIP</option>
                        <option value="BluRay">BluRay</option>
                        <option value="DVD">DVD</option>
                        <option value="CAM">CAM</option>
                        <option value="TS">TS</option>
                        <option value="HDTV">HDTV</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Language Field - Full width on its own row */}
                <div className="w-full">
                  <label className="block text-secondary mb-1 text-sm sm:text-base">
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    placeholder="e.g., English, Hindi, Japanese, Spanish"
                    className="w-full bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                  />
                </div>

                {/* IMDB Rating */}
                <div>
                  <label className="block text-secondary mb-1 text-sm sm:text-base">
                    IMDB Rating (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.imdbRating}
                    onChange={(e) => {
                      const value = Math.min(
                        10,
                        Math.max(0, parseFloat(e.target.value) || 0),
                      );
                      setFormData({ ...formData, imdbRating: value });
                    }}
                    className="w-full sm:w-1/2 bg-[#2a2a2a] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm sm:text-base"
                  />
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Vertical Poster */}
                  <div>
                    <label className="block text-secondary mb-1 text-sm sm:text-base">
                      Vertical Poster <span className="text-primary">*</span>
                    </label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-3 sm:p-4 text-center">
                      {verticalPreview || verticalUploadPreview ? (
                        <div className="relative">
                          <img
                            src={verticalUploadPreview || verticalPreview}
                            alt="Vertical preview"
                            className="max-h-32 sm:max-h-40 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVerticalPoster(null);
                              setVerticalPreview("");
                              setVerticalUploadPreview("");
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-secondary/50 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-primary hover:underline text-sm sm:text-base">
                              Click to upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, "vertical")}
                              className="hidden"
                              required={!editingMovie}
                            />
                          </label>
                          <p className="text-xs text-secondary/50 mt-2">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Poster */}
                  <div>
                    <label className="block text-secondary mb-1 text-sm sm:text-base">
                      Horizontal Poster <span className="text-primary">*</span>
                    </label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-3 sm:p-4 text-center">
                      {horizontalPreview || horizontalUploadPreview ? (
                        <div className="relative">
                          <img
                            src={horizontalUploadPreview || horizontalPreview}
                            alt="Horizontal preview"
                            className="max-h-32 sm:max-h-40 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setHorizontalPoster(null);
                              setHorizontalPreview("");
                              setHorizontalUploadPreview("");
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-secondary/50 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-primary hover:underline text-sm sm:text-base">
                              Click to upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, "horizontal")
                              }
                              className="hidden"
                              required={!editingMovie}
                            />
                          </label>
                          <p className="text-xs text-secondary/50 mt-2">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-secondary mb-2 text-sm sm:text-base">
                    Genres <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-[#2a2a2a] rounded-lg border border-primary/20">
                    {genres.map((genre) => (
                      <label
                        key={genre._id}
                        className="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre._id)}
                          onChange={(e) => {
                            const newGenres = e.target.checked
                              ? [...formData.genres, genre._id]
                              : formData.genres.filter(
                                  (id) => id !== genre._id,
                                );
                            setFormData({ ...formData, genres: newGenres });
                          }}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-primary bg-[#2a2a2a] border-primary/20 rounded focus:ring-primary cursor-pointer"
                        />
                        <span className="text-secondary text-xs sm:text-sm">
                          {genre.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.genres.length === 0 && (
                    <p className="text-primary text-xs mt-1">
                      Select at least one genre
                    </p>
                  )}
                </div>

                {/* Download URLs */}
                <div>
                  <label className="block text-secondary mb-2 text-sm sm:text-base">
                    Download URLs <span className="text-primary">*</span>
                  </label>
                  {formData.downloadUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2"
                    >
                      {/* Episode/Title Field - Only show for TV Series and Anime */}
                      {(formData.type === "tv-series" ||
                        formData.type === "anime") && (
                        <input
                          type="text"
                          placeholder="Episode/Title"
                          value={url.episode || ""}
                          onChange={(e) =>
                            updateDownloadUrl(index, "episode", e.target.value)
                          }
                          className="w-full sm:w-32 bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                        />
                      )}
                      <select
                        value={url.quality}
                        onChange={(e) =>
                          updateDownloadUrl(index, "quality", e.target.value)
                        }
                        className="w-full sm:w-24 bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                        required
                      >
                        <option value="360p">360p</option>
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </select>
                      <div className="flex items-center bg-[#2a2a2a] rounded-lg border border-primary/20 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Size"
                          value={url.size}
                          onChange={(e) =>
                            updateDownloadUrl(index, "size", e.target.value)
                          }
                          className="w-full sm:w-20 bg-transparent text-white px-2 py-2 focus:outline-none text-sm"
                        />
                        <select
                          value={url.sizeUnit || "GB"}
                          onChange={(e) =>
                            updateDownloadUrl(index, "sizeUnit", e.target.value)
                          }
                          className="w-16 bg-transparent text-white px-1 py-2 focus:outline-none border-l border-primary/20 text-sm"
                        >
                          <option value="MB">MB</option>
                          <option value="GB">GB</option>
                        </select>
                      </div>
                      <input
                        type="url"
                        placeholder="Download URL"
                        value={url.url}
                        onChange={(e) =>
                          updateDownloadUrl(index, "url", e.target.value)
                        }
                        className="w-full bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeDownloadUrl(index)}
                          className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDownloadUrl}
                    className="mt-2 text-primary hover:underline text-sm"
                  >
                    + Add Another Download Link
                  </button>
                </div>

                {/* Spotlight */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="spotlight"
                    checked={formData.spotlight}
                    onChange={(e) =>
                      setFormData({ ...formData, spotlight: e.target.checked })
                    }
                    className="w-3 h-3 sm:w-4 sm:h-4 text-primary bg-[#2a2a2a] border-primary/20 rounded focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor="spotlight"
                    className="text-secondary text-sm sm:text-base cursor-pointer"
                  >
                    Add to Spotlight (Hero Slider)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={uploading || formData.genres.length === 0}
                    className="w-full sm:flex-1 bg-primary text-white py-3 sm:py-2 rounded-lg hover:bg-[#d00000] transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {uploading
                      ? "Uploading..."
                      : editingMovie
                        ? "Update"
                        : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="w-full sm:flex-1 bg-[#2a2a2a] text-secondary py-3 sm:py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Movies List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="relative group overflow-hidden transition-all"
          >
            {/* Poster Image */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={
                  movie.posterVertical?.url ||
                  `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
                }
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => openEditModal(movie)}
                  className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-full hover:bg-blue-600 transition-colors"
                  title="Edit movie"
                >
                  <PencilIcon className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
                  title="Delete movie"
                >
                  <TrashIcon className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Spotlight Badge */}
              {movie.spotlight && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-primary/80 backdrop-blur-sm text-white text-xs rounded-full">
                    Spotlight
                  </span>
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute bottom-2 left-2 z-10">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full capitalize">
                  {movie.type.replace("-", " ")}
                </span>
              </div>

              {/* Rating Badge */}
              {movie.imdbRating && (
                <div className="absolute bottom-2 right-2 z-10">
                  <span className="px-2 py-1 bg-yellow-500/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
                    ★ {movie.imdbRating}
                  </span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="p-2">
              <h4 className="text-sm text-white truncate text-center">
                {movie.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostTab;
