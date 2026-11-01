"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { animate, inView, scroll } from "motion";

const EXPO = [0.16, 1, 0.3, 1] as const;
const BASE = process.env.NEXT_PUBLIC_BASE ?? ""; // folder the static build lives in; the router adds it back
const EXIT = [0.55, 0.055, 0.675, 0.19] as const;

let navigated = false; // false until the first client-side route change

const $$ = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel));

/**
 * Motion layer only: load sequence, enter/exit on scroll, count-up, parallax and page exit.
 * Hides nothing in the markup, so without JS (or with reduced motion) the page renders as-is.
 */
export function MotionFx() {
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stops: VoidFunction[] = [];

    // The first-load hero sequence (photo settles, bar drops in, copy rises) is pure CSS in globals.css (.ld-*),
    // so it plays on first paint instead of waiting for hydration. Here only route changes fade the page in.
    const main = document.getElementById("main");
    if (navigated && main) animate(main, { opacity: [0, 1] }, { duration: 0.4, ease: EXPO });
    navigated = true;

    // scroll: every .rv enters when it comes in and leaves the way it went out
    $$(".rv").forEach((el) => {
      if (el.closest(".fi")) return;
      const delay = el.classList.contains("d3") ? 0.16 : el.classList.contains("d2") ? 0.08 : 0;
      el.style.opacity = "0";
      stops.push(
        inView(
          el,
          () => {
            animate(el, { opacity: 1, y: [32, 0] }, { duration: 0.8, ease: EXPO, delay }).then(() => {
              el.style.transform = ""; // hand transform back to CSS hover states
            });
            return (leave) => {
              animate(el, { opacity: 0, y: leave.boundingClientRect.top < 0 ? -24 : 24 }, { duration: 0.35, ease: EXIT });
            };
          },
          { amount: 0.15 },
        ),
      );
    });

    // results: numbers count up once
    $$(".rc .big").forEach((el) => {
      const m = el.textContent?.match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;
      const [, pre, num, post] = m;
      const stop = inView(el, () => {
        animate(0, Number(num), { duration: 1.4, ease: EXPO, onUpdate: (v) => (el.textContent = `${pre}${Math.round(v)}${post}`) });
        stop();
      });
      stops.push(stop);
    });

    // moving pictures: hero photo drifts, Atlas rises as the CTA scrolls in
    $$(".hp .ph").forEach((el) => stops.push(scroll(animate(el, { y: [0, 90] }, { ease: "linear" }), { target: el.closest(".hp")!, offset: ["start start", "end start"] })));
    $$(".cta-r img").forEach((el) => stops.push(scroll(animate(el, { y: [60, 0] }, { ease: "linear" }), { target: el.closest(".cta-s")!, offset: ["start end", "end end"] })));

    // page exit: fade main out before an internal navigation
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a");
      if (!a || !main || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      animate(main, { opacity: 0, y: -12 }, { duration: 0.25, ease: EXIT }).then(() => router.push(url.pathname.slice(BASE.length) + url.search + url.hash));
    };
    document.addEventListener("click", onClick);
    stops.push(() => document.removeEventListener("click", onClick));

    return () => stops.forEach((s) => s());
  }, [path, router]);

  return null;
}
