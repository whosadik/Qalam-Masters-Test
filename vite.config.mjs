// vite.config.mjs
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // подтянет VITE_* из .env.* файлов

  return {
    base: env.VITE_BASE_HREF || "/", // ← БОЛЬШЕ НИКАКОГО хардкода /Qalam-Masters-Test/
    plugins: [react()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    server: {
      proxy: {
        "/api": {
          target: "https://api.qalam-masters.kz",
          changeOrigin: true,
          secure: true,
          headers: { Host: "api.qalam-masters.kz" },
        },
      },
    },
  };
});
