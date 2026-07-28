import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

// TEMPORARY startup diagnostic - logs which client env vars are present so a
// missing VITE_API_BASE_URL (the cause of the stop-recording fetch bug) is
// visible in Xcode's console immediately on launch, not just after the user
// hits an API call. Safe to trim once confirmed fixed on a real device.
console.log("[env] VITE_API_BASE_URL set:", Boolean(import.meta.env.VITE_API_BASE_URL));
console.log("[env] VITE_SUPABASE_URL set:", Boolean(import.meta.env.VITE_SUPABASE_URL));
console.log("[env] VITE_SUPABASE_ANON_KEY set:", Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY));
console.log("[env] mode:", import.meta.env.MODE, "prod:", import.meta.env.PROD);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
