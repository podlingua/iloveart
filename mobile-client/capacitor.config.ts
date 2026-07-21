import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.speechcoach.app",
  appName: "Speech Coach",
  webDir: "dist",
  ios: {
    // Use the https scheme (rather than the default capacitor://) so the
    // WebView origin is "https://localhost" - this gives full parity with
    // standard Web APIs, notably getUserMedia for the recorder, which some
    // WKWebView versions restrict under the custom capacitor:// scheme.
    // lib/security/cors.ts on the API already allowlists this dev origin;
    // once this exact origin is confirmed against a real device/simulator,
    // add it to the API's ALLOWED_ORIGINS env var for production too.
    scheme: "https",
  },
};

export default config;
