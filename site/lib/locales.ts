// Kept free of server-only imports: used by proxy.ts and client components too.
export const locales = ["en", "es", "pt-pt", "pt-br"] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (l: string | undefined): l is Locale => (locales as readonly string[]).includes(l ?? "");

export const htmlLang: Record<Locale, string> = { en: "en", es: "es", "pt-pt": "pt-PT", "pt-br": "pt-BR" };

/** Best supported locale for an Accept-Language header: pt-BR → pt-br, any other pt → pt-pt, es-* → es, else en. */
export function pickLocale(header: string | null): Locale {
  const tags = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().toLowerCase().split(";q=");
      return { tag, q: q === undefined ? 1 : Number(q) };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    if (tag.startsWith("pt-br")) return "pt-br";
    if (tag.startsWith("pt")) return "pt-pt";
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}
