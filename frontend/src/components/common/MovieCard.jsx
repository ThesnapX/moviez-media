import { useState, useRef, useEffect } from "react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [popupPosition, setPopupPosition] = useState({
    side: "right",
    top: 0,
    show: false,
  });

  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const popupWidth = 320; // w-80 = 20rem = 320px
  const popupHeight = 400; // Approximate height
  const isHoveringRef = useRef(false);

  // Handle mouse enter - INSTANT (no delay)
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    calculatePosition();
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setPopupPosition((prev) => ({ ...prev, show: false }));
  };

  // Calculate popup position based on viewport
  const calculatePosition = () => {
    if (!cardRef.current || !isHoveringRef.current) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space on right and left
    const spaceOnRight = viewportWidth - cardRect.right;
    const spaceOnLeft = cardRect.left;

    // Determine which side has more space
    const side = spaceOnRight >= popupWidth ? "right" : "left";

    // Calculate vertical position (center aligned with card)
    let top = cardRect.top + cardRect.height / 2 - popupHeight / 2;

    // Check bottom overflow
    if (top + popupHeight > viewportHeight) {
      top = viewportHeight - popupHeight - 10;
    }

    // Check top overflow
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
      if (popupPosition.show) {
        // Check if mouse is still over the card
        if (!isHoveringRef.current) {
          setPopupPosition((prev) => ({ ...prev, show: false }));
        } else {
          // Reposition if still hovering
          calculatePosition();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [popupPosition.show]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (popupPosition.show && isHoveringRef.current) {
        calculatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [popupPosition.show]);

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg cursor-pointer">
        <img
          src={
            movie.posterVertical?.url ||
            `${import.meta.env.VITE_BACKEND_URL}${movie.posterVertical}`
          }
          alt={movie.title}
          className="w-full h-[300px] object-cover transition-transform duration-300"
          style={{
            transform: popupPosition.show ? "scale(1.1)" : "scale(1)",
          }}
        />

        {/* Hover overlay */}
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
      </div>

      {/* Title */}
      <h3 className="mt-2 text-center text-secondary truncate text-sm font-medium">
        {movie.title}
      </h3>

      {/* Popup */}
      {popupPosition.show && (
        <div
          ref={popupRef}
          className="fixed z-50 pointer-events-none"
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
        >
          {/* Popup card */}
          <div
            className="pointer-events-auto transform transition-all duration-200 ease-out"
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
                    <button className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all mr-2 shadow-lg shadow-primary/20">
                      Watch now
                    </button>

                    {user && (
                      <button
                        onClick={() => setIsSaved(!isSaved)}
                        className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
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
                  {movie.type === "tv-series" && (
                    <div className="mt-3 text-xs text-white/40 flex items-center space-x-2">
                      <span>Season 2</span>
                      <span>•</span>
                      <span>HD</span>
                      <span>•</span>
                      <span>6.4</span>
                      <span>•</span>
                      <span>TV</span>
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
