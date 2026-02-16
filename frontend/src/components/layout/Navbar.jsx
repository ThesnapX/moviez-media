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
      <nav className="bg-darker border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="text-3xl font-bold text-primary glow-red-hover"
            >
              Moviez<span className="text-secondary">Media</span>
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
                  className="w-full bg-[#1a1a1a] text-secondary pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
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

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2"
                  >
                    {user.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-primary" />
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg shadow-xl border border-primary/20 py-2 z-50">
                      <div className="px-4 py-2 border-b border-secondary/20">
                        <p className="font-semibold text-secondary">
                          {user.name}
                        </p>
                        <p className="text-sm text-secondary/60">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-secondary hover:bg-primary/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-secondary hover:bg-primary/10 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/request-movie"
                        className="block px-4 py-2 text-secondary hover:bg-primary/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Request Movie
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
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
