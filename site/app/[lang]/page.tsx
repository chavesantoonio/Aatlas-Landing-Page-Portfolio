/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { clients, badges, trustedBy, wa } from "@/lib/data";
import { mapDots } from "@/lib/map";
import { getProjects } from "@/lib/projects";
import { getT } from "@/lib/i18n";
import { LogoCloud } from "@/components/LogoCloud";
import { WorldMap } from "@/components/MapClient";
import { HomeFooter, TalkNav, pageMeta, JsonLd } from "@/components/Site";
import { homeLd } from "@/lib/ld";

export async function generateMetadata() {
  const { d } = await getT();
  return pageMeta(d.meta.title, d.meta.description, "/");
}

export default async function Home() {
  const { l, d, to } = await getT();
  const { hero, about } = d;
  return (
    <>
    <JsonLd data={homeLd(l, d)} />
    <main id="main">
    <section className="hp">
      <Image
        className="ph"
        src="/assets/hero.jpg"
        alt={hero.alt}
        width={1138}
        height={1600}
        sizes="(min-width: 900px) 56vw, 100vw"
        fetchPriority="high"
        loading="eager"
        quality={80}
      />
      <div className="hw">
        <div className="htop">
          <div className="hbrand">
            <div className="lg" role="img" aria-label={d.nav.logo} style={{ width: 40, height: 33, background: "#fff" }} />
            <p className="bn">
              <span className="brand-full">AATLAS COMPANY - </span>ANTONIO CHAVES
            </p>
          </div>
          <div className="hnav">
            <Link className="nl nv-h" href={to("/work")}>{d.nav.work}</Link>
            <TalkNav cls="btn hbtn-o hbtn-nav bn" />
          </div>
        </div>

        <div className="hm">
          <div className="hb fi">
            <div className="hkick">
              <p className="mono">{hero.kicker}</p>
              <i aria-hidden="true" />
            </div>
            <h1 className="hh serif">
              {hero.h1a} <span>{hero.h1b}</span>
            </h1>
            <p className="hs">{hero.sub}</p>
            <div className="cta">
              <a className="btn hbtn-p" href={wa(d.waHello)}>{hero.wa} <span className="ar">→</span></a>
              <Link className="btn hbtn-o hbtn-lg" href={to("/work")}>{hero.work}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="lc" aria-labelledby="lc-h">
      <div className="lc-in">
        <div className="hkick"><h2 id="lc-h" className="mono">{d.clients.h}</h2><i aria-hidden="true" /></div>
      </div>
      <LogoCloud clients={clients} variant="marquee" />
      <div className="tr">
        <p className="tr-t">{d.clients.trust}</p>
        <ul className="tr-row">
          {trustedBy.map((t) => (
            <li key={t.name}><img src={t.logo} alt={t.name} loading="lazy" decoding="async" /></li>
          ))}
        </ul>
      </div>
    </section>

    <section className="ab" aria-labelledby="ab-h">
      <div className="ab-in">
        <div className="hkick rv"><p className="mono">{about.kicker}</p><i aria-hidden="true" /></div>
        <h2 id="ab-h" className="ab-h serif rv">{about.h}</h2>
        <div className="ab-facts">
          {about.facts.map((f, i) => (
            <div key={f.l} className={`ab-fact rv${i % 2 ? " d2" : ""}`}>
              <p className="ab-big serif">{f.big}</p>
              <p className="ab-l">{f.l}</p>
            </div>
          ))}
        </div>
        <div className="ab-map rv">
          <WorldMap dots={mapDots(d.map)} lineColor="#FF9F66" />
        </div>
        <div className="ab-badges">
          <p className="fr-h mono rv">{about.badges}</p>
          <ul className="bd-row">
            {badges.map((b, i) => {
              const detail = about.badgeDetail[b.detail] ?? b.detail;
              return (
                <li key={b.name} className={`bd rv${i % 2 ? " d2" : ""}${b.bar ? " bd-bar" : ""}`}>
                  <div className={`bd-mark bd-${b.layout}`} role="img" aria-label={b.name}>
                    <img src={b.logo} alt="" loading="lazy" decoding="async" />
                    {b.text && <span>{b.text}</span>}
                  </div>
                  <p className="bd-kind">{b.kind === "PARTNER" ? detail : `${about.training} · ${detail}`}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="ab-offer">
          {about.offer.map((o, i) => (
            <div key={o.t} className={`ab-o rv${i === 1 ? " d2" : i === 2 ? " d3" : ""}`}>
              <p className="ab-t">{o.t}</p>
              <p className="ab-d">{o.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="pf" id="projects" aria-labelledby="pf-h">
      <div className="pf-in">
        <div className="hkick rv"><h2 id="pf-h" className="mono">{d.home.projects}</h2><i aria-hidden="true" /></div>
        <div className="pf-grid">
          {getProjects(d).map((p, i) => (
            <Link key={p.slug} href={to(`/work/${p.slug}`)} className={`pf-card rv${i % 2 ? " d2" : ""}`}>
              <div className="pf-img">
                {(p.cover ?? p.image) && <img className="pf-bg" src={p.cover ?? p.image} alt="" loading="lazy" decoding="async" />}
                <div className="pf-t">
                  <p className="serif">{p.card}</p>
                  <span>{p.name} / {p.type}</span>
                </div>
              </div>
              <p className="pf-cap">{d.home.read} <span aria-hidden="true">→</span></p>
            </Link>
          ))}
        </div>
        <Link className="btn hbtn-o hbtn-lg pf-more rv" href={to("/work")}>{d.home.all} <span className="ar">→</span></Link>
      </div>
    </section>
    </main>
    <HomeFooter />
    </>
  );
}
