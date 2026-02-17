import { createContext, useState, useContext } from "react";
import axios from "axios";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Perform search
  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/movies/search/${encodeURIComponent(query)}`,
      );
      setSearchResults(response.data);

      // Add to recent searches
      if (query.length >= 2) {
        setRecentSearches((prev) => {
          const newSearches = [query, ...prev.filter((s) => s !== query)].slice(
            0,
            5,
          );
          return newSearches;
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchModal(false);
  };

  // Remove from recent searches
  const removeRecentSearch = (queryToRemove) => {
    setRecentSearches((prev) => prev.filter((q) => q !== queryToRemove));
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const value = {
    searchResults,
    searchQuery,
    setSearchQuery,
    isSearching,
    performSearch,
    clearSearch,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    showSearchModal,
    setShowSearchModal,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
