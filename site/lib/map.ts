import DottedMap from "dotted-map";

// Client countries on the home map, as real coordinates.
// The 21st.dev map draws pins with a plain lat/lng -> 800x400 formula, but its dotted background
// is a Mercator map cropped to 56°S-71°N. pin() snaps each place to the dotted map's own grid and
// converts that spot back into the lat/lng the component's formula expects, so pins sit on the country.
const dotted = new DottedMap({ height: 100, grid: "diagonal" });
function pin(lat: number, lng: number, label?: string) {
  const { x, y } = dotted.getPin({ lat, lng })!; // always inside the map region for these places
  const s = 800 / dotted.image.width; // background is object-cover in a 2:1 box
  const X = x * s;
  const Y = y * s + (400 - dotted.image.height * s) / 2;
  return { lat: 90 - (Y * 180) / 400, lng: (X * 360) / 800 - 180, label };
}

// Labels come from the dictionary; positions are fixed.
export function mapDots(n: { brazil: string; paraguay: string; usa: string; mexico: string; spain: string; portugal: string }) {
  const BR = pin(-15.79, -47.88); // Brasília
  return [
    { start: { ...BR, label: n.brazil }, end: pin(-25.26, -57.58, n.paraguay) }, // Asunción
    { start: BR, end: pin(39.0, -98.0, n.usa) }, // centre of the USA
    { start: BR, end: pin(19.43, -99.13, n.mexico) }, // Mexico City
    { start: BR, end: pin(40.42, -3.7, n.spain) }, // Madrid
    { start: BR, end: pin(38.72, -9.14, n.portugal) }, // Lisbon
  ];
}
