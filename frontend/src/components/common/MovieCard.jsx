import { useState, useRef, useEffect } from "react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../context/MovieContext";

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const { checkInWatchlist, addToWatchlist, removeFromWatchlist } = useMovies();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [popupPosition, setPopupPosition] = useState({
    side: "right",
    top: 0,
    show: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const popupWidth = 320;
  const popupHeight = 400;
  const isHoveringRef = useRef(false);
  const isHoveringPopupRef = useRef(false);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if movie is in watchlist on mount and when user changes
  useEffect(() => {
    if (user && movie) {
      setIsSaved(checkInWatchlist(movie._id));
    } else {
      setIsSaved(false);
    }
  }, [user, movie, checkInWatchlist]);

  // Handle mouse enter on card (desktop only)
  const handleMouseEnter = () => {
    if (isMobile) return; // Disable hover on mobile
    isHoveringRef.current = true;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    calculatePosition();
  };

  // Handle mouse leave on card (desktop only)
  const handleMouseLeave = () => {
    if (isMobile) return; // Disable hover on mobile
    isHoveringRef.current = false;
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringPopupRef.current) {
        setPopupPosition((prev) => ({ ...prev, show: false }));
      }
    }, 100);
  };

  // Handle mouse enter on popup (desktop only)
  const handlePopupMouseEnter = () => {
    if (isMobile) return; // Disable hover on mobile
    isHoveringPopupRef.current = true;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Handle mouse leave on popup (desktop only)
  const handlePopupMouseLeave = () => {
    if (isMobile) return; // Disable hover on mobile
    isHoveringPopupRef.current = false;
    if (!isHoveringRef.current) {
      setPopupPosition((prev) => ({ ...prev, show: false }));
    }
  };

  // Handle card click - navigate to details page (mobile and desktop)
  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };

  // Handle save/unsave
  const handleSaveToggle = async (e) => {
    e.stopPropagation();

    if (!user) {
      // You might want to show login modal here
      return;
    }

    if (isSaved) {
      const success = await removeFromWatchlist(movie._id);
      if (success) setIsSaved(false);
    } else {
      const success = await addToWatchlist(movie._id);
      if (success) setIsSaved(true);
    }
  };

  // Calculate popup position based on viewport
  const calculatePosition = () => {
    if (!cardRef.current || !isHoveringRef.current || isMobile) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceOnRight = viewportWidth - cardRect.right;
    const spaceOnLeft = cardRect.left;

    const side = spaceOnRight >= popupWidth ? "right" : "left";

    let top = cardRect.top + cardRect.height / 2 - popupHeight / 2;

    if (top + popupHeight > viewportHeight) {
      top = viewportHeight - popupHeight - 10;
    }

    if (top < 10) {
      top = 10;
    }

    setPopupPosition({
      side,
      top,
      show: true,
    });
  };

  // Handle scroll - hide popup when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (popupPosition.show && !isMobile) {
        if (!isHoveringRef.current && !isHoveringPopupRef.current) {
          setPopupPosition((prev) => ({ ...prev, show: false }));
        } else {
          calculatePosition();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [popupPosition.show, isMobile]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (
        popupPosition.show &&
        !isMobile &&
        (isHoveringRef.current || isHoveringPopupRef.current)
      ) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [popupPosition.show, isMobile]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setPopupPosition((prev) => ({ ...prev, show: false }));
        isHoveringRef.current = false;
        isHoveringPopupRef.current = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Get transform origin based on side
  const getTransformOrigin = () => {
    return popupPosition.side === "right" ? "left" : "right";
  };

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail - Make it clickable */}
      <div
        className="relative overflow-hidden rounded-lg cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={
            movie.posterVertical?.url ||
            `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
          }
          alt={movie.title}
          className="w-full h-[300px] object-cover transition-transform duration-300"
          style={{
            transform:
              popupPosition.show && !isMobile ? "scale(1.1)" : "scale(1)",
          }}
        />

        {/* Hover overlay - only show on desktop when popup is visible */}
        {!isMobile && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
              popupPosition.show ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center space-x-1 text-yellow-500 text-sm">
                <span>★</span>
                <span>{movie.imdbRating || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist indicator on thumbnail */}
        {isSaved && (
          <div className="absolute top-2 right-2 z-10">
            <BookmarkSolid className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-2 text-center text-secondary truncate text-lg font-medium">
        {movie.title}
      </h3>

      {/* Popup - Only show on desktop */}
      {!isMobile && popupPosition.show && (
        <div
          ref={popupRef}
          className="fixed z-50"
          style={{
            left:
              popupPosition.side === "right"
                ? cardRef.current?.getBoundingClientRect().right + 16
                : cardRef.current?.getBoundingClientRect().left -
                  popupWidth -
                  16,
            top: popupPosition.top,
            width: popupWidth,
          }}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          {/* Popup card */}
          <div
            className="transform transition-all duration-200 ease-out"
            style={{
              transform: "scale(1) translateY(0)",
              opacity: 1,
              transformOrigin: getTransformOrigin(),
            }}
          >
            <div className="relative">
              {/* Glassmorphism card */}
              <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Poster with gradient overlay */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={
                      movie.posterVertical?.url ||
                      `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Title overlay */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h4 className="text-lg font-bold text-white truncate drop-shadow-lg">
                      {movie.title}
                    </h4>
                  </div>

                  {/* Watchlist indicator on popup poster */}
                  {isSaved && (
                    <div className="absolute top-2 right-2">
                      <BookmarkSolid className="w-5 h-5 text-primary drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Meta info */}
                  <div className="flex items-center space-x-2 text-sm mb-3">
                    <span className="text-primary uppercase text-xs font-semibold bg-primary/20 px-2 py-0.5 rounded-full">
                      {movie.type?.replace("-", " ")}
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-yellow-500 flex items-center">
                      <span className="mr-1">★</span>
                      {movie.imdbRating || "N/A"}
                    </span>
                    {movie.releaseDate && (
                      <>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 text-xs">
                          {new Date(movie.releaseDate).getFullYear()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/80 text-sm mb-3 line-clamp-3 leading-relaxed">
                    {movie.description}
                  </p>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {movie.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre._id || genre}
                          className="text-xs bg-white/10 text-white/90 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10"
                        >
                          {genre.name || genre}
                        </span>
                      ))}
                      {movie.genres.length > 3 && (
                        <span className="text-xs text-white/40">
                          +{movie.genres.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleCardClick}
                      className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all mr-2 shadow-lg shadow-primary/20"
                    >
                      Download
                    </button>

                    {user && (
                      <button
                        onClick={handleSaveToggle}
                        className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
                        title={
                          isSaved ? "Remove from watchlist" : "Add to watchlist"
                        }
                      >
                        {isSaved ? (
                          <BookmarkSolid className="w-5 h-5" />
                        ) : (
                          <BookmarkOutline className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Additional info for TV shows */}
                  {movie.type === "tv-series" && movie.seasons && (
                    <div className="mt-3 text-xs text-white/40 flex items-center space-x-2">
                      <span>
                        {movie.seasons} Season{movie.seasons > 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span>{movie.quality || "HD"}</span>
                      <span>•</span>
                      <span>{movie.episodes || "24"} Ep</span>
                      <span>•</span>
                      <span>{movie.status || "Ongoing"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow pointer */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border-t border-l border-white/10 transform rotate-45 ${
                  popupPosition.side === "right" ? "-left-1.5" : "-right-1.5"
                }`}
                style={{
                  [popupPosition.side === "right"
                    ? "borderRight"
                    : "borderLeft"]: "none",
                  [popupPosition.side === "right"
                    ? "borderBottom"
                    : "borderTop"]: "none",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
