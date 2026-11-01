// dataLayer for Google Tag Manager. Every push is a GA4-style event; the GTM container in
// /tracking/gtm-container.json maps them to GA4, Google Ads and Meta tags.
// Pushes made before GTM loads (or before consent) stay queued and are processed when it loads.

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  (window.dataLayer ??= []).push({ event, ...params });
}

const ATTR = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid"];
const ATTR_KEY = "ac-attr";

/** First-touch campaign parameters of this visit (utm_*, gclid, fbclid), kept for the lead event. */
export function attribution(): Params {
  try {
    const saved = sessionStorage.getItem(ATTR_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(location.search);
    const found = Object.fromEntries(ATTR.filter((k) => q.get(k)).map((k) => [k, q.get(k)!.slice(0, 120)]));
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
    return found;
  } catch {
    return {};
  }
}

/** Unique id per conversion, so a browser pixel and a server-side event can be deduplicated. */
export const eventId = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
