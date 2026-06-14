import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    watch: {
      // No vigilar archivos multimedia (pueden quedar bloqueados en Windows
      // y tumban el watcher con EBUSY). Se sirven igual desde /public.
      ignored: ["**/public/music/**"],
    },
  },
});
