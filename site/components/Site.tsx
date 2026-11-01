/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { preload } from "react-dom";
import type { Metadata } from "next";
import { Icon } from "./Icons";
import { LangSwitch } from "./LangSwitch";
import { ConsentLink } from "./Tracking";
import { wa } from "@/lib/data";
import { getT } from "@/lib/i18n";
import { locales, htmlLang } from "@/lib/locales";
import type { LegalPage } from "@/lib/dict/en";
import type { Project } from "@/lib/projects";
import { SITE, url } from "@/lib/site";

export const delay = (i: number) => (i % 3 === 1 ? " d2" : i % 3 === 2 ? " d3" : "");

const OG_LOCALE: Record<string, string> = { en: "en_US", es: "es_ES", "pt-pt": "pt_PT", "pt-br": "pt_BR" };

/** Title, description, canonical, hreflang, Open Graph and Twitter card for a path (without the locale prefix). */
export async function pageMeta(title: string, description: string | undefined, path: string, type: "website" | "article" = "website"): Promise<Metadata> {
  const { l } = await getT();
  const image = { url: `${SITE}/assets/og.jpg`, width: 1200, height: 630, alt: "Antonio Chaves · Aatlas Company" };
  return {
    title,
    description,
    alternates: {
      canonical: url(l, path),
      languages: { ...Object.fromEntries(locales.map((x) => [htmlLang[x], url(x, path)])), "x-default": url("en", path) },
    },
    openGraph: {
      type,
      title,
      description,
      url: url(l, path),
      siteName: "Aatlas Company · Antonio Chaves",
      locale: OG_LOCALE[l],
      alternateLocale: locales.filter((x) => x !== l).map((x) => OG_LOCALE[x]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

/** Structured data for search engines and AI answers. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}

export function Eyebrow({ children }: { children: string }) {
  return (
    <div className="eb rv">
      <p className="mono">{children}</p>
      <i aria-hidden="true" />
    </div>
  );
}

/** "Let's talk" button with the language flags under it. */
export async function TalkNav({ cls }: { cls: string }) {
  const { d } = await getT();
  return (
    <div className="hnav-cta">
      <a className={cls} href={wa(d.waHello)}>{d.nav.talk}</a>
      <LangSwitch label={d.nav.language} />
    </div>
  );
}

/** Light top bar used on /work and every case page. */
export async function WorkTop({ back }: { back: { href: string; label: string } }) {
  const { d, to } = await getT();
  preload("/assets/marble.webp", { as: "image", fetchPriority: "high" }); // the page's first paint (.mar background) is in CSS, found late otherwise
  return (
    <div className="wtop">
      <Link href={to("/")} className="hbrand wbrand">
        <div className="lg" role="img" aria-label={d.nav.logo} style={{ width: 40, height: 33, background: "#1A1410" }} />
        <p><span className="brand-full">AATLAS COMPANY - </span>ANTONIO CHAVES</p>
      </Link>
      <div className="wnav">
        <Link className="bk nv-w" href={back.href}>← {back.label}</Link>
        <TalkNav cls="btn wbtn" />
      </div>
    </div>
  );
}

/** Desktop browser window with a phone beside it; shows the screenshot when the project has one. */
export async function BrowserFrame({ p }: { p: Project }) {
  const { frame } = (await getT()).d;
  return (
    <div className="fr">
      <div className="bf">
        <div className="bf-bar">
          <span className="dot" aria-hidden="true" /><span className="dot" aria-hidden="true" /><span className="dot" aria-hidden="true" />
          <p className="url mono">yourcustomdomain.com</p>
        </div>
        {p.image ? (
          <img className="bf-img" src={p.image} alt={`${p.name}, ${frame.desktop}`} />
        ) : (
          <div className="bf-body">
            <p className="k mono">{frame.deskPh}</p>
            <p className="s">{frame.deskPhS}</p>
          </div>
        )}
      </div>
      {p.mobile ? (
        <div className="phn phn-img"><img src={p.mobile} alt={`${p.name}, ${frame.mobile}`} /></div>
      ) : (
        !p.image && <div className="phn" aria-label={frame.mobPh}><p className="mono">MOBILE</p></div>
      )}
    </div>
  );
}

export async function CtaBand({ title }: { title?: string }) {
  const { cta, waHello } = (await getT()).d;
  return (
    <section className="cta-s tex">
      <div className="lg cta-logo" aria-hidden="true" />
      <div className="cta-in">
        <div className="cta-l rv">
          <h2 className="cta-h serif">{title ?? cta.title}</h2>
          <p className="cta-p">{cta.p}</p>
          <div style={{ display: "flex" }}>
            <a className="btn wa" href={wa(waHello)}>
              <span><Icon name="whatsapp" size={22} /></span>{cta.wa}
            </a>
          </div>
          <p className="cta-n">{cta.note}</p>
        </div>
        <div className="cta-r rv d2">
          <img src="/assets/atlas.webp" alt={cta.atlas} />
        </div>
      </div>
    </section>
  );
}

const IG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" />
  </svg>
);
const LI = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
    <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.96 1.96 0 1 0 5.25 6.9 1.96 1.96 0 0 0 5.25 3ZM20.44 13.4c0-3.46-1.84-5.07-4.3-5.07a3.7 3.7 0 0 0-3.36 1.85V8.5H9.4V20h3.38v-5.7c0-1.5.28-2.96 2.14-2.96 1.84 0 1.86 1.72 1.86 3.06V20h3.38l.28-6.6Z" />
  </svg>
);

/** Full footer for the home page: titan and orange under a dark fade, links, legal pages and social icons. */
export async function HomeFooter() {
  const { d, to } = await getT();
  const f = d.footer;
  const social = [
    { label: "WhatsApp", href: wa(d.waHello), icon: <Icon name="whatsapp" size={20} /> },
    { label: "Instagram", href: "https://instagram.com/chavesantoonio", icon: IG },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/chavesantoonio", icon: LI },
  ];
  return (
    <footer className="foot foot-rich">
      <div className="foot-bg" aria-hidden="true">
        <img src="/assets/atlas.webp" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="fr-in">
        <div className="fr-top">
          <div className="fr-brand">
            <div className="l">
              <div className="lg" role="img" aria-label={d.nav.logo} style={{ width: 40, height: 33, background: "#fff" }} />
              <p className="bn fr-name">AATLAS COMPANY</p>
            </div>
            <p className="fr-tag">{f.tag}</p>
            <ul className="fr-social">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">{s.icon}</a>
                </li>
              ))}
            </ul>
          </div>
          <nav className="fr-col" aria-label={f.site}>
            <p className="fr-h mono">{f.site}</p>
            <Link href={to("/")}>{f.home}</Link>
            <Link href={to("/work")}>{f.work}</Link>
            <Link href={`${to("/")}#projects`}>{f.cases}</Link>
          </nav>
          <nav className="fr-col" aria-label={f.legal}>
            <p className="fr-h mono">{f.legal}</p>
            <Link href={to("/privacy")}>{f.privacy}</Link>
            <Link href={to("/terms")}>{f.terms}</Link>
            <Link href={to("/accessibility")}>{f.a11y}</Link>
            <ConsentLink label={d.consent.prefs} />
          </nav>
          <div className="fr-col">
            <p className="fr-h mono">{f.contact}</p>
            <a className="fr-ic" href={wa(d.waHello)}>
              <Icon name="whatsapp" size={18} />
              WhatsApp
            </a>
            <a className="fr-ic" href="mailto:contato@aatlascompany.com.br">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              contato@aatlascompany.com.br
            </a>
          </div>
        </div>
        <div className="fr-bottom">
          <p>{f.rights}</p>
        </div>
      </div>
    </footer>
  );
}

export async function SiteFooter() {
  const { d, to } = await getT();
  const f = d.footer;
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="l">
          <div className="lg" role="img" aria-label={d.nav.logo} style={{ width: 36, height: 30, background: "#fff" }} />
          <p>{f.short}</p>
        </div>
        <p className="r">
          © 2026 Aatlas Company · <Link href={to("/privacy")}>{f.privacyShort}</Link> · <Link href={to("/terms")}>{f.termsShort}</Link> ·{" "}
          <Link href={to("/accessibility")}>{f.a11y}</Link>
          <ConsentLink label={` · ${d.consent.prefs}`} />
        </p>
      </div>
    </footer>
  );
}

/** Legal page body. [[text]] in a paragraph becomes a direct WhatsApp link (skips the questionnaire). */
export async function Legal({ page }: { page: LegalPage }) {
  const { d, to } = await getT();
  const para = (text: string, i: number) => (
    <p key={i}>
      {text.split(/\[\[(.+?)\]\]/).map((part, j) => (j % 2 ? <a key={j} href={wa(d.waHello)} data-direct="">{part}</a> : part))}
    </p>
  );
  return (
    <main id="main" className="legal">
      <h1 className="serif">{page.title}</h1>
      {page.intro?.map(para)}
      {page.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p.map(para)}
        </section>
      ))}
      <p><Link href={to("/")}>{d.legal.back}</Link></p>
    </main>
  );
}
