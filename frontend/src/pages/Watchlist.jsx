import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import MovieGrid from "../components/common/MovieGrid";
import { toast } from "react-toastify";

const Watchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/watchlist`,
      );
      setWatchlist(response.data);
    } catch (error) {
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl mb-4 text-primary">Watchlist</h1>
        <p className="text-secondary">Please login to view your watchlist</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl mb-8 text-primary">My Watchlist</h1>
      {watchlist.length === 0 ? (
        <p className="text-secondary">Your watchlist is empty</p>
      ) : (
        <MovieGrid movies={watchlist} />
      )}
    </div>
  );
};

export default Watchlist;
