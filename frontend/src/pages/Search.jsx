import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useMovies } from "../context/MovieContext";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import MovieCard from "../components/common/MovieCard";
import FilterSidebar from "../components/search/FilterSidebar";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchResults, isSearching, performSearch, setSearchQuery } =
    useSearch();
  const { movies, tvSeries, anime } = useMovies();

  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [localSearchInput, setLocalSearchInput] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [randomResults, setRandomResults] = useState([]);

  // Generate random results when no query
  useEffect(() => {
    if (!query) {
      const allContent = [...movies, ...tvSeries, ...anime];
      const shuffled = allContent.sort(() => 0.5 - Math.random());
      setRandomResults(shuffled.slice(0, 12));
    }
  }, [movies, tvSeries, anime]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      setLocalSearchInput(query);
      performSearch(query);
    }
  }, [query]);

  useEffect(() => {
    const resultsToFilter = query ? searchResults : randomResults;

    if (resultsToFilter.length > 0) {
      let filtered = [...resultsToFilter];

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
          break;
      }

      setFilteredResults(filtered);
    } else {
      setFilteredResults([]);
    }
  }, [query, searchResults, randomResults, selectedFilter, sortBy]);

  const getTypeCount = (type) => {
    const results = query ? searchResults : randomResults;
    return results.filter((item) => item.type === type).length;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newQuery = formData.get("search");
    if (newQuery && newQuery.trim()) {
      setSearchParams({ q: newQuery.trim() });
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

  const results = query ? searchResults : randomResults;
  const displayResults = filteredResults;

  return (
    <div className="min-h-screen bg-dark">
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Sticky Search Header */}
      <div className="sticky top-0 z-30 bg-dark/95 backdrop-blur-md border-b border-primary/20 px-4 py-3">
        <div className="flex items-center space-x-2">
          {/* Filter Icon */}
          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 bg-[#2a2a2a] text-secondary rounded-xl hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20"
            aria-label="Open filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="text"
                name="search"
                value={localSearchInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search movies, TV series, anime..."
                className="w-full bg-[#2a2a2a] text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 text-sm"
                autoFocus={query ? true : false}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/60" />
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-secondary/60">
            {isSearching ? (
              "Searching..."
            ) : (
              <>
                {results.length} {results.length === 1 ? "result" : "results"}
                {query && <> for "{query}"</>}
                {!query && " (random)"}
              </>
            )}
          </p>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-[#2a2a2a] text-secondary rounded-lg hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20 text-sm"
            >
              <span>Sort: {getSortLabel()}</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Sort Dropdown Menu */}
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-[#2a2a2a] rounded-lg shadow-xl border border-primary/20 overflow-hidden z-20">
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

        {/* Results Grid */}
        {isSearching ? (
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
            <p className="text-sm text-secondary/60 mb-4">
              We couldn't find any matches for "{query}"
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setLocalSearchInput("");
              }}
              className="bg-[#2a2a2a] text-secondary px-4 py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Active Filters Display (if any) */}
        {selectedFilter !== "all" && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-xs text-secondary/60">Active filter:</span>
            <button
              onClick={() => setSelectedFilter("all")}
              className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              <span>
                {selectedFilter === "movie"
                  ? "Movies"
                  : selectedFilter === "tv-series"
                    ? "TV Series"
                    : "Anime"}
              </span>
              <span className="ml-1">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
