import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setShowAuthModal } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleWatchlistClick = () => {
    if (user) {
      navigate("/watchlist");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSearchClick = () => {
    navigate("/search");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-primary/20 py-2 px-4 z-50 backdrop-blur-md bg-opacity-90">
      <div className="flex justify-around items-center">
        {/* Home Button */}
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center group relative"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isActive("/")
                ? "bg-primary/20 text-primary scale-110"
                : "text-secondary/60 group-hover:text-primary/80 group-hover:scale-105"
            }`}
          >
            {isActive("/") ? (
              <HomeIconSolid className="w-6 h-6" />
            ) : (
              <HomeIcon className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 transition-all duration-300 ${
              isActive("/")
                ? "text-primary font-medium"
                : "text-secondary/40 group-hover:text-primary/60"
            }`}
          >
            Home
          </span>
          {isActive("/") && (
            <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
          )}
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center group relative"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isActive("/search")
                ? "bg-primary/20 text-primary scale-110"
                : "text-secondary/60 group-hover:text-primary/80 group-hover:scale-105"
            }`}
          >
            {isActive("/search") ? (
              <MagnifyingGlassIconSolid className="w-6 h-6" />
            ) : (
              <MagnifyingGlassIcon className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 transition-all duration-300 ${
              isActive("/search")
                ? "text-primary font-medium"
                : "text-secondary/40 group-hover:text-primary/60"
            }`}
          >
            Search
          </span>
          {isActive("/search") && (
            <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
          )}
        </button>

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistClick}
          className="flex flex-col items-center group relative"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isActive("/watchlist")
                ? "bg-primary/20 text-primary scale-110"
                : "text-secondary/60 group-hover:text-primary/80 group-hover:scale-105"
            }`}
          >
            {isActive("/watchlist") ? (
              <BookmarkIconSolid className="w-6 h-6" />
            ) : (
              <BookmarkIcon className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 transition-all duration-300 ${
              isActive("/watchlist")
                ? "text-primary font-medium"
                : "text-secondary/40 group-hover:text-primary/60"
            }`}
          >
            Watchlist
          </span>
          {isActive("/watchlist") && (
            <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
          )}
        </button>

        {/* Profile Button */}
        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center group relative"
        >
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isActive("/profile")
                ? "bg-primary/20 text-primary scale-110"
                : "text-secondary/60 group-hover:text-primary/80 group-hover:scale-105"
            }`}
          >
            {isActive("/profile") ? (
              <UserIconSolid className="w-6 h-6" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 transition-all duration-300 ${
              isActive("/profile")
                ? "text-primary font-medium"
                : "text-secondary/40 group-hover:text-primary/60"
            }`}
          >
            Profile
          </span>
          {isActive("/profile") && (
            <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
