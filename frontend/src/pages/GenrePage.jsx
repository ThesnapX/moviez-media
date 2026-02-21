import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMovies } from "../context/MovieContext";
import axios from "axios";
import MovieCard from "../components/common/MovieCard";

const GenrePage = () => {
  const { genreId } = useParams();
  const { movies, tvSeries, anime, categories } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState(genreId || null);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, movies, tv, anime

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch genre details if needed
  useEffect(() => {
    if (genreId) {
      setSelectedGenre(genreId);
    }
  }, [genreId]);

  // Filter movies based on selected genre and type
  useEffect(() => {
    // Start with all content
    let allContent = [...movies, ...tvSeries, ...anime];

    // Filter by genre if one is selected
    if (selectedGenre) {
      allContent = allContent.filter(
        (item) =>
          item.genres &&
          item.genres.some(
            (g) => g._id === selectedGenre || g === selectedGenre,
          ),
      );
    }

    // Filter by type
    if (activeTab !== "all") {
      allContent = allContent.filter((item) => item.type === activeTab);
    }

    setFilteredMovies(allContent);
  }, [selectedGenre, activeTab, movies, tvSeries, anime]);

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
  };

  const handleClearGenre = () => {
    setSelectedGenre(null);
  };

  const getGenreName = (id) => {
    const genre = categories.find((g) => g._id === id);
    return genre ? genre.name : "Genre";
  };

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-['Bebas_Neue'] text-primary mb-2">
          {selectedGenre ? getGenreName(selectedGenre) : "All Content"}
        </h1>
        <p className="text-secondary/60 mb-8">
          {selectedGenre
            ? `Explore ${getGenreName(selectedGenre)} content`
            : "Browse all movies, TV series, and anime"}
        </p>

        {/* Genre Buttons - Flex wrap */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-primary">Genres</h2>
            {selectedGenre && (
              <button
                onClick={handleClearGenre}
                className="text-sm text-primary hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((genre) => (
              <button
                key={genre._id}
                onClick={() => handleGenreClick(genre._id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === genre._id
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                    : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-primary/20 pb-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-primary/20 hover:text-primary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("movie")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "movie"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-primary/20 hover:text-primary"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab("tv-series")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "tv-series"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-primary/20 hover:text-primary"
            }`}
          >
            TV Series
          </button>
          <button
            onClick={() => setActiveTab("anime")}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === "anime"
                ? "bg-primary text-white"
                : "text-secondary hover:bg-primary/20 hover:text-primary"
            }`}
          >
            Anime
          </button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-secondary/60 mb-4">
          Found {filteredMovies.length}{" "}
          {filteredMovies.length === 1 ? "item" : "items"}
          {selectedGenre && ` in ${getGenreName(selectedGenre)}`}
        </p>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((item) => (
              <MovieCard key={item._id} movie={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-primary/20">
            <p className="text-secondary/60">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;
