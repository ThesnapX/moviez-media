import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const MovieContext = createContext();

export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTvSeries] = useState([]);
  const [anime, setAnime] = useState([]);
  const [popular, setPopular] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [categories, setCategories] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Fetch watchlist when user changes
  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const fetchAllContent = async () => {
    try {
      setLoading(true);

      const [
        moviesRes,
        tvRes,
        animeRes,
        popularRes,
        spotlightRes,
        categoriesRes,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/movies?type=movie`),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/movies?type=tv-series`,
        ),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/movies?type=anime`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/movies/popular`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/movies/spotlight`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/genres`),
      ]);

      setMovies(moviesRes.data);
      setTvSeries(tvRes.data);
      setAnime(animeRes.data);
      setPopular(popularRes.data);
      setSpotlight(spotlightRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      setWatchlistLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist`,
      );
      setWatchlist(response.data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast.error("Failed to load watchlist");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const getMovieById = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching movie:", error);
      if (error.response?.status === 404) {
        throw new Error("Movie not found");
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to load movie details");
      }
    }
  };

  const addToWatchlist = async (movieId) => {
    if (!user) {
      toast.info("Please login to add to watchlist");
      return false;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist/${movieId}`,
      );
      await fetchWatchlist(); // Refresh watchlist
      toast.success("Added to watchlist");
      return true;
    } catch (error) {
      if (error.response?.status === 400) {
        toast.info("Movie already in watchlist");
      } else {
        toast.error("Failed to add to watchlist");
      }
      return false;
    }
  };

  const removeFromWatchlist = async (movieId) => {
    if (!user) return false;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist/${movieId}`,
      );
      await fetchWatchlist(); // Refresh watchlist
      toast.success("Removed from watchlist");
      return true;
    } catch (error) {
      toast.error("Failed to remove from watchlist");
      return false;
    }
  };

  const checkInWatchlist = (movieId) => {
    return watchlist.some((item) => item._id === movieId);
  };

  const clearWatchlist = async () => {
    if (!user || watchlist.length === 0) return;

    try {
      // Remove each item from watchlist
      for (const item of watchlist) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist/${item._id}`,
        );
      }
      await fetchWatchlist();
      toast.success("Watchlist cleared");
    } catch (error) {
      toast.error("Failed to clear watchlist");
    }
  };

  const value = {
    movies,
    tvSeries,
    anime,
    popular,
    spotlight,
    categories,
    watchlist,
    loading,
    watchlistLoading,
    getMovieById,
    addToWatchlist,
    removeFromWatchlist,
    checkInWatchlist,
    clearWatchlist,
    refresh: fetchAllContent,
    refreshWatchlist: fetchWatchlist,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};
