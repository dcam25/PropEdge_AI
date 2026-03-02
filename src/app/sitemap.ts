import type { MetadataRoute } from "next";

const baseUrl = "https://prop-edge-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/about",
    "/terms",
    "/privacy",
    "/pricing",
    "/plan",
    "/models",
  ];

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("monthly" as const),
    priority: path === "" ? 1 : 0.8,
  }));
}
