import type { Dict } from "./dict/en";

export type Metric = { big: string; label: string; note?: string };

export type SiteLink = {
  /** key into dict.preview.links */
  label: "main" | "booking" | "visit";
  url: string;
  /** set when the site blocks iframes (X-Frame-Options): the preview shows these screenshots instead */
  shots?: { desktop?: string; mobile?: string };
};

export type Status = "DELIVERED" | "IN PRODUCTION" | "RUNNING";

/** The words of a case, one copy per language in lib/dict/*.ts. */
export type CaseCopy = {
  /** short title on the home grid card */
  card: string;
  type: string;
  client: string;
  summary: string;
  challenge: string;
  built: string[];
  /** ongoing work Aatlas runs for the client */
  ongoing?: string[];
  /** numbers the client can confirm; leave empty rather than guess */
  results: Metric[];
  tags: string[];
};

type ProjectBase = {
  slug: string;
  name: string;
  location?: string;
  status: Status;
  /** live pages, opened in the in-site device preview (components/SitePreview.tsx) */
  links?: SiteLink[];
  /** screenshots in public/assets/projects/: desktop fills the browser frame, mobile the phone */
  image?: string;
  mobile?: string;
  /** background of the home grid card; falls back to `image` */
  cover?: string;
};

export type Project = ProjectBase & CaseCopy;

const shot = (slug: string) => ({
  image: `/assets/projects/${slug}-desktop.webp`,
  mobile: `/assets/projects/${slug}-mobile.webp`,
});

// Case copy written from each live site and the brief; confirm every line with the client before launch.
const base: ProjectBase[] = [
  {
    slug: "samurai-experience",
    name: "Samurai Experience",
    location: "Curitiba, PR",
    status: "DELIVERED",
    links: [
      { label: "main", url: "https://samuraiexperience.com.br/" },
      {
        label: "booking",
        url: "https://samuraiexperience.com.br/agendar/",
        shots: { desktop: "/assets/projects/samurai-agendar-desktop.webp", mobile: "/assets/projects/samurai-agendar-mobile.webp" },
      },
    ],
    ...shot("samurai-experience"),
    cover: "/assets/projects/samurai-cover.webp",
  },
  {
    slug: "quintal-da-nona",
    name: "Quintal da Nona",
    location: "Campo Largo, PR",
    status: "IN PRODUCTION",
    links: [{ label: "visit", url: "https://quintal-da-nona-cl.vercel.app/" }],
    ...shot("quintal-da-nona"),
  },
  {
    slug: "ifo-fisioterapia",
    name: "IFO Fisioterapia",
    location: "Campo Largo, PR",
    status: "IN PRODUCTION",
    links: [{ label: "visit", url: "https://ifo-fisioterapia.vercel.app/" }],
    ...shot("ifo-fisioterapia"),
  },
  {
    slug: "barbearia-lins",
    name: "Barbearia Lins",
    location: "Curitiba, PR",
    status: "DELIVERED",
    links: [{ label: "visit", url: "https://www.barbearialins.com.br/" }],
    ...shot("barbearia-lins"),
  },
  {
    slug: "uni-global",
    name: "Uni Global Certificações",
    status: "DELIVERED",
    links: [
      {
        label: "visit",
        url: "https://uniglobalcertificacoes.com.br/page",
        shots: { desktop: "/assets/projects/uni-global-desktop.webp" },
      },
    ],
    image: "/assets/projects/uni-global-desktop.webp", // no mobile shot: the site blocks automated phone browsers
  },
  {
    slug: "aviario-campo-pet",
    name: "Aviário Campo Pet",
    location: "Campo Largo, PR",
    status: "IN PRODUCTION",
    links: [{ label: "visit", url: "https://aviario-campopet-cl.vercel.app/" }],
    image: "/assets/projects/aviario-campopet-desktop.webp",
    mobile: "/assets/projects/aviario-campopet-mobile.webp",
  },
];

export const slugs = base.map((p) => p.slug);

/** Every project with its copy in the given language. */
export const getProjects = (d: Dict): Project[] => base.map((p) => ({ ...p, ...d.cases.items[p.slug] }));
