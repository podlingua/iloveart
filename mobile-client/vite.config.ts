import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Bundled SPA client for the Capacitor iOS app (and a plain web preview).
// It talks to the existing Next.js deployment's API routes over HTTPS -
// VITE_API_BASE_URL below - rather than bundling any server code itself.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
