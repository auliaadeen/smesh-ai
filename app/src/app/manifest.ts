import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smesh AI — Multi-Agent Workforce for Indonesian UMKM",
    short_name: "Smesh AI",
    description: "AI business workforce untuk pemilik UMKM Indonesia — pahami bisnismu, putuskan langkah berikutnya.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#059669",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
