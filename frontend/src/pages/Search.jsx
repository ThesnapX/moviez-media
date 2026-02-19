import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMovies } from "../context/MovieContext";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import MovieCard from "../components/common/MovieCard";
import FilterSidebar from "../components/search/FilterSidebar";
import axios from "axios";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { movies, tvSeries, anime } = useMovies();

  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState(null); // New genre filter
  const [sortBy, setSortBy] = useState("relevance");
  const [localSearchInput, setLocalSearchInput] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [randomResults, setRandomResults] = useState([]);

  const [pageResults, setPageResults] = useState([]);
  const [isPageSearching, setIsPageSearching] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Generate random results when no query
  useEffect(() => {
    if (!query && !localSearchInput) {
      const allContent = [...movies, ...tvSeries, ...anime];
      const shuffled = [...allContent].sort(() => 0.5 - Math.random());
      setRandomResults(shuffled.slice(0, 12));
    }
  }, [movies, tvSeries, anime, query, localSearchInput]);

  // Live search with debounce
  useEffect(() => {
    if (!localSearchInput || localSearchInput.length < 2) {
      setPageResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const fetchSearch = async () => {
        setIsPageSearching(true);
        try {
          const response = await axios.get(
            `${backendUrl}/api/movies/search/${encodeURIComponent(
              localSearchInput,
            )}`,
          );
          setPageResults(response.data);
        } catch (error) {
          console.error("Search error:", error);
          setPageResults([]);
        } finally {
          setIsPageSearching(false);
        }
      };

      fetchSearch();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [localSearchInput]);

  // Sync URL query with input
  useEffect(() => {
    if (query && query !== localSearchInput) {
      setLocalSearchInput(query);
    }
  }, [query]);

  // Filter + Sort + Genre
  useEffect(() => {
    const resultsToFilter =
      localSearchInput.length >= 2 ? pageResults : randomResults;

    if (!resultsToFilter || resultsToFilter.length === 0) {
      setFilteredResults([]);
      return;
    }

    let filtered = [...resultsToFilter];

    // Apply type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((item) => item.type === selectedFilter);
    }

    // Apply genre filter - NEW
    if (selectedGenre) {
      filtered = filtered.filter(
        (item) =>
          item.genres &&
          item.genres.some(
            (g) => g._id === selectedGenre || g === selectedGenre,
          ),
      );
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
        break;
    }

    setFilteredResults(filtered);
  }, [
    localSearchInput,
    pageResults,
    randomResults,
    selectedFilter,
    selectedGenre,
    sortBy,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchInput.trim()) {
      setSearchParams({ q: localSearchInput.trim() });
    }
  };

  const handleInputChange = (e) => {
    setLocalSearchInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && localSearchInput.trim()) {
      setSearchParams({ q: localSearchInput.trim() });
    }
  };

  const sortOptions = [
    { id: "relevance", label: "Relevance" },
    { id: "rating", label: "Rating" },
    { id: "year", label: "Year" },
    { id: "views", label: "Popularity" },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.id === sortBy);
    return option ? option.label : "Relevance";
  };

  const results = localSearchInput.length >= 2 ? pageResults : randomResults;
  const displayResults = filteredResults;

  // Get active filter labels for display
  const getFilterLabel = () => {
    const filters = {
      all: "All",
      movie: "Movies",
      "tv-series": "TV Series",
      anime: "Anime",
    };
    return filters[selectedFilter] || "All";
  };

  return (
    <div className="min-h-screen bg-dark">
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-dark/95 backdrop-blur-md border-b border-primary/20 px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 bg-[#2a2a2a] text-secondary rounded-xl border border-primary/20 hover:bg-primary/20 hover:text-primary transition-colors"
            aria-label="Open filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="search"
                value={localSearchInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search movies, TV series, anime..."
                className="w-full bg-[#2a2a2a] text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/60" />
            </form>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedFilter !== "all" || selectedGenre) && (
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <span className="text-secondary/60">Active filters:</span>
            {selectedFilter !== "all" && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                {getFilterLabel()}
              </span>
            )}
            {selectedGenre && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                Genre filter active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-secondary/60">
            {isPageSearching
              ? "Searching..."
              : `${displayResults.length} ${
                  displayResults.length === 1 ? "result" : "results"
                } ${
                  localSearchInput.length >= 2
                    ? `for "${localSearchInput}"`
                    : "(random)"
                }`}
          </p>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#2a2a2a] text-secondary rounded-lg border border-primary/20 text-sm hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <span>Sort: {getSortLabel()}</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-[#2a2a2a] rounded-lg border border-primary/20 overflow-hidden z-20 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sortBy === option.id
                        ? "bg-primary text-white"
                        : "text-secondary hover:bg-primary/20 hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isPageSearching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {displayResults.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-primary/20">
            <MagnifyingGlassIcon className="w-16 h-16 text-primary/30 mx-auto mb-3" />
            <h2 className="text-lg text-secondary mb-2">No results found</h2>
            <p className="text-sm text-secondary/60">
              {localSearchInput.length >= 2
                ? `We couldn't find any matches for "${localSearchInput}"`
                : "Try searching for something or adjust your filters"}
            </p>
            {(selectedFilter !== "all" || selectedGenre) && (
              <button
                onClick={() => {
                  setSelectedFilter("all");
                  setSelectedGenre(null);
                }}
                className="mt-4 px-4 py-2 bg-[#2a2a2a] text-secondary rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
