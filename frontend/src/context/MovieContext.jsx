import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MovieContext = createContext();

export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTvSeries] = useState([]);
  const [anime, setAnime] = useState([]);
  const [popular, setPopular] = useState([]);
  const [spotlight, setSpotlight] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);

      // Fetch movies
      const moviesRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies?type=movie`,
      );
      setMovies(moviesRes.data);

      // Fetch TV series
      const tvRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies?type=tv-series`,
      );
      setTvSeries(tvRes.data);

      // Fetch anime
      const animeRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies?type=anime`,
      );
      setAnime(animeRes.data);

      // Fetch popular (most viewed)
      const popularRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies/popular`,
      );
      setPopular(popularRes.data);

      // Fetch spotlight
      const spotlightRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/movies/spotlight`,
      );
      setSpotlight(spotlightRes.data);

      // Fetch categories
      const categoriesRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/genres`,
      );
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
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
      toast.error("Failed to load movie details");
      return null;
    }
  };

  const addToWatchlist = async (movieId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist/${movieId}`,
      );
      toast.success("Added to watchlist");
      return true;
    } catch (error) {
      toast.error("Failed to add to watchlist");
      return false;
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist/${movieId}`,
      );
      toast.success("Removed from watchlist");
      return true;
    } catch (error) {
      toast.error("Failed to remove from watchlist");
      return false;
    }
  };

  const value = {
    movies,
    tvSeries,
    anime,
    popular,
    spotlight,
    categories,
    loading,
    getMovieById,
    addToWatchlist,
    removeFromWatchlist,
    refresh: fetchAllContent,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};
