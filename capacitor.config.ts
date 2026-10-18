import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Store app (iOS / Android) = the same Next.js static export (`out/`), wrapped natively.
 * Build & sync:  npm run build && npx cap sync
 */
const config: CapacitorConfig = {
  appId: "com.fatemabeauty.app",
  appName: "Fatema Beauty",
  webDir: "out",
  backgroundColor: "#ECDDF2",
  android: { backgroundColor: "#ECDDF2" },
  ios: { backgroundColor: "#ECDDF2", contentInset: "never" },
};

export default config;
