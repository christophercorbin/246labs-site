import type { MetadataRoute } from "next";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/services", "/about", "/contact", "/privacy"];
  const servicePaths = SERVICE_GROUPS.map((g) => `/services/${g.key}`);
  const workPaths = SELECTED_WORK.map((w) => `/work/${w.slug}`);
  return [...staticPaths, ...servicePaths, ...workPaths].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
