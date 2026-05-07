import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3080,
    proxy: {
      "/auth": "http://localhost:4080",
      "/policy": "http://localhost:4080"
    }
  }
});
