import { NextResponse, type NextRequest } from "next/server";
import { isLocale, pickLocale } from "@/lib/locales";

// Every page lives under /en, /es, /pt-pt or /pt-br.
// Visitors detected in Brazil (IP country from the host, or a pt-BR browser) always get /pt-br and cannot switch.
// Everyone else: a bare path goes to the language they picked before (cookie), else their browser's.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const [, first, ...rest] = pathname.split("/");
  const accept = req.headers.get("accept-language");
  const country = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
  const brazil = country === "BR" || pickLocale(accept) === "pt-br";

  let lang;
  if (brazil) {
    if (first === "pt-br") return;
    lang = "pt-br";
  } else {
    if (isLocale(first)) return;
    const saved = req.cookies.get("lang")?.value;
    lang = isLocale(saved) && saved !== "pt-br" ? saved : pickLocale(accept);
  }
  const tail = isLocale(first) ? rest.join("/") : pathname.slice(1);
  req.nextUrl.pathname = `/${lang}${tail ? `/${tail}` : ""}`;
  const res = NextResponse.redirect(req.nextUrl);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = { matcher: ["/((?!_next|assets|.*\\..*).*)"] };
