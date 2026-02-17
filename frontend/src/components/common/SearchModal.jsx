import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  FireIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon as MagnifyingGlassSolid } from "@heroicons/react/24/solid";

const SearchModal = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch,
    clearSearch,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    showSearchModal,
    setShowSearchModal,
  } = useSearch();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (showSearchModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearchModal]);

  // Close modal on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSearchModal(false);
      }
    };

    if (showSearchModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchModal]);

  const handleMovieClick = (movieId) => {
    setShowSearchModal(false);
    navigate(`/movie/${movieId}`);
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "movie":
        return <FilmIcon className="w-4 h-4" />;
      case "tv-series":
        return <TvIcon className="w-4 h-4" />;
      case "anime":
        return <RocketLaunchIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!showSearchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 blur-backdrop animate-fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#1a1a1a] rounded-2xl border border-primary/20 shadow-2xl overflow-hidden animate-slide-down"
      >
        {/* Search Input */}
        <div className="relative border-b border-primary/20">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary/60" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV series, anime..."
            className="w-full bg-transparent text-white pl-12 pr-12 py-4 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary/60 hover:text-primary transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : searchQuery.length >= 2 ? (
            // Search Results
            <div className="p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-secondary/60 mb-2">
                    Found {searchResults.length} results
                  </p>
                  {searchResults.map((movie) => (
                    <div
                      key={movie._id}
                      onClick={() => handleMovieClick(movie._id)}
                      className="flex items-center space-x-4 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors cursor-pointer group"
                    >
                      {/* Poster */}
                      <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            movie.posterVertical?.url ||
                            `${backendUrl}${movie.posterVertical}`
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                          {movie.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-secondary/60">
                            {getTypeIcon(movie.type)}
                            <span className="capitalize">
                              {movie.type.replace("-", " ")}
                            </span>
                          </div>
                          {movie.releaseDate && (
                            <>
                              <span className="text-secondary/40">•</span>
                              <span className="text-xs text-secondary/60">
                                {new Date(movie.releaseDate).getFullYear()}
                              </span>
                            </>
                          )}
                          {movie.imdbRating && (
                            <>
                              <span className="text-secondary/40">•</span>
                              <span className="text-xs text-yellow-500 flex items-center">
                                <StarIcon className="w-3 h-3 mr-1" />
                                {movie.imdbRating}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-secondary/40 mt-1 line-clamp-1">
                          {movie.description}
                        </p>
                      </div>

                      {/* Type Badge */}
                      <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {movie.quality || "HD"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MagnifyingGlassIcon className="w-16 h-16 text-primary/30 mx-auto mb-3" />
                  <p className="text-secondary">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-sm text-secondary/60 mt-1">
                    Try checking your spelling or use different keywords
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Recent Searches & Suggestions
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-secondary/80 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Recent Searches
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((query, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between group"
                      >
                        <button
                          onClick={() => handleRecentSearchClick(query)}
                          className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors"
                        >
                          <ClockIcon className="w-4 h-4" />
                          <span>{query}</span>
                        </button>
                        <button
                          onClick={() => removeRecentSearch(query)}
                          className="opacity-0 group-hover:opacity-100 text-secondary/40 hover:text-primary transition-all"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <h4 className="text-sm font-medium text-secondary/80 flex items-center mb-3">
                  <FireIcon className="w-4 h-4 mr-2" />
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Action",
                    "Comedy",
                    "Drama",
                    "Horror",
                    "Sci-Fi",
                    "Anime",
                    "Marvel",
                    "DC",
                    "Netflix",
                    "Hindi",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-3 py-1 bg-[#2a2a2a] text-secondary rounded-full text-sm hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Tips */}
              <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                <h5 className="text-sm text-primary mb-2">💡 Search Tips</h5>
                <ul className="text-xs text-secondary/60 space-y-1">
                  <li>• Type at least 2 characters to search</li>
                  <li>• Search by movie title or description</li>
                  <li>• Click on recent searches to search again</li>
                  <li>• Press ESC to close search</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-primary/20 p-3 text-xs text-secondary/40 text-center">
          Press ESC to close • Type to search
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
