import HeroSlider from "../components/home/HeroSlider";
import CategorySection from "../components/home/CategorySection";
import GenreSlider from "../components/home/GenreSlider";
import LatestMoviesGrid from "../components/home/LatestMoviesGrid";
import { useMovies } from "../context/MovieContext";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { movies, tvSeries, anime, popular, categories, loading } = useMovies();
  const { user } = useAuth();

  // Define featured genres
  const featuredGenres = [
    "Horror",
    "Action",
    "Drama",
    "Thriller",
    "Sci-Fi",
    "Mystery",
    "Romance",
    "Adventure",
  ];

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
        {/* Popular Movies Slider with View All Button */}
        <CategorySection
          title="Popular Movies"
          movies={popular}
          showViewAllLink="/popular"
        />

        {/* New Releases Grid (18 items from all categories) */}
        <LatestMoviesGrid movies={movies} tvSeries={tvSeries} anime={anime} />

        {/* TV Series Slider */}
        <CategorySection
          title="TV Series"
          movies={tvSeries}
          showViewAllLink="/tv-series"
        />

        {/* Anime Slider */}
        <CategorySection
          title="Anime"
          movies={anime}
          showViewAllLink="/anime"
        />

        {/* Genre Sliders - Featured Genres */}
        {categories.length > 0 &&
          featuredGenres.map((genreName) => {
            const genre = categories.find((g) => g.name === genreName);
            if (!genre) return null;

            const genreMovies = movies.filter(
              (movie) =>
                movie.genres &&
                movie.genres.some(
                  (g) => g._id === genre._id || g === genre._id,
                ),
            );

            return (
              genreMovies.length > 0 && (
                <GenreSlider
                  key={genre._id}
                  genre={genre}
                  genreId={genre._id}
                  movies={genreMovies}
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
