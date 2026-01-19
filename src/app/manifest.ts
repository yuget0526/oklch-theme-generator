import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "a11yPalette - OKLCH Theme Generator",
    short_name: "a11yPalette",
    description:
      "Generate accessible, consistent color palettes using the OKLCH color space.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png", // Assuming same icon for 512 for now, ideally should be higher res
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
