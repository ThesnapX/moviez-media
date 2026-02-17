import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useMovies } from "../context/MovieContext";
import {
  MagnifyingGlassIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  StarIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MovieCard from "../components/common/MovieCard";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchResults, isSearching, performSearch, setSearchQuery } =
    useSearch();
  const { movies, tvSeries, anime } = useMovies();

  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  useEffect(() => {
    if (searchResults.length > 0) {
      let filtered = [...searchResults];

      // Apply type filter
      if (selectedFilter !== "all") {
        filtered = filtered.filter((item) => item.type === selectedFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case "rating":
          filtered.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
          break;
        case "year":
          filtered.sort((a, b) => {
            const yearA = a.releaseDate
              ? new Date(a.releaseDate).getFullYear()
              : 0;
            const yearB = b.releaseDate
              ? new Date(b.releaseDate).getFullYear()
              : 0;
            return yearB - yearA;
          });
          break;
        case "views":
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        default:
          // Keep as is (relevance)
          break;
      }

      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [searchResults, selectedFilter, sortBy]);

  const getTypeCount = (type) => {
    return searchResults.filter((item) => item.type === type).length;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newQuery = formData.get("search");
    if (newQuery) {
      setSearchParams({ q: newQuery });
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-dark py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <MagnifyingGlassIcon className="w-24 h-24 text-primary/30 mx-auto mb-4" />
            <h1 className="text-4xl text-primary mb-2 tracking-wide">Search</h1>
            <p className="text-secondary/60 mb-8">
              Search for movies, TV series, or anime
            </p>

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                placeholder="Enter your search query..."
                className="w-full bg-[#2a2a2a] text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary/60" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-primary mb-2 tracking-wide">
            Search Results
          </h1>
          <p className="text-secondary/60">
            {isSearching ? (
              "Searching..."
            ) : (
              <>
                Found {searchResults.length} results for "{query}"
              </>
            )}
          </p>
        </div>

        {/* Filters and Sort */}
        {!isSearching && searchResults.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-8 border border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Type Filters */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-secondary/60" />
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  All ({searchResults.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("movie")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === "movie"
                      ? "bg-primary text-white"
                      : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  Movies ({getTypeCount("movie")})
                </button>
                <button
                  onClick={() => setSelectedFilter("tv-series")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === "tv-series"
                      ? "bg-primary text-white"
                      : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  TV Series ({getTypeCount("tv-series")})
                </button>
                <button
                  onClick={() => setSelectedFilter("anime")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFilter === "anime"
                      ? "bg-primary text-white"
                      : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  Anime ({getTypeCount("anime")})
                </button>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary/60">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#2a2a2a] text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                  <option value="views">Popularity</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {isSearching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredResults.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-primary/20">
            <MagnifyingGlassIcon className="w-24 h-24 text-primary/30 mx-auto mb-4" />
            <h2 className="text-2xl text-secondary mb-2">No results found</h2>
            <p className="text-secondary/60 mb-6">
              We couldn't find any matches for "{query}"
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/movies"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
              >
                Browse Movies
              </Link>
              <button
                onClick={() => setSearchParams({})}
                className="bg-[#2a2a2a] text-secondary px-6 py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
