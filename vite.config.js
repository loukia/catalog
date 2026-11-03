import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
const base = process.env.VITE_BASE_PATH || "/";
if (!base.startsWith("/") || !base.endsWith("/"))
  throw new Error("VITE_BASE_PATH must start and end with /");
export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
      ],
      manifest: {
        name: "Whisky Catalog",
        short_name: "Whisky Catalog",
        description: "Omat viskit, tasting-ryhmät ja maistelumuistiinpanot.",
        lang: "fi",
        theme_color: "#202d26",
        background_color: "#f7f8f5",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: `${base}icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,svg,png,webmanifest}"],
        globIgnores: ["ocr/**/*"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              url.pathname.includes("/ocr/"),
            handler: "CacheFirst",
            options: {
              cacheName: "whisky-label-reader-v1",
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
