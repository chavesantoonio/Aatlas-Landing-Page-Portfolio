/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Eyebrow, WorkTop, BrowserFrame, CtaBand, SiteFooter, delay, pageMeta, JsonLd } from "@/components/Site";
import { workLd } from "@/lib/ld";
import { getProjects } from "@/lib/projects";
import { getT } from "@/lib/i18n";

export async function generateMetadata() {
  const { d } = await getT();
  return pageMeta(`${d.meta.work} · Antonio Chaves`, d.meta.workDesc, "/work");
}

export default async function Work() {
  const { l, d, to } = await getT();
  const w = d.work;
  const projects = getProjects(d);
  return (
    <>
    <JsonLd data={workLd(l, d, projects)} />
    <main id="main" className="pp">
      <section className="sec bg-c">
        <div className="mar" aria-hidden="true" />
        <div className="sec-in">
          <WorkTop back={{ href: to("/"), label: d.nav.home }} />
          <div className="fi" style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: "clamp(12px,3vw,40px)" }}>
            <Eyebrow>{w.eyebrow}</Eyebrow>
            <h1 className="wh1 serif">
              {w.h1a} <span>{w.h1b}</span>
            </h1>
            <p className="wsub">{w.sub}</p>
          </div>
        </div>
      </section>

      <section className="sec bg-w">
        <div className="sec-in">
          <Eyebrow>{w.casesEb}</Eyebrow>
          <h2 className="h2 serif rv">{w.casesH}</h2>
          <div className="showcase">
            {projects.map((p, i) => (
              <div key={p.slug} className={`sf rv${i % 2 ? " alt" : ""}`}>
                <BrowserFrame p={p} />
                <div className="mt">
                  <p className={`status mono${p.status === "IN PRODUCTION" ? " prod" : ""}`}>{d.status[p.status]}</p>
                  <h3 className="ptitle serif">{p.name}</h3>
                  <p className="pdesc">{p.summary}</p>
                  <div className="pills">{p.tags.map((t) => <p key={t} className="pill">{t}</p>)}</div>
                  {p.results[0] && (
                    <div className="ctx">
                      <p className="k mono">{w.clientResult}</p>
                      <p className="v">{p.results[0].big} {p.results[0].label}</p>
                    </div>
                  )}
                  <Link className="case-link" href={to(`/work/${p.slug}`)}>
                    {w.readCase} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec bg-c">
        <div className="sec-in">
          <Eyebrow>{w.buildEb}</Eyebrow>
          <h2 className="h2 serif rv">{w.buildH}</h2>
          <div className="two">
            {w.services.map((s, i) => (
              <div key={s.label} className={`card rv svc${i ? " d2" : ""}`}>
                <img className="fc" src={`/assets/${s.img}`} alt="" aria-hidden="true" />
                <div className="svc-b">
                  <div className="svc-k"><p className="mono">{s.label}</p><i aria-hidden="true" /></div>
                  <p className="svc-t serif">{s.title}</p>
                  <p className="svc-d">{s.desc}</p>
                  <div className="svc-l">{s.list.map((l) => <p key={l}>{l}</p>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec bg-w">
        <img className="corner" src="/assets/corner.webp" alt="" loading="lazy" decoding="async" aria-hidden="true" />
        <div className="sec-in">
          <Eyebrow>{w.autoEb}</Eyebrow>
          <h2 className="h2 serif rv">{w.autoH}</h2>
          <p className="lead rv">{w.autoLead}</p>
          <div className="grid4 g240">
            {w.automations.map((a, i) => (
              <div key={a.title} className={`card rv ac${delay(i)}`}>
                <div className="ic"><Icon name={a.icon} /></div>
                <p className="t">{a.title}</p>
                <p className="d">{a.desc}</p>
                <p className="g mono">{a.tag}</p>
              </div>
            ))}
          </div>
          <p className="toolbox mono rv">{w.toolbox}</p>
          <div className="pills rv">{w.tools.map((t) => <p key={t} className="pill">{t}</p>)}</div>
        </div>
      </section>

      <section className="sec bg-c">
        <div className="mar" aria-hidden="true" />
        <div className="sec-in">
          <div className="dstrip rv">
            <img className="hmi" src="/assets/think.webp" alt="" aria-hidden="true" />
            <div className="dstrip-b">
              <div className="dstrip-k"><p className="mono">{w.thinkK}</p><i aria-hidden="true" /></div>
              <p className="dstrip-t serif">{w.thinkT}</p>
              <p className="dstrip-d">{w.thinkD}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec bg-w">
        <div className="sec-in">
          <Eyebrow>{w.howEb}</Eyebrow>
          <h2 className="h2 serif rv">{w.howH}</h2>
          <div className="grid4 g230">
            {w.steps.map((s, i) => (
              <div key={s.t} className={`card rv sc${delay(i)}`}>
                <div className="ic"><p className="n serif">{i + 1}</p></div>
                <p className="t">{s.t}</p>
                <p className="d">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec bg-c">
        <div className="mar" aria-hidden="true" />
        <div className="sec-in">
          <Eyebrow>{w.resEb}</Eyebrow>
          <h2 className="h2 serif rv">{w.resH}</h2>
          <div className="grid4 g250">
            {w.results.map((r, i) => (
              <div key={r.k} className={`card rv rc${delay(i)}`}>
                <p className="k mono">{r.k}</p>
                <p className="big serif">{r.big}</p>
                <p className="l">{r.l}</p>
                <p className="d">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
    <SiteFooter />
    </>
  );
}
