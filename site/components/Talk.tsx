"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useFocusTrap } from "@/lib/focus-trap";
import { Icon } from "./Icons";
import { INSTAGRAM_DM, wa } from "@/lib/data";
import { attribution, eventId, track } from "@/lib/track";
import type { Dict } from "@/lib/dict/en";

const EXPO = [0.16, 1, 0.3, 1] as const;
const PARAM = "etapa"; // each step has its own URL: ?etapa=1, 2, 3, instagram
const SAVE = "ac-qf";
const FORM = "qualify";
// language-neutral answer ids for tracking, in the order of the options in every dictionary
const SERVICES = ["website", "system", "paid_traffic", "question"];
const TIMELINES = ["this_week", "this_month", "1_3_months", "researching"];

type Step = 0 | 1 | 2 | 3 | 4; // 0 closed, 1-3 questions, 4 sent to Instagram
type Answers = { a1: number; a2: number; name: string };

const fromUrl = (): Step => {
  const v = new URLSearchParams(location.search).get(PARAM);
  return v === "instagram" ? 4 : v === "1" || v === "2" || v === "3" ? (Number(v) as Step) : 0;
};
const urlFor = (s: Step) => {
  const u = new URL(location.href);
  if (s) u.searchParams.set(PARAM, s === 4 ? "instagram" : String(s));
  else u.searchParams.delete(PARAM);
  return u.pathname + u.search + u.hash;
};
// a step can only be shown once the answers before it exist (a reload or a shared link may skip them)
const allowed = (s: Step, a: Answers): Step => (s >= 2 && a.a1 < 0 ? 1 : s >= 3 && a.a2 < 0 ? 2 : s);
// how many history entries the form added (kept in history.state, so back/forward stay in sync)
const depth = (): number => history.state?.qf ?? 0;

/**
 * Contact questionnaire. Any wa.me link on the page (without data-direct) opens it instead of WhatsApp:
 * three questions build a ready message, sent on WhatsApp or copied for an Instagram DM.
 * Without JS the links still open WhatsApp with the default message.
 */
export function Talk({ t }: { t: Dict["talk"] }) {
  const [step, setStep] = useState<Step>(0);
  const [ans, setAns] = useState<Answers>({ a1: -1, a2: -1, name: "" });
  const ansRef = useRef(ans);
  const trigger = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false); // true only in the browser, for the portal

  const save = (a: Answers) => {
    ansRef.current = a;
    setAns(a);
    try {
      sessionStorage.setItem(SAVE, JSON.stringify(a));
    } catch {}
  };

  // URL -> state: first load (a shared ?etapa= link) and the browser's back/forward buttons
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SAVE);
      if (saved) ansRef.current = JSON.parse(saved);
    } catch {}
    setAns(ansRef.current);
    const sync = () => {
      const s = allowed(fromUrl(), ansRef.current);
      if (s && s !== fromUrl()) history.replaceState(history.state, "", urlFor(s));
      setStep(s);
    };
    sync();
    window.addEventListener("popstate", sync);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href^="https://wa.me/"]');
      if (!a || a.hasAttribute("data-direct") || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      trigger.current = a;
      track("form_start", { form_id: FORM, form_location: a.closest("section, footer")?.className.split(" ")[0] || "page" });
      history.pushState({ ...history.state, qf: 1 }, "", urlFor(1));
      setStep(1);
    };
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // every step is a virtual page for analytics
  useEffect(() => {
    if (!step) return;
    track("page_view", { page_location: location.href, page_title: `${t.title} · ${step === 4 ? "Instagram" : step}`, virtual_page: true });
    track("form_step", { form_id: FORM, step_number: step });
  }, [step, t.title]);

  const go = (s: Step) => {
    history.pushState({ ...history.state, qf: depth() + 1 }, "", urlFor(s));
    setStep(s);
  };

  const close = useCallback(() => {
    const d = depth();
    if (d > 0) history.go(-d); // back to the page as it was before the form; popstate then closes it
    else {
      history.replaceState(history.state, "", urlFor(0));
      setStep(0);
    }
    trigger.current?.focus();
  }, []);

  const back = () => {
    if (depth() > 1) return history.back();
    history.replaceState(history.state, "", urlFor((step - 1) as Step));
    setStep((step - 1) as Step);
  };

  const send = (to: "whatsapp" | "instagram") => {
    const msg = t.msg.replace("{name}", ans.name.trim()).replace("{q1}", t.o1[ans.a1].msg).replace("{q2}", t.o2[ans.a2].msg);
    track("generate_lead", {
      form_id: FORM,
      method: to,
      service: SERVICES[ans.a1],
      timeline: TIMELINES[ans.a2],
      event_id: eventId(),
      ...attribution(),
    });
    if (to === "instagram") {
      navigator.clipboard?.writeText(msg).catch(() => {});
      window.open(INSTAGRAM_DM, "_blank", "noopener");
      go(4);
    } else {
      window.open(wa(msg), "_blank", "noopener");
      close();
    }
  };

  return (
    mounted &&
    createPortal(
      <AnimatePresence>
        {step > 0 && (
          <Modal
            t={t}
            step={step}
            ans={ans}
            onClose={close}
            onBack={back}
            pick1={(i) => (save({ ...ans, a1: i }), track("form_step_answer", { form_id: FORM, step_number: 1, service: SERVICES[i] }), go(2))}
            pick2={(i) => (save({ ...ans, a2: i }), track("form_step_answer", { form_id: FORM, step_number: 2, timeline: TIMELINES[i] }), go(3))}
            setName={(name) => save({ ...ans, name })}
            send={send}
          />
        )}
      </AnimatePresence>,
      document.body,
    )
  );
}

const noop = () => () => {};

type ModalProps = {
  t: Dict["talk"];
  step: Step;
  ans: Answers;
  onClose: () => void;
  onBack: () => void;
  pick1: (i: number) => void;
  pick2: (i: number) => void;
  setName: (n: string) => void;
  send: (to: "whatsapp" | "instagram") => void;
};

function Modal({ t, step, ans, onClose, onBack, pick1, pick2, setName, send }: ModalProps) {
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

  const options = (list: { label: string }[], pick: (i: number) => void, chosen: number) => (
    <div className="qf-opts">
      {list.map((o, i) => (
        <button key={o.label} type="button" className={`qf-opt${chosen === i ? " on" : ""}`} autoFocus={i === 0} onClick={() => pick(i)}>
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <motion.div
      ref={box}
      className="sp"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qf-q"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sp-top">
        <p className="sp-name serif">{t.title}</p>
        <button ref={closeBtn} className="sp-close" onClick={onClose} aria-label={t.close}>×</button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="qf"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -16, transition: { duration: 0.2 } }}
          transition={{ duration: 0.6, ease: EXPO }}
        >
          {step < 4 && (
            <>
              <div className="qf-bar" aria-hidden="true">
                {[1, 2, 3].map((n) => <i key={n} className={n <= step ? "on" : undefined} />)}
              </div>
              <div className="hkick"><p className="mono">{t.step.replace("{n}", String(step))}</p><i aria-hidden="true" /></div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 id="qf-q" className="qf-q serif">{t.q1}</h2>
              {options(t.o1, pick1, ans.a1)}
            </>
          )}
          {step === 2 && (
            <>
              <h2 id="qf-q" className="qf-q serif">{t.q2}</h2>
              {options(t.o2, pick2, ans.a2)}
            </>
          )}
          {step === 3 && (
            <form
              className="qf-form"
              onSubmit={(e) => {
                e.preventDefault();
                send(((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "ig" ? "instagram" : "whatsapp");
              }}
            >
              <label id="qf-q" htmlFor="qf-name" className="qf-q serif">{t.q3}</label>
              <input
                id="qf-name"
                className="qf-in"
                value={ans.name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.name}
                autoComplete="given-name"
                maxLength={60}
                required
                autoFocus
              />
              <p className="qf-note">{t.send}</p>
              <div className="qf-send">
                <button className="btn hbtn-p" value="wa"><Icon name="whatsapp" size={20} />{t.wa}</button>
                <button className="btn hbtn-o hbtn-lg" value="ig">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  {t.ig}
                </button>
              </div>
              <p className="qf-note">{t.igNote}</p>
            </form>
          )}
          {step === 4 && (
            <>
              <h2 id="qf-q" className="qf-q serif" role="status">{t.copied}</h2>
              <div className="qf-send">
                <button type="button" className="btn hbtn-p" autoFocus onClick={onClose}>{t.close}</button>
              </div>
            </>
          )}
          {(step === 2 || step === 3) && (
            <button type="button" className="qf-back" onClick={onBack}>{t.back}</button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
