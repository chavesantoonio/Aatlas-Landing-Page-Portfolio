import en from "@/lib/dict/en";
import ptBr from "@/lib/dict/pt-br";
import { getProjects } from "@/lib/projects";
import { locales } from "@/lib/locales";
import { CONTACT, url } from "@/lib/site";

export const dynamic = "force-static";

// llms.txt (llmstxt.org): a plain summary for AI assistants, in English with the Brazilian positioning noted.
export function GET() {
  const cases = getProjects(en);
  const metric = (p: (typeof cases)[number]) => (p.results[0] ? ` Result: ${p.results[0].big} ${p.results[0].label}.` : "");
  const body = `# Antonio Chaves · Aatlas Company

> ${en.hero.sub} Serving clients in Brazil, Paraguay, the USA, Mexico, Spain and Portugal. Google Partner and Meta Business Partner.

In Brazil the offer is positioned as a premium end-to-end solution (${ptBr.hero.kicker.toLowerCase()}): website, paid traffic, tracking and automation from one team.

## Key facts
${en.about.facts.map((f) => `- ${f.big}: ${f.l}`).join("\n")}

## Services
${en.about.offer.map((o) => `- ${o.t}: ${o.d}`).join("\n")}
- Tools and stack: ${en.work.tools.join(", ")}

## Results
${en.work.results.map((r) => `- ${r.k}: ${r.big} ${r.l}. ${r.d}`).join("\n")}

## Case studies
${cases.map((p) => `- [${p.name}](${url("en", `/work/${p.slug}`)}): ${p.summary}${metric(p)}`).join("\n")}

## Pages
- [Home](${url("en")}): who Antonio Chaves is and what the team builds
- [Work](${url("en", "/work")}): all websites, automations and results
- Languages: ${locales.map((l) => url(l)).join(", ")}

## Contact
- WhatsApp: https://wa.me/554198145475
- Email: ${CONTACT.email}
- Instagram: ${CONTACT.instagram}
- LinkedIn: ${CONTACT.linkedin}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
