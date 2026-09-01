import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Block 1",
        short_name: "Block 1",
        description: "Hypertrophy Block 1 workout tracker",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#151A21",
        background_color: "#151A21",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the app shell so it works fully offline
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        // Don't try to cache the coach API — it needs a real network
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /\/api\/coach/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
