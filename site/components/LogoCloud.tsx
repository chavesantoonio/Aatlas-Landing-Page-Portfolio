"use client";

/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "motion/react";
import type { Client } from "@/lib/data";

const EXPO = [0.16, 1, 0.3, 1] as const;

function Logo({ c }: { c: Client }) {
  return c.logo ? (
    <img className="lc-img" src={c.logo} alt={c.name} decoding="async" style={c.h ? { height: c.h } : undefined} />
  ) : (
    <span className="lc-word serif">{c.name}</span>
  );
}

/**
 * Cinematic logo cloud. `marquee`: the strip sweeps in fast from the right, then keeps drifting in a loop
 * (pauses on hover). `grid`: logos reveal with a staggered blur-fade and stay still.
 */
export function LogoCloud({ clients, variant = "marquee" }: { clients: Client[]; variant?: "grid" | "marquee" }) {
  const reduce = useReducedMotion();
  const item = (c: Client, i: number, hidden = false) => (
    <motion.li
      key={`${c.name}-${i}`}
      className="lc-item"
      aria-hidden={hidden || undefined}
      initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: 16 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.9, ease: EXPO, delay: 0.5 + (i % clients.length) * 0.08 }}
    >
      <Logo c={c} />
    </motion.li>
  );

  if (variant === "grid") return <ul className="lc-grid">{clients.map((c, i) => item(c, i))}</ul>;

  // the list is rendered twice so the -50% loop is seamless; the copy is hidden from screen readers
  const li = (c: Client, i: number, hidden = false) => (
    <li key={`${c.name}-${i}`} className="lc-item" aria-hidden={hidden || undefined}>
      <Logo c={c} />
    </li>
  );
  return (
    <div className="lc-marquee">
      <motion.div
        initial={reduce ? false : { x: "70vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ x: { duration: 1.1, ease: EXPO, delay: 0.15 }, opacity: { duration: 0.4, delay: 0.15 } }}
      >
        <ul className="lc-track">
          {clients.map((c, i) => li(c, i))}
          {clients.map((c, i) => li(c, i + clients.length, true))}
        </ul>
      </motion.div>
    </div>
  );
}
