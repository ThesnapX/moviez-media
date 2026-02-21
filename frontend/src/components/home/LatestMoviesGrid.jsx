import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import MovieCard from "../common/MovieCard";

const LatestMoviesGrid = ({ movies, tvSeries, anime }) => {
  // Combine all content and sort by release date (newest first)
  const allContent = [...movies, ...tvSeries, ...anime]
    .sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
      const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
      return dateB - dateA; // Descending (newest first)
    })
    .slice(0, 18); // Take only 18 items

  if (allContent.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-primary">New Releases</h2>
        <Link
          to="/popular"
          className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors group"
        >
          <span>View All</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {allContent.map((item) => (
          <MovieCard key={item._id} movie={item} />
        ))}
      </div>
    </section>
  );
};

export default LatestMoviesGrid;
