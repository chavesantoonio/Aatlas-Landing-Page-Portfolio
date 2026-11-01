import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow, WorkTop, BrowserFrame, CtaBand, SiteFooter, delay, pageMeta, JsonLd } from "@/components/Site";
import { caseLd } from "@/lib/ld";
import { getProjects, slugs } from "@/lib/projects";
import { getT } from "@/lib/i18n";
import { PreviewLink } from "@/components/SitePreview";

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[lang]/work/[slug]">) {
  const { slug } = await props.params;
  const p = getProjects((await getT()).d).find((x) => x.slug === slug);
  return p ? pageMeta(`${p.name}: ${p.card} · Antonio Chaves`, p.summary, `/work/${slug}`, "article") : {};
}

export default async function Case(props: PageProps<"/[lang]/work/[slug]">) {
  const { slug } = await props.params;
  const { l, d, to } = await getT();
  const c = d.cases;
  const projects = getProjects(d);
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  const meta = [
    [c.client, p.client],
    ...(p.location ? [[c.location, p.location]] : []),
    [c.scope, p.tags.join(", ")],
    [c.status, d.status[p.status]],
  ];

  return (
    <>
    <JsonLd data={caseLd(l, d, p)} />
    <main id="main" className="pp">
      <section className="sec bg-c">
        <div className="mar" aria-hidden="true" />
        <div className="sec-in">
          <WorkTop back={{ href: to("/work"), label: d.nav.allWork }} />
          <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: "clamp(12px,3vw,40px)" }}>
            <Eyebrow>{`${c.eyebrow} · ${p.type.toUpperCase()}`}</Eyebrow>
            <h1 className="wh1 serif">{p.name}</h1>
            <p className="wsub">{p.summary}</p>
            <dl className="cs-meta">
              {meta.map(([k, v]) => (
                <div key={k} className="ctx">
                  <dt className="k mono">{k}</dt>
                  <dd className="v">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="sec bg-w">
        <div className="sec-in">
          <div className="cs-frame rv">
            <BrowserFrame p={p} />
          </div>
          {p.links && (
            <div className="cs-links rv">
              {p.links.map((l) => (
                <PreviewLink key={l.url} link={l} name={p.name} t={d.preview} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sec bg-c">
        <div className="mar" aria-hidden="true" />
        <div className="sec-in cs-cols">
          <div className="cs-col">
            <Eyebrow>{c.challengeEb}</Eyebrow>
            <h2 className="h2 serif rv">{c.challengeH}</h2>
            <p className="pdesc rv">{p.challenge}</p>
          </div>
          <div className="cs-col">
            <Eyebrow>{c.builtEb}</Eyebrow>
            <ul className="cs-list rv d2">
              {p.built.map((b) => <li key={b}>{b}</li>)}
            </ul>
            {p.ongoing && (
              <>
                <p className="toolbox mono rv">{c.runEb}</p>
                <div className="pills rv">{p.ongoing.map((o) => <p key={o} className="pill">{o}</p>)}</div>
              </>
            )}
            <div className="pills rv d3">{p.tags.map((t) => <p key={t} className="pill">{t}</p>)}</div>
          </div>
        </div>
      </section>

      {p.results.length > 0 && (
        <section className="sec bg-w">
          <div className="sec-in">
            <Eyebrow>{c.resultsEb}</Eyebrow>
            <div className="grid4 g250">
              {p.results.map((r, i) => (
                <div key={r.label} className={`card rv rc${delay(i)}`}>
                  <p className="k mono">{p.name.toUpperCase()}</p>
                  <p className="big serif">{r.big}</p>
                  <p className="l">{r.label}</p>
                  {r.note && <p className="d">{r.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`sec ${p.results.length ? "bg-c" : "bg-w"}`}>
        <div className="sec-in">
          <Eyebrow>{c.nextEb}</Eyebrow>
          <Link className="cs-next rv" href={to(`/work/${next.slug}`)}>
            <span className="h2 serif">{next.name}</span>
            <span className="cs-next-t">{next.type} <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </section>

      <CtaBand title={c.cta} />
    </main>
    <SiteFooter />
    </>
  );
}
