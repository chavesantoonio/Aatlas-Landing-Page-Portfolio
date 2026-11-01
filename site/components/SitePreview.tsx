"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useFocusTrap } from "@/lib/focus-trap";
import type { SiteLink } from "@/lib/projects";
import type { Dict } from "@/lib/dict/en";
import { track } from "@/lib/track";

type T = Dict["preview"];

const EXPO = [0.16, 1, 0.3, 1] as const;
const SHOWN_DOMAIN = "yourcustomdomain.com"; // client domains stay private in every mockup
const DEVICE = { desktop: { w: 1440, h: 900 }, mobile: { w: 390, h: 844 } } as const;
type Mode = keyof typeof DEVICE;

/** Renders a page at its real device width and scales it to fit the box it is given. */
function Screen({ link, mode, name, t }: { link: SiteLink; mode: Mode; name: string; t: T }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const { w, h } = DEVICE[mode];

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / w));
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  const shot = link.shots?.[mode];
  if (link.shots) {
    // the site refuses to be framed: show its screenshot instead
    return (
      <div ref={box} className="sp-screen sp-scroll" style={{ aspectRatio: `${w} / ${h}` }}>
        {shot ? (
          <img src={shot} alt={`${name} · ${t[mode]}`} />
        ) : (
          <p className="sp-msg">{t.unavailable[mode]}</p>
        )}
      </div>
    );
  }
  return (
    <div ref={box} className="sp-screen" style={{ aspectRatio: `${w} / ${h}` }}>
      {!loaded && <p className="sp-msg">{t.loading}</p>}
      {scale > 0 && (
        <iframe
          src={link.url}
          title={`${name} · ${t[mode]}`}
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ width: w, height: h, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
        />
      )}
    </div>
  );
}

function Bar() {
  return (
    <div className="bf-bar">
      <span className="dot" aria-hidden="true" /><span className="dot" aria-hidden="true" /><span className="dot" aria-hidden="true" />
      <p className="url mono">{SHOWN_DOMAIN}</p>
    </div>
  );
}

function Modal({ link, name, onClose, t }: { link: SiteLink; name: string; onClose: () => void; t: T }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const pick = (m: Mode) => (
    <button key={m} className={`sp-pick${mode === m ? " on" : ""}`} onClick={() => (setMode(m), track("preview_open", { project: name, device: m }))} aria-pressed={mode === m}>
      {m === "desktop" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
      )}
      {t[m]}
    </button>
  );

  return (
    <motion.div
      ref={box}
      className="sp"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} · ${t.dialog}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sp-top">
        <p className="sp-name serif">{name}</p>
        {mode && <div className="sp-switch">{pick("desktop")}{pick("mobile")}</div>}
        <button ref={closeBtn} className="sp-close" onClick={onClose} aria-label={t.close}>×</button>
      </div>

      <AnimatePresence mode="wait">
        {!mode && (
          <motion.div
            key="choose"
            className="sp-choose bf"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20, transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <Bar />
            <div className="sp-choose-in">
              <p className="sp-q serif">{t.q}</p>
              <div className="sp-picks">{pick("desktop")}{pick("mobile")}</div>
            </div>
          </motion.div>
        )}
        {mode === "desktop" && (
          <motion.div
            key="desktop"
            className="sp-desk bf"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <Bar />
            <Screen link={link} mode="desktop" name={name} t={t} />
          </motion.div>
        )}
        {mode === "mobile" && (
          <motion.div
            key="mobile"
            className="sp-phone"
            initial={{ opacity: 0, scale: 0.9, y: 40, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <Screen link={link} mode="mobile" name={name} t={t} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const noop = () => () => {};

/** A "visit" link that opens the client site inside our own device mockup instead of leaving the page. */
export function PreviewLink({ link, name, t }: { link: SiteLink; name: string; t: T }) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false); // true only in the browser, for the portal
  const trigger = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  return (
    <>
      <button ref={trigger} type="button" className="case-link" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {t.links[link.label]} <span aria-hidden="true">↗</span>
      </button>
      {mounted && createPortal(<AnimatePresence>{open && <Modal link={link} name={name} onClose={close} t={t} />}</AnimatePresence>, document.body)}
    </>
  );
}
