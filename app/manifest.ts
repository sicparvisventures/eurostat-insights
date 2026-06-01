import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Statera",
    short_name: "Statera",
    description:
      "Read Europe through official statistics and turn them into decisions — population, economy, digital and a hospitality forecast. Built on Eurostat.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#283142",
    theme_color: "#283142",
    categories: ["education", "news", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
