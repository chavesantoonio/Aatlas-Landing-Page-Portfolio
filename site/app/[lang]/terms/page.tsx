import { Legal, pageMeta } from "@/components/Site";
import { getT } from "@/lib/i18n";

// Template written from what this site does today. Have it reviewed by a lawyer before launch,
// and update it whenever a form, pixel, analytics or chat is added.
export async function generateMetadata() {
  const { d } = await getT();
  const page = d.legal.terms;
  const first = (page.sections[0]?.p[0] ?? page.intro?.[0] ?? "").replace(/\[\[|\]\]/g, "");
  return pageMeta(`${page.title} · Antonio Chaves`, first.length > 155 ? `${first.slice(0, 152).trimEnd()}…` : first, "/terms");
}

export default async function Page() {
  const { d } = await getT();
  return <Legal page={d.legal.terms} />;
}
