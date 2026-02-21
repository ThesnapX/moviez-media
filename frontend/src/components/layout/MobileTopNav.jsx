import { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const MobileTopNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { path: "/movies", label: "Movies" },
    { path: "/tv-series", label: "TV Series" },
    { path: "/anime", label: "Anime" },
    { path: "/genre", label: "Genres" },
    { path: "/popular", label: "Popular" },
    { path: "/request-movie", label: "Request Movie" },
  ];

  return (
    <>
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-primary/20 z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <h1 className="text-3xl font-['Bebas_Neue'] tracking-[0.02em]">
              <span className="text-primary relative font-normal">
                Moviez
                <span className="absolute inset-0 blur-md bg-primary/20 opacity-0 group-hover:opacity-60 transition-opacity duration-500"></span>
              </span>
              <span className="text-white relative font-normal">
                {" "}
                Media
                <span className="absolute inset-0 blur-md bg-white/10 opacity-0 group-hover:opacity-40 transition-opacity duration-500"></span>
              </span>
            </h1>
          </Link>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-secondary hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#0a0a0a]/95 backdrop-blur-md z-30 animate-fade-in">
          <div className="p-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="block py-4 px-4 text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all border-b border-primary/10 last:border-0 text-lg"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-primary/20">
              <p className="text-xs text-secondary/40 text-center">
                © 2024 MoviezMedia
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTopNav;
