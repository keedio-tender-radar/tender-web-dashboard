import type { MetadataRoute } from "next";

// Manifiesto PWA: permite "Instalar app" (Chrome/Edge) con identidad propia (nombre, icono, colores).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Keedio Tender Radar",
    short_name: "Tender Radar",
    description: "Inteligencia de contratación pública con IA: detecta, puntúa y decide.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    lang: "es",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
    ],
  };
}
