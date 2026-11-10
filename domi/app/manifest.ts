import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Domi: The Tech Interactive",
    short_name: "Domi",
    description: "Find the Domis hiding around The Tech Interactive.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0088CE",
    theme_color: "#0088CE",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
