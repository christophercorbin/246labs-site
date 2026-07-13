import type { MetadataRoute } from "next";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/services", "/about", "/contact", "/privacy"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
