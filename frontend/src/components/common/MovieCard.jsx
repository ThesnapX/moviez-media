import { useState, useRef, useEffect } from "react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../context/MovieContext";
import gsap from "gsap";

const MovieCard = ({ movie }) => {
  const { user } = useAuth();
  const { checkInWatchlist, addToWatchlist, removeFromWatchlist } = useMovies();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    show: false,
    placement: "center",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const popupInnerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const popupWidth = 320;
  const popupHeight = 400;
  const isHoveringRef = useRef(false);
  const isHoveringPopupRef = useRef(false);
  const animationRef = useRef(null);

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

  // Animate popup when it shows
  useEffect(() => {
    if (popupPosition.show && popupInnerRef.current) {
      // Kill any existing animations
      if (animationRef.current) {
        animationRef.current.kill();
      }

      const { placement } = popupPosition;

      // Determine animation direction based on placement
      let yFrom = 20;

      if (placement.includes("bottom")) {
        // If popup is below the card, slide up from bottom
        yFrom = 20;
      } else {
        // Default - slide down from top
        yFrom = -20;
      }

      // Create animation
      animationRef.current = gsap.fromTo(
        popupInnerRef.current,
        {
          opacity: 0,
          y: yFrom,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        },
      );
    }
  }, [popupPosition.show, popupPosition.placement]);

  // Handle mouse enter on card (desktop only)
  const handleMouseEnter = () => {
    if (isMobile) return;
    isHoveringRef.current = true;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    calculatePosition();
  };

  // Handle mouse leave on card
  const handleMouseLeave = () => {
    if (isMobile) return;
    isHoveringRef.current = false;
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHoveringPopupRef.current) {
        animateOut();
      }
    }, 100);
  };

  // Handle mouse enter on popup
  const handlePopupMouseEnter = () => {
    if (isMobile) return;
    isHoveringPopupRef.current = true;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Handle mouse leave on popup
  const handlePopupMouseLeave = () => {
    if (isMobile) return;
    isHoveringPopupRef.current = false;
    if (!isHoveringRef.current) {
      animateOut();
    }
  };

  // Animate out function
  const animateOut = () => {
    if (popupInnerRef.current) {
      gsap.to(popupInnerRef.current, {
        opacity: 0,
        y: popupPosition.placement.includes("bottom") ? 20 : -20,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setPopupPosition((prev) => ({ ...prev, show: false }));
        },
      });
    } else {
      setPopupPosition((prev) => ({ ...prev, show: false }));
    }
  };

  // Handle card click
  const handleCardClick = () => {
    navigate(`/movie/${movie._id}`);
  };

  // Handle save/unsave
  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!user) return;

    if (isSaved) {
      const success = await removeFromWatchlist(movie._id);
      if (success) setIsSaved(false);
    } else {
      const success = await addToWatchlist(movie._id);
      if (success) setIsSaved(true);
    }
  };

  // Calculate popup position - top-left corner at card center
  const calculatePosition = () => {
    if (!cardRef.current || !isHoveringRef.current || isMobile) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Card center coordinates
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    // Default: position popup so its top-left corner is at card center
    let left = cardCenterX;
    let top = cardCenterY;
    let placement = "center";

    // Check if popup would overflow on the right
    if (left + popupWidth > viewportWidth) {
      // Position popup so its top-right corner is at card center
      left = cardCenterX - popupWidth;
      placement = "right";
    }

    // Check if popup would overflow on the left
    if (left < 0) {
      left = Math.max(0, cardCenterX);
      placement = "left";
    }

    // Check if popup would overflow on the bottom
    if (top + popupHeight > viewportHeight) {
      // Position popup so its bottom-left corner is at card center
      top = cardCenterY - popupHeight;
      placement = placement === "center" ? "bottom" : placement + "-bottom";
    }

    // Check if popup would overflow on the top
    if (top < 0) {
      top = Math.max(0, cardCenterY);
      placement = placement === "center" ? "top" : placement + "-top";
    }

    // Final safety checks - ensure popup stays within viewport
    left = Math.max(8, Math.min(left, viewportWidth - popupWidth - 8));
    top = Math.max(8, Math.min(top, viewportHeight - popupHeight - 8));

    setPopupPosition({
      top,
      left,
      show: true,
      placement,
    });
  };

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (popupPosition.show && !isMobile) {
        if (!isHoveringRef.current && !isHoveringPopupRef.current) {
          animateOut();
        } else {
          calculatePosition();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [popupPosition.show, isMobile, popupPosition.placement]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (popupPosition.show && !isMobile && isHoveringRef.current) {
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
        animateOut();
        isHoveringRef.current = false;
        isHoveringPopupRef.current = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupPosition.placement]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
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

        {/* Hover overlay */}
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

        {/* Watchlist indicator */}
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

      {/* Popup - Positioned with top-left corner at card center */}
      {!isMobile && popupPosition.show && (
        <div
          ref={popupRef}
          className="fixed z-50"
          style={{
            left: popupPosition.left,
            top: popupPosition.top,
            width: popupWidth,
          }}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        >
          <div
            ref={popupInnerRef}
            className="transform"
            style={{
              opacity: 0,
            }}
          >
            <div className="relative">
              {/* Glassmorphism card */}
              <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Poster */}
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
                  <div className="absolute bottom-2 left-3 right-3">
                    <h4 className="text-lg font-bold text-white truncate drop-shadow-lg">
                      {movie.title}
                    </h4>
                  </div>
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
                  {movie.genres?.length > 0 && (
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
                      >
                        {isSaved ? (
                          <BookmarkSolid className="w-5 h-5" />
                        ) : (
                          <BookmarkOutline className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
