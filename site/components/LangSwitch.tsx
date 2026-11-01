"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { locales, htmlLang, type Locale } from "@/lib/locales";
import { track } from "@/lib/track";

const NAMES = { en: "English", es: "Español", "pt-pt": "Português (Portugal)" };

// Simplified flags, 3:2. No Brazil: proxy.ts locks Brazilian visitors to pt-br.
type Choice = Exclude<Locale, "pt-br">;

const FLAGS: Record<Choice, ReactNode> = {
  en: (
    <>
      <rect width="30" height="20" fill="#B22234" />
      <path d="M0 3.08h30M0 6.15h30M0 9.23h30M0 12.3h30M0 15.4h30M0 18.46h30" stroke="#fff" strokeWidth="1.54" />
      <rect width="13" height="10.77" fill="#3C3B6E" />
    </>
  ),
  es: (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </>
  ),
  "pt-pt": (
    <>
      <rect width="30" height="20" fill="#DA291C" />
      <rect width="12" height="20" fill="#046A38" />
      <circle cx="12" cy="10" r="4.2" fill="#FFE900" />
      <circle cx="12" cy="10" r="2.4" fill="#DA291C" stroke="#fff" strokeWidth=".8" />
    </>
  ),
};

const Flag = ({ l }: { l: Choice }) => (
  <svg viewBox="0 0 30 20" width="22" height="15" aria-hidden="true">{FLAGS[l]}</svg>
);

// Brazil is locked to pt-br by proxy.ts, so the switch never offers it and never shows on pt-br pages.
const CHOICES = locales.filter((l): l is Choice => l !== "pt-br");

/** Same page in each language. Remembers the pick in a cookie so bare URLs (proxy.ts) open in it next time. */
function Flags({ label }: { label: string }) {
  const path = usePathname();
  const [, cur, ...rest] = path.split("/");
  const tail = rest.length ? `/${rest.join("/")}` : "";
  return (
    <>
      {CHOICES.map((l) => (
        <Link
          key={l}
          href={`/${l}${tail}`}
          hrefLang={htmlLang[l]}
          lang={htmlLang[l]}
          aria-label={`${label}: ${NAMES[l]}`}
          title={NAMES[l]}
          aria-current={l === cur ? "true" : undefined}
          onClick={() => {
            document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax;secure`;
            track("language_change", { language_from: cur, language_to: l });
          }}
        >
          <Flag l={l} />
        </Link>
      ))}
    </>
  );
}

/** Row of flags, set under the "Let's talk" button. */
export function LangSwitch({ label }: { label: string }) {
  if (usePathname().startsWith("/pt-br")) return null;
  return (
    <nav className="ls" aria-label={label}>
      <Flags label={label} />
    </nav>
  );
}

/** Floating flag on every page: shows the current language and opens the others. */
export function LangFloat({ label, current }: { label: string; current: Locale }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", off);
    return () => {
      document.removeEventListener("pointerdown", off);
      document.removeEventListener("keydown", off);
    };
  }, [open]);
  if (current === "pt-br") return null;
  return (
    <div ref={box} className={`lf${open ? " on" : ""}`}>
      {open && (
        <nav className="lf-menu" aria-label={label}>
          <Flags label={label} />
        </nav>
      )}
      <button type="button" className="lf-btn" aria-expanded={open} aria-label={`${label}: ${NAMES[current]}`} title={label} onClick={() => setOpen(!open)}>
        <Flag l={current} />
      </button>
    </div>
  );
}
