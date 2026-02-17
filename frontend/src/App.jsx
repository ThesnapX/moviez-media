import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout Components
import Navbar from "./components/layout/Navbar";
import MobileNav from "./components/layout/MobileNav";
import Footer from "./components/layout/Footer";

// Pages
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TVSeries from "./pages/TVSeries";
import Anime from "./pages/Anime";
import Popular from "./pages/Popular";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MovieDetails from "./pages/MovieDetails"; // Add this import
import RequestMovie from "./pages/RequestMovie";

// Context
import { AuthProvider } from "./context/AuthContext";
import { MovieProvider } from "./context/MovieContext";

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <Router>
          <div className="min-h-screen bg-dark">
            {/* Desktop Navbar */}
            <div className="hidden md:block">
              <Navbar />
            </div>

            {/* Main Content */}
            <main className="pb-16 md:pb-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/tv-series" element={<TVSeries />} />
                <Route path="/anime" element={<Anime />} />
                <Route path="/popular" element={<Popular />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/movie/:id" element={<MovieDetails />} />{" "}
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/request-movie" element={<RequestMovie />} />
                {/* Add this route */}
              </Routes>
            </main>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNav />
            </div>

            {/* Desktop Footer */}
            <div className="hidden md:block">
              <Footer />
            </div>
          </div>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            toastStyle={{
              backgroundColor: "#1a1a1a",
              color: "#e7e7e7",
              border: "1px solid #f00000",
            }}
          />
        </Router>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;
