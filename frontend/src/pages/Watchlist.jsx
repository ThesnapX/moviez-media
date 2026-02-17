import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMovies } from "../context/MovieContext";
import {
  TrashIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  BookmarkSlashIcon,
} from "@heroicons/react/24/outline";
import MovieCard from "../components/common/MovieCard";

const Watchlist = () => {
  const { user } = useAuth();
  const {
    watchlist,
    watchlistLoading,
    removeFromWatchlist,
    clearWatchlist,
    refreshWatchlist,
  } = useMovies();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <BookmarkSlashIcon className="w-24 h-24 text-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-['Bebas_Neue'] text-primary mb-2">
            Watchlist
          </h1>
          <p className="text-secondary mb-6">
            Please login to view your watchlist
          </p>
          <Link
            to="/"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleRemove = async (movieId) => {
    await removeFromWatchlist(movieId);
  };

  const handleClearAll = async () => {
    await clearWatchlist();
    setShowClearConfirm(false);
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

  if (watchlistLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-['Bebas_Neue'] text-primary mb-2">
              My Watchlist
            </h1>
            <p className="text-secondary">
              {watchlist.length} {watchlist.length === 1 ? "item" : "items"}{" "}
              saved
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => refreshWatchlist()}
              className="flex items-center space-x-2 px-4 py-2 bg-[#2a2a2a] text-secondary rounded-lg hover:bg-[#3a3a3a] transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Refresh</span>
            </button>

            {watchlist.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop">
            <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6 border border-primary/20">
              <h3 className="text-xl text-primary mb-4">Clear Watchlist</h3>
              <p className="text-secondary mb-6">
                Are you sure you want to remove all {watchlist.length} items
                from your watchlist?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleClearAll}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-[#2a2a2a] text-secondary py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Content */}
        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkSlashIcon className="w-32 h-32 text-primary/20 mx-auto mb-4" />
            <h2 className="text-2xl text-secondary mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-secondary/60 mb-8">
              Start adding movies, TV series, or anime to your watchlist
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/movies"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-[#d00000] transition-colors"
              >
                Browse Movies
              </Link>
              <Link
                to="/tv-series"
                className="bg-[#2a2a2a] text-secondary px-6 py-3 rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                Browse TV Series
              </Link>
              <Link
                to="/anime"
                className="bg-[#2a2a2a] text-secondary px-6 py-3 rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                Browse Anime
              </Link>
            </div>
          </div>
        ) : (
          /* Watchlist Grid - Stats bar removed */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item) => (
              <div key={item._id} className="relative group">
                <MovieCard movie={item} />

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-red-500/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove from watchlist"
                >
                  <TrashIcon className="w-4 h-4 text-white" />
                </button>

                {/* Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white flex items-center space-x-1">
                    {getTypeIcon(item.type)}
                    <span className="capitalize">
                      {item.type.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
