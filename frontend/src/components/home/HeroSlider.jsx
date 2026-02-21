import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon as BookmarkOutline,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { useMovies } from "../../context/MovieContext";
import { useAuth } from "../../context/AuthContext";

const HeroSlider = () => {
  const { spotlight } = useMovies();
  const { user } = useAuth();
  const { checkInWatchlist, addToWatchlist, removeFromWatchlist } = useMovies();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [direction, setDirection] = useState("next");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const autoPlayRef = useRef(null);
  const containerRef = useRef(null);
  const imageRefs = useRef([]);

  // Check if current movie is in watchlist
  useEffect(() => {
    if (user && spotlight.length > 0 && spotlight[currentSlide]) {
      setIsSaved(checkInWatchlist(spotlight[currentSlide]._id));
    } else {
      setIsSaved(false);
    }
  }, [user, currentSlide, spotlight, checkInWatchlist]);

  /* ================= AUTOPLAY ================= */
  useEffect(() => {
    if (!spotlight.length) return;

    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentSlide, spotlight.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      if (!isDragging && !isTransitioning) {
        nextSlide();
      }
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  /* ================= SLIDE CONTROLS ================= */
  const changeSlide = (newIndex, dir) => {
    if (isTransitioning || newIndex === currentSlide || spotlight.length === 0)
      return;

    setDirection(dir);
    setPrevSlide(currentSlide);
    setIsTransitioning(true);
    setCurrentSlide(newIndex);

    setTimeout(() => {
      setIsTransitioning(false);
      setPrevSlide(null);
    }, 500);
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % spotlight.length;
    changeSlide(newIndex, "next");
  };

  const prevSlideFn = () => {
    const newIndex = (currentSlide - 1 + spotlight.length) % spotlight.length;
    changeSlide(newIndex, "prev");
  };

  const goToSlide = (index) => {
    changeSlide(index, index > currentSlide ? "next" : "prev");
  };

  /* ================= DRAG ================= */
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0].clientX);
    stopAutoPlay();
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX || e.touches?.[0].clientX;
    const diff = currentX - startX;
    // Limit drag offset to prevent excessive movement
    const maxOffset = window.innerWidth * 0.3;
    const limitedDiff = Math.max(-maxOffset, Math.min(maxOffset, diff));
    setDragOffset(limitedDiff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    if (Math.abs(dragOffset) > 80) {
      if (dragOffset > 0) {
        prevSlideFn();
      } else {
        nextSlide();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
    startAutoPlay();
  };

  /* ================= WATCHLIST HANDLER ================= */
  const handleSaveToggle = async (e) => {
    e.stopPropagation();

    if (!user) {
      // You might want to show login modal here
      return;
    }

    const currentMovie = spotlight[currentSlide];
    if (!currentMovie) return;

    if (isSaved) {
      const success = await removeFromWatchlist(currentMovie._id);
      if (success) setIsSaved(false);
    } else {
      const success = await addToWatchlist(currentMovie._id);
      if (success) setIsSaved(true);
    }
  };

  /* ================= NAVIGATION ================= */
  const handleDownloadClick = () => {
    const currentMovie = spotlight[currentSlide];
    if (currentMovie) {
      navigate(`/movie/${currentMovie._id}`);
    }
  };

  if (!spotlight || spotlight.length === 0) return null;

  const currentMovie = spotlight[currentSlide];
  const totalSlides = spotlight.length;

  // Get optimized image URL without compression
  const getOptimizedImageUrl = (url) => {
    if (!url) return "";

    // If it's a Cloudinary URL, remove quality compression parameters
    if (url.includes("cloudinary")) {
      // Remove any quality parameters (q_auto, q_90, etc.) and fetch original
      return url
        .replace(/q_[a-zA-Z0-9_]+[,/]?/g, "")
        .replace(/f_auto[,/]?/g, "");
    }
    return url;
  };

  const getSlideStyle = (index) => {
    // During drag
    if (isDragging && index === currentSlide) {
      return {
        transform: `translateX(${dragOffset}px)`,
        transition: "none",
        zIndex: 10,
      };
    }

    // Normal state - only current slide visible
    if (!isTransitioning) {
      return {
        transform:
          index === currentSlide ? "translateX(0)" : "translateX(100%)",
        zIndex: index === currentSlide ? 10 : 1,
      };
    }

    // During transition
    if (index === currentSlide) {
      return {
        transform: "translateX(0)",
        transition: "transform 500ms ease",
        zIndex: 20,
      };
    }

    if (index === prevSlide) {
      return {
        transform:
          direction === "next" ? "translateX(-100%)" : "translateX(100%)",
        transition: "transform 500ms ease",
        zIndex: 15,
      };
    }

    return {
      transform: "translateX(100%)",
      zIndex: 1,
    };
  };

  return (
    <div className="relative h-[600px] overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="relative w-full h-full select-none"
        style={{ cursor: "grab" }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* HIGH QUALITY BACKGROUND IMAGES - ALL SLIDES */}
        {spotlight.map((movie, index) => {
          const imageUrl =
            movie?.posterHorizontal?.url || movie?.posterHorizontal || "";
          const optimizedUrl = getOptimizedImageUrl(imageUrl);

          return (
            <div
              key={movie._id || index}
              className="absolute inset-0"
              style={getSlideStyle(index)}
            >
              {/* Background Image - Original Quality */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={optimizedUrl}
                  alt={movie?.title}
                  className="w-full h-full object-cover object-center"
                  style={{
                    filter:
                      isDragging && index === currentSlide
                        ? `brightness(${1 - Math.abs(dragOffset) * 0.001})`
                        : "brightness(0.95)",
                    imageRendering: "high-quality", // Improve rendering quality
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    // Fallback gradient if image fails to load
                    e.target.style.display = "none";
                    e.target.parentElement.style.background =
                      "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)";
                  }}
                />

                {/* Gradient Overlay - Separated from image to preserve quality */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/70 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-end md:items-center pb-16 md:pb-0">
                <div className="container mx-auto px-4">
                  <div className="w-full md:w-1/2">
                    <span className="text-primary font-semibold text-lg mb-2 block">
                      #{index + 1} Spotlight
                    </span>

                    <h1 className="text-4xl md:text-6xl mb-4 text-white drop-shadow-lg">
                      {movie?.title}
                    </h1>

                    <div className="flex items-center space-x-4 mb-4 text-secondary text-sm md:text-base">
                      <span>
                        {movie?.type?.replace("-", " ").toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>
                        {movie?.releaseDate
                          ? new Date(movie.releaseDate).getFullYear()
                          : "N/A"}
                      </span>
                      <span>•</span>
                      <span className="text-yellow-500">
                        ★ {movie?.imdbRating || "N/A"}
                      </span>
                    </div>

                    <p className="text-secondary/80 mb-6 line-clamp-3 text-sm md:text-base max-w-xl">
                      {movie?.description}
                    </p>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleDownloadClick}
                        className="bg-primary text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all shadow-lg shadow-primary/30 cursor-pointer"
                      >
                        Download Now
                      </button>

                      {user && (
                        <button
                          onClick={handleSaveToggle}
                          className="p-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          {isSaved ? (
                            <BookmarkSolid className="w-6 h-6" />
                          ) : (
                            <BookmarkOutline className="w-6 h-6" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ARROWS - Only show if more than 1 slide */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlideFn}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary p-3 rounded-full transition-all z-30 backdrop-blur-sm cursor-pointer"
            disabled={isTransitioning}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary p-3 rounded-full transition-all z-30 backdrop-blur-sm cursor-pointer"
            disabled={isTransitioning}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* NAV DOTS - Shows all slides count */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
          {spotlight.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentSlide
                  ? "w-10 h-2.5 bg-primary shadow-lg shadow-primary/50"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white"
              }`}
              disabled={isTransitioning}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* COUNTER - Shows current/total */}
      {totalSlides > 1 && (
        <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-30 border border-white/10">
          <span className="text-primary font-bold">{currentSlide + 1}</span> /{" "}
          {totalSlides}
        </div>
      )}

      {/* DRAG INDICATOR */}
      {isDragging && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm z-40 border border-white/10">
          {dragOffset > 0 ? "← Previous" : "Next →"}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
