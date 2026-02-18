import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import AuthModal from "../common/AuthModal";
import SearchModal from "../common/SearchModal";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, setShowAuthModal } = useAuth();
  const { setShowSearchModal } = useSearch();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-transparent backdrop-blur-md border-b border-primary/20 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="group">
              <h1 className="text-3xl font-['Bebas_Neue'] tracking-[-0.02em]">
                <span className="text-primary relative font-normal">
                  Moviez
                  <span className="absolute inset-0 blur-md bg-primary/20 opacity-0 group-hover:opacity-60 transition-opacity duration-500"></span>
                </span>
                <span className="text-white relative font-normal">
                  Media
                  <span className="absolute inset-0 blur-md bg-white/10 opacity-0 group-hover:opacity-40 transition-opacity duration-500"></span>
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
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full bg-white/5 backdrop-blur-sm text-secondary/60 pl-10 pr-4 py-2 rounded-lg text-left hover:bg-white/10 transition-colors border border-white/10 relative"
              >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary/60" />
                <span>Search movies...</span>
              </button>
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
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {/* First Letter Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                      <span className="text-primary text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-lg shadow-xl border border-primary/20 py-2 z-50">
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
      <SearchModal />
    </>
  );
};

export default Navbar;
