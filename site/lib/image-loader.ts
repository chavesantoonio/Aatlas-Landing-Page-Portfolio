// Static build only (no image server): the hero uses WebP sizes made ahead of time in public/assets.
const HERO = [640, 750, 960, 1138];

export default function loader({ src, width }: { src: string; width: number }) {
  if (src !== "/assets/hero.jpg") return src;
  return `/assets/hero-${HERO.find((w) => w >= width) ?? HERO[HERO.length - 1]}.webp`;
}
