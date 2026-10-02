import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Travel Vault",
    short_name: "Travel Vault",
    description: "ארנק נסיעות דיגיטלי",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f1eb",
    theme_color: "#14283a",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
