import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep CRA's output folder so the Pages workflow is unchanged
  build: { outDir: "build" },
  server: { port: Number(process.env.PORT) || 3000 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
