// Absolute URLs for metadata, sitemap, JSON-LD and llms.txt.
export const ORIGIN = "https://aatlascompany.com.br";
/** folder the static build is served from ("/portfolio"); empty on the Node build */
export const BASE = process.env.NEXT_PUBLIC_BASE ?? "";
export const SITE = ORIGIN + BASE;
const SLASH = process.env.NEXT_PUBLIC_STATIC ? "/" : ""; // the static build serves every page as folder/index.html

/** Absolute URL of a page: url("en", "/work") → https://aatlascompany.com.br/portfolio/en/work/ */
export const url = (lang: string, path = "/") => `${SITE}/${lang}${path === "/" ? "" : path}${SLASH}`;

export const CONTACT = {
  email: "contato@aatlascompany.com.br",
  phone: "+55 41 9814-5475",
  instagram: "https://instagram.com/chavesantoonio",
  linkedin: "https://www.linkedin.com/in/chavesantoonio",
};
