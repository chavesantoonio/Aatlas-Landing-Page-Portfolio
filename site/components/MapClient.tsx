"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

// The 21st.dev map reads the theme from next-themes, which is unknown on the server;
// rendering it client-only keeps the dark map from hydrating with the light SVG.
const Map = dynamic(() => import("./ui/map").then((m) => m.WorldMap), { ssr: false, loading: () => <Box /> });

const Box = () => <div style={{ width: "100%", aspectRatio: "2 / 1", background: "#000" }} />;

/** Mounts the map (and its heavy world-grid build) only when it nears the viewport, keeping it off the hero's load path. */
export function WorldMap(props: ComponentProps<typeof Map>) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return near ? <Map {...props} /> : <div ref={ref}><Box /></div>;
}
