import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const RequestMovie = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      type: "movie",
      releaseYear: "",
    },
  });

  // Watch form values for preview
  const watchedTitle = watch("title");
  const watchedType = watch("type");
  const watchedReleaseYear = watch("releaseYear");

  // Helper function to get full profile image URL
  const getProfileImageUrl = (profilePath) => {
    if (!profilePath) return null;
    if (profilePath.startsWith("http")) return profilePath;
    const normalizedPath = profilePath.startsWith("/")
      ? profilePath
      : `/${profilePath}`;
    return `${backendUrl}${normalizedPath}`;
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("Please login to request a movie");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/requests`, data);
      toast.success("Your request has been submitted successfully!");
      reset();
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-24 h-24 text-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-['Bebas_Neue'] text-primary mb-2">
            Request Movie
          </h1>
          <p className="text-secondary mb-6">Please login to request a movie</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-['Bebas_Neue'] text-primary mb-3">
              Request a Movie / TV Series / Anime
            </h1>
            <p className="text-secondary/80">
              Can't find what you're looking for? Let us know and we'll try to
              add it to our collection!
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-primary/20">
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                {user.profilePicture ? (
                  <img
                    src={getProfileImageUrl(user.profilePicture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-primary/20 flex items-center justify-center">
                          <span class="text-primary text-lg font-semibold">
                            ${user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-lg font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-sm text-secondary/60">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#1a1a1a] rounded-2xl border border-primary/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <div>
                <label className="block text-secondary mb-2 font-medium">
                  Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 2,
                      message: "Title must be at least 2 characters",
                    },
                  })}
                  placeholder="e.g., Inception, Breaking Bad, Attack on Titan"
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                />
                {errors.title && (
                  <p className="text-primary text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-secondary mb-2 font-medium">
                  Type <span className="text-primary">*</span>
                </label>
                <select
                  {...register("type", { required: "Type is required" })}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                >
                  <option value="movie">Movie</option>
                  <option value="tv-series">TV Series</option>
                  <option value="anime">Anime</option>
                </select>
                {errors.type && (
                  <p className="text-primary text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              {/* Release Year Field */}
              <div>
                <label className="block text-secondary mb-2 font-medium">
                  Release Year (Optional)
                </label>
                <input
                  type="number"
                  {...register("releaseYear", {
                    min: {
                      value: 1900,
                      message: "Year must be 1900 or later",
                    },
                    max: {
                      value: new Date().getFullYear() + 5,
                      message: `Year cannot be later than ${
                        new Date().getFullYear() + 5
                      }`,
                    },
                  })}
                  placeholder={`e.g., 2023`}
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
                />
                {errors.releaseYear && (
                  <p className="text-primary text-sm mt-1">
                    {errors.releaseYear.message}
                  </p>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20 mt-4">
                <h3 className="text-sm font-medium text-secondary mb-3">
                  Request Preview
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {watchedType === "movie" && (
                      <FilmIcon className="w-5 h-5 text-primary" />
                    )}
                    {watchedType === "tv-series" && (
                      <TvIcon className="w-5 h-5 text-primary" />
                    )}
                    {watchedType === "anime" && (
                      <RocketLaunchIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {watchedTitle || "Your title here"}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-secondary/60">
                      <span className="capitalize">
                        {watchedType?.replace("-", " ")}
                      </span>
                      {watchedReleaseYear && (
                        <>
                          <span>•</span>
                          <span>{watchedReleaseYear}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-sm text-secondary/60">
            <p>
              Your request will be reviewed by our team. You'll receive an email
              notification when it's approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestMovie;
