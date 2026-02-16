import { useMovies } from "../context/MovieContext";
import MovieGrid from "../components/common/MovieGrid";

const Popular = () => {
  const { popular, loading } = useMovies();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl mb-8 text-primary">Most Popular</h1>
      <MovieGrid movies={popular} />
    </div>
  );
};

export default Popular;
