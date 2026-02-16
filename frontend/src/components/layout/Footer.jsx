import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-darker border-t border-primary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl mb-4 text-primary">MoviezMedia</h3>
            <p className="text-secondary/60 text-sm">
              Your ultimate destination for downloading movies, TV series, and
              anime. Fast, free, and secure downloads.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-secondary/60">
              <li>
                <Link
                  to="/movies"
                  className="hover:text-primary transition-colors"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/tv-series"
                  className="hover:text-primary transition-colors"
                >
                  TV Series
                </Link>
              </li>
              <li>
                <Link
                  to="/anime"
                  className="hover:text-primary transition-colors"
                >
                  Anime
                </Link>
              </li>
              <li>
                <Link
                  to="/popular"
                  className="hover:text-primary transition-colors"
                >
                  Popular
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg mb-4 text-secondary">Support</h4>
            <ul className="space-y-2 text-secondary/60">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="text-lg mb-4 text-secondary">Get Mobile App</h4>
            <p className="text-secondary/60 text-sm mb-4">
              Download our Android app for better experience
            </p>
            <a
              href="/download-app.apk"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover"
            >
              Download APK
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary/20 text-center text-secondary/40 text-sm">
          <p>&copy; 2024 MoviezMedia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
