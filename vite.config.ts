// ─── LifeTracker Vite Config ───────────────────────────────
// Serves the frontend/ Spring Boot app. API calls to /api
// are proxied to the backend on port 8080.
// ───────────────────────────────────────────────────────────
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "frontend",
  server: {
    host: true,
    port: 5173,
    hmr: { overlay: false },
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-dom/client"],
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "esnext",
  },
  optimizeDeps: {
    entries: ["frontend/index.html"],
  },
});
