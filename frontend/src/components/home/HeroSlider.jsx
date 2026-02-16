import { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % spotlight.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [spotlight.length]);

  if (!spotlight.length) return null;

  const movie = spotlight[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % spotlight.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + spotlight.length) % spotlight.length);
  };

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background Image with Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.posterHorizontal?.url || movie.posterHorizontal})`,
        }}
      >
        <div className="absolute inset-0 gradient-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="w-full md:w-1/2">
          <span className="text-primary font-semibold text-lg mb-2 block">
            #1 Spotlight
          </span>
          <h1 className="text-5xl md:text-6xl mb-4 text-white">
            {movie.title}
          </h1>

          <div className="flex items-center space-x-4 mb-4 text-secondary">
            <span>{movie.type.replace("-", " ").toUpperCase()}</span>
            <span>•</span>
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
            <span>•</span>
            <span className="text-yellow-500">★ {movie.imdbRating}</span>
          </div>

          <p className="text-secondary/80 mb-6 line-clamp-3">
            {movie.description}
          </p>

          <div className="flex items-center space-x-4">
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

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-primary transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-primary transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {spotlight.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-primary" : "bg-secondary/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
