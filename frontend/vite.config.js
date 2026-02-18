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
      outDir: "dist", // Make sure it outputs to the correct build directory
      generateRobotsTxt: true, // This will also create robots.txt
      robots: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
