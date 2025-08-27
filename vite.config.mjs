// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  base: "/Qalam-Masters-Test/", // это ок для GitHub Pages; локали не мешает
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.qalam-masters.kz",
        changeOrigin: true,
        secure: true, // если вдруг ругнётся на сертификат — временно поставь false
        headers: { Host: "api.qalam-masters.kz" }, // иногда нужно, если бэк проверяет Host
        // pathRewrite не нужен, т.к. бэк ждёт /api/...
      },
    },
  },
});
