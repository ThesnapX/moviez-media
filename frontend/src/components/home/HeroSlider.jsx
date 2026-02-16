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
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (spotlight.length === 0) return;

    startAutoPlay();
    return () => stopAutoPlay();
  }, [spotlight.length, currentSlide]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      if (!isDragging && !isTransitioning) {
        nextSlide();
      }
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const nextSlide = () => {
    if (isTransitioning || spotlight.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % spotlight.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || spotlight.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + spotlight.length) % spotlight.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX - dragOffset);
    stopAutoPlay();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newOffset = e.clientX - startX;
    const maxOffset = window.innerWidth * 0.3; // Max drag 30% of screen

    // Limit drag offset
    if (Math.abs(newOffset) < maxOffset) {
      setDragOffset(newOffset);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // Determine if we should change slide based on drag distance
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    startAutoPlay();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      startAutoPlay();
    }
  };

  if (!spotlight.length) return null;

  const movie = spotlight[currentSlide];

  // Calculate transform style for drag effect
  const getSliderStyle = () => {
    if (isDragging) {
      return {
        transform: `translateX(${dragOffset}px) scale(${1 - Math.abs(dragOffset) * 0.001})`,
        transition: "none",
        opacity: 1 - Math.abs(dragOffset) * 0.002,
      };
    }
    return {
      transform: "translateX(0) scale(1)",
      transition: "all 0.5s ease-out",
      opacity: 1,
    };
  };

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slide */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${movie.posterHorizontal?.url || movie.posterHorizontal})`,
            ...getSliderStyle(),
          }}
        >
          <div className="absolute inset-0 gradient-overlay"></div>
        </div>

        {/* Content with slide animation */}
        <div
          className={`relative container mx-auto px-4 h-full flex items-center transition-all duration-500 ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="w-full md:w-1/2">
            <span className="text-primary font-semibold text-lg mb-2 block animate-slide-in-left">
              #1 Spotlight
            </span>
            <h1
              className="text-5xl md:text-6xl mb-4 text-white animate-slide-in-left"
              style={{ animationDelay: "0.1s" }}
            >
              {movie.title}
            </h1>

            <div
              className="flex items-center space-x-4 mb-4 text-secondary animate-slide-in-left"
              style={{ animationDelay: "0.2s" }}
            >
              <span>{movie.type?.replace("-", " ").toUpperCase()}</span>
              <span>•</span>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span>•</span>
              <span className="text-yellow-500">★ {movie.imdbRating}</span>
            </div>

            <p
              className="text-secondary/80 mb-6 line-clamp-3 animate-slide-in-left"
              style={{ animationDelay: "0.3s" }}
            >
              {movie.description}
            </p>

            <div
              className="flex items-center space-x-4 animate-slide-in-left"
              style={{ animationDelay: "0.4s" }}
            >
              <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover">
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

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-primary transition-colors z-10"
        disabled={isTransitioning}
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-primary transition-colors z-10"
        disabled={isTransitioning}
      >
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {spotlight.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-secondary/50 hover:bg-secondary"
            } rounded-full`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-20">
          {dragOffset > 0 ? "← Previous" : "Next →"}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
