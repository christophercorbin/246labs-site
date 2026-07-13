import type { MetadataRoute } from "next";
import { SERVICE_GROUPS } from "@/lib/services";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/services", "/about", "/contact", "/privacy"];
  const servicePaths = SERVICE_GROUPS.map((g) => `/services/${g.key}`);
  return [...staticPaths, ...servicePaths].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
