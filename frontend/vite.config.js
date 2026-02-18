import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sitemap from "vite-plugin-sitemap";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: "https://moviez-media.vercel.app",
      routes: [
        "/",
        "/movies",
        "/tv-series",
        "/anime",
        "/popular",
        "/search",
        "/profile",
        "/watchlist",
        "/request-movie",
      ],
    }),
  ],
});
