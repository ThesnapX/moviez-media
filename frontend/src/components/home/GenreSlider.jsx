import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import MovieCard from "../common/MovieCard";

const GenreSlider = ({ genre, movies, genreId }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-12 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-primary">{genre.name}</h2>
        <Link
          to={`/genre/${genreId}`}
          className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors group"
        >
          <span>View All</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="relative group">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
          style={{ marginLeft: "-12px" }}
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
          style={{ marginRight: "-12px" }}
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>

        {/* Movies Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.slice(0, 10).map((movie) => (
            <div key={movie._id} className="flex-none w-[200px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenreSlider;
