import HeroSlider from "../components/home/HeroSlider";
import CategorySection from "../components/home/CategorySection";
import { useMovies } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { movies, tvSeries, anime, popular, categories, loading } = useMovies();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSlider />

      <div className="container mx-auto px-4 py-12">
        {/* Category Sections */}
        <CategorySection title="Popular Movies" movies={popular} />
        <CategorySection title="Latest Movies" movies={movies.slice(0, 10)} />
        <CategorySection title="TV Series" movies={tvSeries} />
        <CategorySection title="Anime" movies={anime} />

        {/* Dynamic Category Sections from Genres */}
        {categories.map((category) => {
          const categoryMovies = movies.filter((movie) =>
            movie.genres.includes(category._id),
          );
          return (
            categoryMovies.length > 0 && (
              <CategorySection
                key={category._id}
                title={category.name}
                movies={categoryMovies}
              />
            )
          );
        })}

        {/* Login/Signup CTA Banner - Desktop only */}
        {!user && (
          <div className="hidden md:block my-12 p-12 bg-gradient-to-r from-primary/20 to-transparent rounded-lg border border-primary/30">
            <div className="max-w-2xl">
              <h2 className="text-4xl mb-4 text-primary">
                Join MoviezMedia Today!
              </h2>
              <p className="text-secondary/80 mb-6">
                Create a free account to save your watchlist, request movies,
                and get personalized recommendations.
              </p>
              <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover">
                Sign Up Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
