export const PHONE = "554198145475";
export const INSTAGRAM_DM = "https://ig.me/m/chavesantoonio";
/** wa.me link with a pre-filled message. Clicks on these open the contact questionnaire (components/Talk.tsx) first. */
export const wa = (text: string) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;

export type Client = { name: string; logo?: string; /** display height in px, set from the logo's proportions so all read the same size */ h?: number };

// Drop each logo (SVG or transparent PNG) in public/assets/clients/ and set `logo`; it renders in white.
// Order alternates round badges and wide wordmarks so two round logos never sit side by side.
export const clients: Client[] = [
  { name: "Barbearia Lins", logo: "/assets/clients/barbearia-lins.webp", h: 48 },
  { name: "Samurai Experience", logo: "/assets/clients/samurai-experience.webp", h: 36 },
  { name: "Atual & Lima Imobiliária", logo: "/assets/clients/atual-lima.webp", h: 48 },
  { name: "VSP Proteção de Caminhão", logo: "/assets/clients/vsp.webp", h: 38 },
  { name: "Uni Global Certificações", logo: "/assets/clients/uni-global.webp", h: 48 }, // TODO: confirm this is Uni Global's mark
  { name: "Neuropax Medical", logo: "/assets/clients/neuropax.webp", h: 38 },
  { name: "Atual Correspondente Bancário", logo: "/assets/clients/atual.webp", h: 48 },
  { name: "Vestilo", logo: "/assets/clients/vestilo.webp", h: 36 },
  { name: "Befit Treinamento Personalizado", logo: "/assets/clients/befit.webp", h: 48 },
];


// Partner badges and training, drawn from the official vector logos (Wikimedia Commons) in public/assets/badges/.
// Google Partner and Meta Business Partner status confirmed active by the client (Oct 2026).
export type Badge = {
  name: string;
  kind: "PARTNER" | "TRAINING";
  /** key into dict.about.badgeDetail */
  detail: string;
  logo: string;
  /** text set beside or under the logo, as on the official badge */
  text?: string;
  layout: "stack" | "inline";
  /** Google Partner's blue bar on the left */
  bar?: boolean;
};
export const badges: Badge[] = [
  { name: "Google Partner", kind: "PARTNER", detail: "Google Ads", logo: "/assets/badges/google.svg", text: "Partner", layout: "stack", bar: true },
  { name: "Meta Business Partner", kind: "PARTNER", detail: "Meta Ads", logo: "/assets/badges/meta.svg", text: "Business Partner", layout: "stack" },
  { name: "OpenAI Academy", kind: "TRAINING", detail: "AI training", logo: "/assets/badges/openai-symbol.svg", text: "OpenAI Academy", layout: "inline" },
  { name: "Anthropic Courses", kind: "TRAINING", detail: "Claude and AI agents", logo: "/assets/badges/anthropic.svg", layout: "stack" },
];

// Shown as "people from these companies trust our work", not as company clients or endorsements.
// Trademarks of their owners; confirm with a lawyer before launch (see report).
export const trustedBy = [
  { name: "Bradesco", logo: "/assets/trust/bradesco.webp" },
  { name: "CAIXA Aqui", logo: "/assets/trust/caixa-aqui.webp" },
  { name: "TIM", logo: "/assets/trust/tim.webp" },
];
