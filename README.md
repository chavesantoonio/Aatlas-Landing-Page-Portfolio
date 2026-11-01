# Aatlas — Landing Page / Portfolio (BR · US · ES · PT)

Portfolio site for **Antonio Chaves / Aatlas Company** — multilingual, static-exported Next.js site hosted on shared hosting (Hostinger, no Node runtime). Live at **https://aatlascompany.com.br/portfolio/**.

## Stack

- **Next.js 16** (App Router), TypeScript, plain CSS (no Tailwind).
- **`output: "export"`** — the whole site is prerendered to static HTML/CSS/JS at build time; no server, no API routes, no database. Deployed as plain files to Apache/LiteSpeed shared hosting.
- **No client-side framework overhead beyond what Next ships**; interactivity (the contact questionnaire, language switch, consent banner) is plain React islands hydrated on static pages.

## Directory structure

```
site/                      Next.js app (source of truth)
  app/
    [lang]/                 locale-scoped routes: layout, page, work/, work/[slug]/, privacy/, terms/, accessibility/
    sitemap.ts               generates sitemap.xml with hreflang alternates
    llms.txt/route.ts        force-static llms.txt for AI crawlers (GEO/AEO)
  components/
    Talk.tsx                 contact questionnaire (3 qualifying steps + WhatsApp/Instagram handoff)
    Tracking.tsx              GTM loader, consent banner, dataLayer events
    LangSwitch.tsx            flag-based language switcher (hero + floating)
    SitePreview.tsx            client-site preview modal (focus-trapped)
    Site.tsx                  shared chrome: metadata/JSON-LD helpers, nav, footer, legal renderer
  lib/
    locales.ts                supported locales + Accept-Language → locale resolution
    i18n.ts                    getT() reads the active locale via next/root-params
    dict/{en,es,pt-pt,pt-br}.ts  full translation dictionaries (single source per locale)
    projects.ts, data.ts        case-study content, client list, contact constants
    site.ts                    canonical URL helpers (origin, base path, locale URLs)
    track.ts                   dataLayer push + first-touch UTM/click-id attribution
    ld.ts                      JSON-LD builders (Person, ProfessionalService, WebSite, CollectionPage, …)
    focus-trap.ts               shared modal a11y (Tab cycling, Esc, focus return)
    image-loader.ts             custom loader for the static export (no Next Image server)
  proxy.ts                   middleware (Node build only): Brazil → pt-br lock, Accept-Language detection, lang cookie
  scripts/build-static.mjs    static-export build: strips proxy.ts, rewrites /assets/ paths for the base path,
                               flattens prefetch segment files, writes index.html (JS locale redirect),
                               branded 404.html, and .htaccess (security headers, caching, gzip)
  public/assets/              images (WebP), favicons, logo
  public/gtm.json             { "gtm_id": "" } — read at runtime so the GTM container can be
                               turned on/off by editing one file on the server, no rebuild needed
  tracking/
    make-container.py          generates gtm-container.json (GA4 + Google Ads + Meta Pixel, from the
                                events actually fired in Tracking.tsx/Talk.tsx)
    LEIA-ME.md                  setup guide (PT) for wiring the GTM container

raiz-do-dominio/            files for the domain root (public_html/): robots.txt, sitemap.xml,
                             legacy landing index.html, favicon — kept separate from the /portfolio app
AUDITORIA-SEGURANCA-*.md    OWASP/LGPD-based security & compliance audit report
```

## Internationalization

Four locales: `en`, `es`, `pt-pt`, `pt-br`. Routing is `app/[lang]/...` with `generateStaticParams` + `dynamicParams = false` (every locale page is prerendered, no runtime locale negotiation on the server).

- **Node build**: `proxy.ts` reads `Accept-Language` / `x-vercel-ip-country` / `cf-ipcountry`, redirects to the best-matching locale, and remembers the choice in a `lang` cookie. Visitors geolocated in Brazil are always sent to `pt-br` and the language switcher is hidden for them (by design — see Decisions).
- **Static build**: there is no middleware on shared hosting, so the same logic runs client-side. `out/index.html` is a minimal script (written by `scripts/build-static.mjs`) that reads `navigator.languages` and `document.cookie`, picks a locale with the same precedence as `lib/locales.ts`, and redirects. A `noscript` fallback lists all four locale links.

## Static export pipeline

Shared hosting has no Node runtime, so `npm run build:static` (`scripts/build-static.mjs`) does:

1. Temporarily renames `proxy.ts` aside (it can't run without a server) and runs `next build` with `output: "export"` and a configurable `BASE_PATH` (default `/portfolio`, since the site lives at `aatlascompany.com.br/portfolio/`, not the domain root).
2. Rewrites hand-written `/assets/...` paths in the output to include the base path (Next only prefixes its own emitted links).
3. Flattens Next's segment-prefetch files — they're written as nested folders but requested by the router as dotted filenames — so client-side navigation doesn't 404.
4. Writes `index.html` (locale picker), a branded `404.html`, and `.htaccess` (security headers, HSTS without `includeSubDomains` so sibling subdomains aren't force-redirected, gzip, cache rules for hashed assets vs. HTML).

Output (`site/out/`) is uploaded as-is to `public_html/portfolio`.

## Tracking

Google Tag Manager, loaded only after cookie consent, after the page's `load` event, and inside `requestIdleCallback` — so it never affects Core Web Vitals or the Lighthouse score. The container ID is read at runtime from `public_html/portfolio/gtm.json`, so it can be turned on by editing one file on the server without a rebuild.

Consent Mode v2 defaults to **denied**. A banner offers Accept/Reject with equal visual weight; nothing from Google loads until the visitor accepts. Choice is stored in `localStorage` and can be reopened from the footer.

Events pushed to `dataLayer`: `page_view` (including each questionnaire step as a virtual pageview), `form_start`, `form_step`, `form_step_answer`, `generate_lead` (with service, timeline, first-touch UTM/gclid/fbclid, and an `event_id` for Meta Conversions API deduplication), `contact`, `social_click`, `select_content`, `preview_open`, `language_change`, `consent_update`. Full table and setup steps in `tracking/LEIA-ME.md`.

## Contact flow

Clicking any WhatsApp CTA opens a 3-step qualifying questionnaire instead of a raw `wa.me` link — service type, timeline, name — then builds the WhatsApp message and offers an Instagram DM alternative. Each step has its own URL (`?etapa=1|2|3|instagram`) via `pushState`, so back/forward and reload land on the right step; answers persist in `sessionStorage`. The panel reuses the site's own dark hero styling (no separate design system).

## SEO / AEO / GEO

- Per-page canonical + hreflang (incl. `x-default`), Open Graph, Twitter cards.
- JSON-LD: Person, ProfessionalService, WebSite, WebPage, CollectionPage, ItemList, CreativeWork, BreadcrumbList, generated from the same locale dictionaries that drive the UI (`lib/ld.ts`).
- `app/sitemap.ts` — all locale × route combinations with alternates.
- `app/llms.txt/route.ts` — plain-text summary for AI assistants/crawlers.
- `raiz-do-dominio/robots.txt` — references both the root and `/portfolio` sitemaps.

## Security

Reviewed against OWASP Top 10 / ASVS and LGPD (Brazilian data protection law) — see `AUDITORIA-SEGURANCA-2026-10-31.md`. Headers (CSP, X-Frame-Options, COOP, Permissions-Policy, HSTS), consent-gated tracking, and focus-trapped modals were implemented as part of that review.

## Decisions worth knowing

- **No Node hosting** → static export was chosen over SSR/ISR; the trade-off is no true per-request geolocation on the static build (handled client-side instead, see i18n above).
- **Brazil locked to `pt-br`** — visitors detected in Brazil cannot switch language; everyone else can, via a flag-based switcher placed under the "Let's talk" CTA and a persistent floating flag.
- **GTM container is empty by default** — no tracking ID is hardcoded; it must be filled in per deployment (`public_html/portfolio/gtm.json`), so this repo never ships a client's measurement ID.

## Local development

```bash
cd site
npm install
npm run dev            # Node dev server, http://localhost:3000
npm run build:static   # static export → site/out/ (ready to upload to public_html/portfolio)
```

## Deploying

1. `cd site && npm run build:static`
2. Upload the contents of `site/out/` to `public_html/portfolio` on the host.
3. Upload `raiz-do-dominio/` contents to `public_html` (domain root: robots.txt, sitemap.xml, root `index.html`).
4. Fill in `public_html/portfolio/gtm.json` with the real GTM container ID to turn on tracking.

---

🤖 README generated with [Claude Code](https://claude.com/claude-code)
