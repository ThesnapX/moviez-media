import { useState, useEffect, useRef } from "react";
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
    if (isTransitioning || newIndex === currentSlide) return;

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
    containerRef.current.style.cursor = "grabbing";
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || e.touches?.[0].clientX;
    setDragOffset(currentX - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    if (Math.abs(dragOffset) > 80) {
      dragOffset > 0 ? prevSlideFn() : nextSlide();
    }

    setIsDragging(false);
    setDragOffset(0);
    containerRef.current.style.cursor = "grab";
    startAutoPlay();
  };

  if (!spotlight.length) return null;

  const getSlideStyle = (index) => {
    if (isDragging && index === currentSlide) {
      return {
        transform: `translateX(${dragOffset}px)`,
        transition: "none",
      };
    }

    if (!isTransitioning) {
      return {
        transform:
          index === currentSlide ? "translateX(0)" : "translateX(100%)",
      };
    }

    if (index === currentSlide) {
      return {
        transform: "translateX(0)",
        transition: "transform 500ms ease",
      };
    }

    if (index === prevSlide) {
      return {
        transform:
          direction === "next" ? "translateX(-100%)" : "translateX(100%)",
        transition: "transform 500ms ease",
      };
    }

    return { transform: "translateX(100%)" };
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
        {/* SLIDES */}
        {spotlight.map((movie, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={getSlideStyle(index)}
          >
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${movie?.posterHorizontal?.url || movie?.posterHorizontal})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex items-end md:items-center pb-16 md:pb-0">
              <div className="w-full md:w-1/2">
                <span className="text-primary font-semibold text-lg mb-2 block">
                  #{index + 1} Spotlight
                </span>

                <h1 className="text-4xl md:text-6xl mb-4 text-white">
                  {movie?.title}
                </h1>

                <div className="flex items-center space-x-4 mb-4 text-secondary text-sm md:text-base">
                  <span>{movie?.type?.replace("-", " ").toUpperCase()}</span>
                  <span>•</span>
                  <span>{new Date(movie?.releaseDate).getFullYear()}</span>
                  <span>•</span>
                  <span className="text-yellow-500">★ {movie?.imdbRating}</span>
                </div>

                <p className="text-secondary/80 mb-6 line-clamp-3 text-sm md:text-base">
                  {movie?.description}
                </p>

                <div className="flex items-center space-x-4">
                  <button className="bg-primary text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all">
                    Download Now
                  </button>

                  {user && (
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className="p-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
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
        ))}
      </div>

      {/* ARROWS */}
      <button
        onClick={prevSlideFn}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary p-3 rounded-full transition-all z-20"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-primary p-3 rounded-full transition-all z-20"
      >
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>

      {/* NAV DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {spotlight.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-10 h-2.5 bg-primary shadow-lg"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white"
            }`}
          />
        ))}
      </div>

      {/* COUNTER */}
      <div className="absolute top-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-20">
        <span className="text-primary font-bold">{currentSlide + 1}</span> /{" "}
        {spotlight.length}
      </div>
    </div>
  );
};

export default HeroSlider;
