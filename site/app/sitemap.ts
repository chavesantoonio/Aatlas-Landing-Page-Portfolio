import type { MetadataRoute } from "next";
import { locales, htmlLang } from "@/lib/locales";
import { slugs } from "@/lib/projects";
import { url } from "@/lib/site";

export const dynamic = "force-static";

// Every page in every language, each listing its translations (hreflang) so search engines pair them.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/work", ...slugs.map((s) => `/work/${s}`), "/privacy", "/terms", "/accessibility"];
  const lastModified = new Date();
  return paths.flatMap((path) =>
    locales.map((l) => ({
      url: url(l, path),
      lastModified,
      priority: path === "/" ? 1 : path.startsWith("/work") ? 0.8 : 0.3,
      alternates: { languages: { ...Object.fromEntries(locales.map((x) => [htmlLang[x], url(x, path)])), "x-default": url("en", path) } },
    })),
  );
}
