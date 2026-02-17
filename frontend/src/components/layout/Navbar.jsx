import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../common/AuthModal";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, setShowAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-transparent backdrop-blur-md border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo with softer glowing text effect */}
            <Link to="/" className="group">
              <h1 className="text-3xl font-['Bebas_Neue'] tracking-wider">
                <span className="text-primary relative">
                  Moviez
                  <span className="absolute inset-0 blur-sm bg-primary/20 opacity-0 group-hover:opacity-60 transition-opacity duration-500"></span>
                </span>
                <span className="text-white relative">
                  Media
                  <span className="absolute inset-0 blur-sm bg-white/10 opacity-0 group-hover:opacity-40 transition-opacity duration-500"></span>
                </span>
              </h1>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/movies"
                className="text-secondary hover:text-primary transition-colors"
              >
                Movies
              </Link>
              <Link
                to="/tv-series"
                className="text-secondary hover:text-primary transition-colors"
              >
                TV-Series
              </Link>
              <Link
                to="/anime"
                className="text-secondary hover:text-primary transition-colors"
              >
                Anime
              </Link>
              <Link
                to="/popular"
                className="text-secondary hover:text-primary transition-colors"
              >
                Popular
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full bg-white/5 backdrop-blur-sm text-secondary pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-white/10"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary/60" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/watchlist")}
                className="text-secondary hover:text-primary transition-colors"
              >
                <BookmarkIcon className="w-6 h-6" />
              </button>

              {/* In the user menu section, find the avatar button and update it */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary"
                      style={{ borderRadius: "50%" }}
                    >
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/avatars/default-avatar.png`;
                        }}
                      />
                    </div>
                  </button>
                  {/* ... rest of the user menu code ... */}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <AuthModal />
    </>
  );
};

export default Navbar;
