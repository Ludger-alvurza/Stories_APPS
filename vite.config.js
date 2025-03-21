import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "robots.txt", "images/logo.png"],
      manifest: {
        name: "Stories Apps Ludger",
        short_name: "Aplikasi",
        description: "Apps Subbmisiion.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/images/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 10,
              plugins: [
                {
                  fetchDidFail: async () => {
                    const cache = await caches.open("html-cache");
                    return await cache.match("/offline.html");
                  },
                },
              ],
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              fetchOptions: {
                mode: "no-cors",
              },
              plugins: [
                {
                  fetchDidFail: async () => {
                    console.error("Offline: Failed to fetch document");

                    const popup = document.createElement("div");
                    popup.id = "offline-popup";
                    popup.style.position = "fixed";
                    popup.style.bottom = "20px";
                    popup.style.right = "20px";
                    popup.style.padding = "15px";
                    popup.style.backgroundColor = "#ffcc00";
                    popup.style.color = "#000";
                    popup.style.border = "1px solid #000";
                    popup.style.borderRadius = "8px";
                    popup.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
                    popup.style.zIndex = "9999";
                    popup.style.fontFamily = "Arial, sans-serif";
                    popup.innerText =
                      "You are offline. Some features may not work.";

                    if (!document.getElementById("offline-popup")) {
                      document.body.appendChild(popup);

                      setTimeout(() => {
                        if (popup) {
                          popup.remove();
                        }
                      }, 5000);
                    }
                  },
                },
              ],
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "script",
            handler: "CacheFirst",
            options: {
              cacheName: "js-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "style",
            handler: "CacheFirst",
            options: {
              cacheName: "css-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
        ],
      },
    }),
  ],
});
