import type { Dict } from "./dict/en";
import type { Project } from "./projects";
import { htmlLang, type Locale } from "./locales";
import { SITE, CONTACT, url } from "./site";

// JSON-LD graphs (schema.org). Only facts already shown on the page.
const PERSON = `${SITE}/#antonio`;
const ORG = `${SITE}/#aatlas`;
const SITE_ID = `${SITE}/#website`;
const ADDRESS = { "@type": "PostalAddress", addressLocality: "Curitiba", addressRegion: "PR", addressCountry: "BR" };
const COUNTRIES = ["BR", "PY", "US", "MX", "ES", "PT"].map((c) => ({ "@type": "Country", name: c }));

export function homeLd(l: Locale, d: Dict) {
  const knows = [...d.about.offer.map((o) => o.t), ...d.work.tools];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON,
        name: "Antonio Chaves",
        jobTitle: d.meta.jobTitle,
        description: d.hero.sub,
        image: `${SITE}/assets/hero.jpg`,
        url: url(l),
        worksFor: { "@id": ORG },
        address: ADDRESS,
        sameAs: [CONTACT.instagram, CONTACT.linkedin],
        knowsAbout: knows,
      },
      {
        "@type": "ProfessionalService",
        "@id": ORG,
        name: "Aatlas Company",
        url: url(l),
        logo: `${SITE}/assets/logo.png`,
        image: `${SITE}/assets/og.jpg`,
        description: d.meta.description,
        slogan: d.hero.kicker,
        email: CONTACT.email,
        telephone: CONTACT.phone,
        founder: { "@id": PERSON },
        address: ADDRESS,
        areaServed: COUNTRIES,
        sameAs: [CONTACT.instagram, CONTACT.linkedin],
        knowsAbout: knows,
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: url(l),
        name: "Aatlas Company · Antonio Chaves",
        inLanguage: Object.values(htmlLang),
        publisher: { "@id": ORG },
      },
      {
        "@type": "WebPage",
        url: url(l),
        name: d.meta.title,
        description: d.meta.description,
        inLanguage: htmlLang[l],
        isPartOf: { "@id": SITE_ID },
        about: { "@id": PERSON },
        primaryImageOfPage: `${SITE}/assets/og.jpg`,
      },
    ],
  };
}

const crumbs = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
});

export function workLd(l: Locale, d: Dict, projects: Project[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        url: url(l, "/work"),
        name: `${d.meta.work} · Antonio Chaves`,
        description: d.meta.workDesc,
        inLanguage: htmlLang[l],
        isPartOf: { "@id": SITE_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: url(l, `/work/${p.slug}`), name: p.name })),
        },
      },
      crumbs([[d.footer.home, url(l)], [d.meta.work, url(l, "/work")]]),
    ],
  };
}

export function caseLd(l: Locale, d: Dict, p: Project) {
  const page = url(l, `/work/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        url: page,
        name: `${p.name} · ${p.type}`,
        headline: p.name,
        description: p.summary,
        abstract: p.challenge,
        inLanguage: htmlLang[l],
        image: p.image ? `${SITE}${p.image}` : `${SITE}/assets/og.jpg`,
        keywords: p.tags.join(", "),
        creator: { "@id": ORG },
        author: { "@id": PERSON },
        about: { "@type": "Organization", name: p.name, description: p.client, ...(p.location ? { address: p.location } : {}) },
        isPartOf: { "@id": SITE_ID },
      },
      crumbs([[d.footer.home, url(l)], [d.meta.work, url(l, "/work")], [p.name, page]]),
    ],
  };
}
