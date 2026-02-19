import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMovies } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Comments from "../components/common/Comments";
import { toast } from "react-toastify";
import {
  BookmarkIcon as BookmarkOutline,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import MovieCard from "../components/common/MovieCard";

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    getMovieById,
    addToWatchlist,
    removeFromWatchlist,
    movies,
    tvSeries,
    anime,
  } = useMovies();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [popular, setPopular] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (movie) {
      checkIfSaved();
      getRecommendations();
      getPopular();
    }
  }, [movie]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMovieById(id);

      // Ensure all fields exist with defaults to prevent rendering errors
      const safeMovie = {
        ...data,
        language: data?.language || "",
        duration: data?.duration || "",
        ageRating: data?.ageRating || "PG-13",
        quality: data?.quality || "HD",
        imdbRating: data?.imdbRating || null,
        downloadUrls: data?.downloadUrls || [],
        posterVertical: data?.posterVertical || { url: "" },
        posterHorizontal: data?.posterHorizontal || { url: "" },
      };

      setMovie(safeMovie);
    } catch (error) {
      console.error("Error fetching movie:", error);
      setError(error.message || "Failed to load movie details");
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = () => {
    setIsSaved(false);
  };

  const getRecommendations = () => {
    if (!movie) return;

    let sourceMovies = [];
    if (movie.type === "movie") sourceMovies = movies;
    else if (movie.type === "tv-series") sourceMovies = tvSeries;
    else if (movie.type === "anime") sourceMovies = anime;

    const filtered = sourceMovies
      .filter((m) => m._id !== movie._id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    setRecommendations(filtered);
  };

  const getPopular = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies/popular`,
      );
      setPopular(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch popular movies");
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      toast.info("Please login to add to watchlist");
      return;
    }

    if (isSaved) {
      await removeFromWatchlist(movie._id);
      setIsSaved(false);
    } else {
      await addToWatchlist(movie._id);
      setIsSaved(true);
    }
  };

  const getAgeRatingColor = (rating) => {
    const colors = {
      G: "bg-green-500/20 text-green-500",
      PG: "bg-blue-500/20 text-blue-500",
      "PG-13": "bg-yellow-500/20 text-yellow-500",
      R: "bg-red-500/20 text-red-500",
      "NC-17": "bg-purple-500/20 text-purple-500",
      "TV-MA": "bg-red-500/20 text-red-500",
      "TV-14": "bg-orange-500/20 text-orange-500",
      "TV-PG": "bg-blue-500/20 text-blue-500",
      "TV-Y": "bg-green-500/20 text-green-500",
    };
    return colors[rating] || "bg-primary/20 text-primary";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl mb-4 text-primary">Movie Not Found</h1>
        <p className="text-secondary mb-6">
          {error ||
            "The movie you're looking for doesn't exist or couldn't be loaded."}
        </p>
        <Link
          to="/"
          className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000]"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const isTvOrAnime = movie.type === "tv-series" || movie.type === "anime";

  // Get the horizontal poster URL safely
  const horizontalPosterUrl =
    movie.posterHorizontal?.url ||
    (typeof movie.posterHorizontal === "string" ? movie.posterHorizontal : "");

  return (
    <div className="min-h-screen bg-dark relative">
      {/* Blurred Background Image - Only show if poster exists */}
      {horizontalPosterUrl && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${horizontalPosterUrl})`,
              filter: "blur(20px)",
              transform: "scale(1.1)",
              opacity: "0.15",
            }}
          />
          <div className="absolute inset-0 bg-dark/50" />
        </div>
      )}

      {/* Main Hero Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Poster */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="sticky top-24">
              <img
                src={
                  movie.posterVertical?.url ||
                  (typeof movie.posterVertical === "string"
                    ? `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
                    : "")
                }
                alt={movie.title}
                className="w-full rounded-2xl shadow-2xl border border-primary/20"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback-poster.png"; // Add a fallback image
                }}
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-4">
              <Link
                to="/"
                className="text-secondary hover:text-primary transition-colors"
              >
                Home
              </Link>
              <span className="text-secondary/40">›</span>
              <Link
                to={`/${movie.type === "movie" ? "movies" : movie.type === "tv-series" ? "tv-series" : "anime"}`}
                className="text-secondary hover:text-primary transition-colors"
              >
                {movie.type === "movie"
                  ? "Movies"
                  : movie.type === "tv-series"
                    ? "TV Series"
                    : "Anime"}
              </Link>
              <span className="text-secondary/40">›</span>
              <span className="text-primary truncate">{movie.title}</span>
            </nav>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-['Bebas_Neue'] text-primary mb-4">
              {movie.title}
            </h1>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                {movie.type === "movie"
                  ? "Movie"
                  : movie.type === "tv-series"
                    ? "TV Series"
                    : "Anime"}
              </span>

              {movie.duration && (
                <span className="flex items-center text-secondary bg-white/5 px-3 py-1 rounded-full text-sm">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {movie.duration}
                </span>
              )}

              {movie.ageRating && (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getAgeRatingColor(movie.ageRating)}`}
                >
                  {movie.ageRating}
                </span>
              )}

              {movie.quality && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm">
                  {movie.quality}
                </span>
              )}

              {/* Language Display */}
              {movie.language && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full text-sm">
                  {movie.language}
                </span>
              )}

              {movie.imdbRating && (
                <span className="flex items-center text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-sm">
                  <StarIcon className="w-4 h-4 mr-1 fill-current" />
                  {movie.imdbRating}/10
                </span>
              )}
            </div>

            {/* Description with Toggle */}
            <div className="mb-6">
              <p
                className={`text-secondary/80 leading-relaxed ${!showFullDescription ? "line-clamp-4" : ""}`}
              >
                {movie.description}
              </p>
              {movie.description && movie.description.length > 300 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="flex items-center text-primary hover:text-primary/80 transition-colors mt-2 text-sm"
                >
                  {showFullDescription ? (
                    <>
                      Show less <ChevronUpIcon className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDownIcon className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Download Buttons Section */}
            {movie.downloadUrls && movie.downloadUrls.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary mb-3">
                  Download Options
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {movie.downloadUrls.map((download, index) => (
                    <React.Fragment key={index}>
                      <a
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            download.url,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                        className="group relative bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-sm border border-primary/30 rounded-xl px-4 py-2 hover:border-primary transition-all hover:scale-105 cursor-pointer"
                      >
                        <div className="flex flex-col items-center">
                          {/* Show episode/title for TV/Anime */}
                          {isTvOrAnime && download.episode && (
                            <span className="text-xs text-white/80 mb-1">
                              {download.episode}
                            </span>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-primary">
                              {download.quality}
                            </span>
                            {download.size && (
                              <>
                                <span className="text-white/20">|</span>
                                <span className="text-xs text-secondary/60">
                                  {download.size} {download.sizeUnit || "GB"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                      </a>
                    </React.Fragment>
                  ))}

                  {/* Save to Watchlist Button */}
                  <button
                    onClick={handleSaveToggle}
                    className="group relative bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 rounded-xl p-2 hover:border-primary transition-all hover:scale-105 ml-2"
                  >
                    {isSaved ? (
                      <BookmarkSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <BookmarkOutline className="w-5 h-5 text-white/80 group-hover:text-primary" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 w-fit">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-dark"
                  />
                ))}
              </div>
              <button className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors">
                <ShareIcon className="w-5 h-5" />
                <span className="font-medium">Share Movie to your friends</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations and Popular Section */}
      {(recommendations.length > 0 || popular.length > 0) && (
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recommendations */}
            {recommendations.length > 0 && (
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-['Bebas_Neue'] text-primary mb-6">
                  Recommended for you
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <MovieCard key={rec._id} movie={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Right Column - Most Popular */}
            {popular.length > 0 && (
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-['Bebas_Neue'] text-primary mb-4">
                  Most Popular
                </h2>
                <div className="space-y-3">
                  {popular.map((item, index) => (
                    <Link
                      key={item._id}
                      to={`/movie/${item._id}`}
                      className="flex items-center space-x-3 p-2 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all group"
                    >
                      <span className="text-2xl font-bold text-primary/40 group-hover:text-primary/60 w-8 text-center">
                        #{index + 1}
                      </span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.posterVertical?.url ||
                            `${import.meta.env.VITE_BACKEND_URL}${item.posterVertical}`
                          }
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-white truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-secondary/60">
                          {item.type === "movie"
                            ? "Movie"
                            : item.type === "tv-series"
                              ? "TV Series"
                              : "Anime"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <Comments movieId={id} />
      </div>
    </div>
  );
};

export default MovieDetails;
