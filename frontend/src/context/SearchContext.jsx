import { createContext, useState, useContext, useRef } from "react";
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

  const abortControllerRef = useRef(null);
  const lastQueryRef = useRef("");

  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Prevent duplicate calls
    if (query === lastQueryRef.current) return;
    lastQueryRef.current = query;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);

    try {
      const response = await axios.get(
        `${backendUrl}/api/movies/search/${encodeURIComponent(query)}`,
        { signal: controller.signal },
      );

      setSearchResults(response.data);

      setRecentSearches((prev) => {
        const updated = [query, ...prev.filter((s) => s !== query)].slice(0, 5);
        return updated;
      });
    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchModal(false);
  };

  const removeRecentSearch = (queryToRemove) => {
    setRecentSearches((prev) => prev.filter((q) => q !== queryToRemove));
  };

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
