import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./locales";
import en from "./dict/en";
import es from "./dict/es";
import ptPt from "./dict/pt-pt";
import ptBr from "./dict/pt-br";

const dicts = { en, es, "pt-pt": ptPt, "pt-br": ptBr };

/** Current locale, its dictionary and a helper that prefixes internal paths with it. Server components only. */
export async function getT() {
  const l = await lang();
  if (!isLocale(l)) notFound();
  return { l: l as Locale, d: dicts[l], to: (path: string) => `/${l}${path === "/" ? "" : path}` };
}
