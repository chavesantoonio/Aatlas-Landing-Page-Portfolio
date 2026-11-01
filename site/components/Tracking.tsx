"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { track } from "@/lib/track";
import type { Dict } from "@/lib/dict/en";

// GTM with Consent Mode v2, loaded only after the visitor accepts (LGPD/GDPR) and off the critical path.
// The container id lives in gtm.json next to the site, so it can be set on the server without a rebuild.
const BASE = process.env.NEXT_PUBLIC_BASE ?? "";
const KEY = "ac-consent"; // "granted" | "denied", with the date in ac-consent-at as the consent record
const OPEN = "ac-consent-open";

function gtag(...args: unknown[]) {
  void args;
  // gtag's contract is the arguments object itself
  // eslint-disable-next-line prefer-rest-params
  (window.dataLayer ??= []).push(arguments);
}
const consent = (v: "granted" | "denied") => ({ ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v });

if (typeof window !== "undefined") gtag("consent", "default", { ...consent("denied"), wait_for_update: 500 });

let loaded = false;
function loadGtm(id: string) {
  if (loaded || !/^GTM-[A-Z0-9]+$/.test(id)) return;
  loaded = true;
  const start = () => {
    (window.dataLayer ??= []).push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.appendChild(s);
  };
  // after the page has loaded and the main thread is idle: tracking never competes with the first paint
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1500));
  if (document.readyState === "complete") idle();
  else addEventListener("load", idle, { once: true });
}

const subscribe = (cb: () => void) => {
  addEventListener("ac-consent", cb);
  addEventListener("storage", cb);
  return () => {
    removeEventListener("ac-consent", cb);
    removeEventListener("storage", cb);
  };
};
const readChoice = () => localStorage.getItem(KEY) ?? "";

/** Consent banner, GTM loader, page views and click events. */
export function Tracking({ t, privacyHref }: { t: Dict["consent"]; privacyHref: string }) {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "server");
  const [gtmId, setGtmId] = useState("");
  const [reopen, setReopen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    fetch(`${BASE}/gtm.json`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((c: { gtm_id?: string }) => setGtmId((c.gtm_id ?? "").trim()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (gtmId) document.documentElement.dataset.tracking = "on"; // shows the footer's cookie preferences link
    if (choice !== "granted" || !gtmId) return;
    gtag("consent", "update", consent("granted"));
    loadGtm(gtmId);
  }, [choice, gtmId]);

  // a page view for every route, first load included (GA4 tag runs with send_page_view off)
  useEffect(() => {
    track("page_view", {
      page_location: location.href,
      page_path: location.pathname,
      page_title: document.title,
      language: document.documentElement.lang,
    });
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>("a[href]");
      if (!a) return;
      const href = a.href;
      if (href.startsWith("mailto:")) track("contact", { method: "email" });
      else if (href.startsWith("https://wa.me/") && a.hasAttribute("data-direct")) track("contact", { method: "whatsapp" });
      else if (/instagram\.com|linkedin\.com/.test(href)) track("social_click", { network: href.includes("linkedin") ? "linkedin" : "instagram", link_url: href });
      else {
        const slug = href.match(/\/work\/([a-z0-9-]+)\/?$/)?.[1];
        if (slug) track("select_content", { content_type: "case", item_id: slug });
      }
    };
    const onOpen = () => setReopen(true);
    document.addEventListener("click", onClick);
    addEventListener(OPEN, onOpen);
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener(OPEN, onOpen);
    };
  }, []);

  const decide = (v: "granted" | "denied") => {
    localStorage.setItem(KEY, v);
    localStorage.setItem(`${KEY}-at`, new Date().toISOString());
    gtag("consent", "update", consent(v));
    track("consent_update", { consent: v });
    setReopen(false);
    dispatchEvent(new Event("ac-consent"));
  };

  if (!gtmId || choice === "server" || (choice && !reopen)) return null;
  return (
    <div className="ck" role="region" aria-label={t.title}>
      <p>
        {t.text} <Link href={privacyHref}>{t.policy}</Link>
      </p>
      <div className="ck-b">
        <button type="button" className="btn ck-btn" onClick={() => decide("denied")}>{t.reject}</button>
        <button type="button" className="btn ck-btn" onClick={() => decide("granted")}>{t.accept}</button>
      </div>
    </div>
  );
}

/** Footer link that reopens the consent banner. */
export function ConsentLink({ label }: { label: string }) {
  return (
    <button type="button" className="ck-link" onClick={() => dispatchEvent(new Event(OPEN))}>
      {label}
    </button>
  );
}
