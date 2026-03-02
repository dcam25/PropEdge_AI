import type { MetadataRoute } from "next";

const baseUrl = "https://prop-edge-ai.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/profile"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
