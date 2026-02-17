import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
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
    imdbRating: "",
    genres: [],
    downloadUrls: [{ quality: "1080p", size: "", url: "" }],
    spotlight: false,
  });

  // File states
  const [verticalPoster, setVerticalPoster] = useState(null);
  const [horizontalPoster, setHorizontalPoster] = useState(null);
  const [verticalPreview, setVerticalPreview] = useState("");
  const [horizontalPreview, setHorizontalPreview] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

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
        setVerticalPoster(file);
      } else {
        setHorizontalPreview(reader.result);
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
      imdbRating: "",
      genres: [],
      downloadUrls: [{ quality: "1080p", size: "", url: "" }],
      spotlight: false,
    });
    setVerticalPoster(null);
    setHorizontalPoster(null);
    setVerticalPreview("");
    setHorizontalPreview("");
    setEditingMovie(null);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      type: movie.type,
      releaseDate: movie.releaseDate.split("T")[0],
      imdbRating: movie.imdbRating,
      genres: movie.genres.map((g) => g._id || g),
      downloadUrls: movie.downloadUrls || [
        { quality: "1080p", size: "", url: "" },
      ],
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
        { quality: "1080p", size: "", url: "" },
      ],
    });
  };

  const removeDownloadUrl = (index) => {
    const newUrls = formData.downloadUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, downloadUrls: newUrls });
  };

  const updateDownloadUrl = (index, field, value) => {
    const newUrls = [...formData.downloadUrls];
    newUrls[index][field] = value;
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
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="fixed inset-0 blur-backdrop"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative bg-[#1a1a1a] rounded-lg w-full max-w-3xl p-6 border border-primary/20 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl mb-4 text-primary">
                {editingMovie ? "Edit Post" : "Add New Post"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-secondary mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv-series">TV Series</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="4"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-secondary mb-1">
                      Release Date
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
                      className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {/* Add after Release Date and before IMDB Rating */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-secondary mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        placeholder="e.g., 2h 30m or 24min per ep"
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-secondary mb-1">
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
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                      <label className="block text-secondary mb-1">
                        Quality
                      </label>
                      <select
                        value={formData.quality}
                        onChange={(e) =>
                          setFormData({ ...formData, quality: e.target.value })
                        }
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

                  <div>
                    <label className="block text-secondary mb-1">
                      IMDB Rating (0-10)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.imdbRating}
                      onChange={(e) =>
                        setFormData({ ...formData, imdbRating: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Vertical Poster */}
                  <div>
                    <label className="block text-secondary mb-1">
                      Vertical Poster
                    </label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      {verticalPreview ? (
                        <div className="relative">
                          <img
                            src={verticalPreview}
                            alt="Vertical preview"
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVerticalPoster(null);
                              setVerticalPreview("");
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-12 h-12 text-secondary/50 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-primary hover:underline">
                              Click to upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, "vertical")}
                              className="hidden"
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
                    <label className="block text-secondary mb-1">
                      Horizontal Poster
                    </label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      {horizontalPreview ? (
                        <div className="relative">
                          <img
                            src={horizontalPreview}
                            alt="Horizontal preview"
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setHorizontalPoster(null);
                              setHorizontalPreview("");
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <PhotoIcon className="w-12 h-12 text-secondary/50 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-primary hover:underline">
                              Click to upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, "horizontal")
                              }
                              className="hidden"
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
                  <label className="block text-secondary mb-2">Genres</label>
                  <div className="grid grid-cols-3 gap-2">
                    {genres.map((genre) => (
                      <label
                        key={genre._id}
                        className="flex items-center space-x-2"
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
                          className="w-4 h-4 text-primary bg-[#2a2a2a] border-primary/20 rounded focus:ring-primary"
                        />
                        <span className="text-secondary text-sm">
                          {genre.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Download URLs */}
                <div>
                  <label className="block text-secondary mb-2">
                    Download URLs
                  </label>
                  {formData.downloadUrls.map((url, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <select
                        value={url.quality}
                        onChange={(e) =>
                          updateDownloadUrl(index, "quality", e.target.value)
                        }
                        className="w-24 bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="360p">360p</option>
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Size (e.g., 1.5GB)"
                        value={url.size}
                        onChange={(e) =>
                          updateDownloadUrl(index, "size", e.target.value)
                        }
                        className="w-24 bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="url"
                        placeholder="Download URL"
                        value={url.url}
                        onChange={(e) =>
                          updateDownloadUrl(index, "url", e.target.value)
                        }
                        className="flex-1 bg-[#2a2a2a] text-white px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeDownloadUrl(index)}
                          className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDownloadUrl}
                    className="mt-2 text-primary hover:underline text-sm"
                  >
                    + Add Another Quality
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
                    className="w-4 h-4 text-primary bg-[#2a2a2a] border-primary/20 rounded focus:ring-primary"
                  />
                  <label htmlFor="spotlight" className="text-secondary">
                    Add to Spotlight (Hero Slider)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-[#d00000] transition-colors disabled:opacity-50"
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
                    className="flex-1 bg-[#2a2a2a] text-secondary py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-[#2a2a2a] rounded-lg overflow-hidden border border-primary/20"
          >
            <img
              src={
                movie.posterVertical?.url ||
                `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
              }
              alt={movie.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl  text-white">{movie.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-primary uppercase">
                      {movie.type}
                    </span>
                    {movie.spotlight && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Spotlight
                      </span>
                    )}
                  </div>
                  <p className="text-yellow-500 text-sm mt-1">
                    ★ {movie.imdbRating}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(movie)}
                    className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostTab;
