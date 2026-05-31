import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "icons");
mkdirSync(OUT, { recursive: true });

// Flat, solid brand colour — no gradients.
const BRAND = "#283142";

// Rising bars centered in a `size` canvas, scaled to a content box.
function bars(size, inset) {
  const box = size - inset * 2;
  const unit = box / 30;
  const x = (n) => inset + n * unit;
  const barW = 5 * unit;
  const r = 2.5 * unit;
  // heights (from bottom)
  const defs = [
    { x: 1, h: 11, o: 0.85 },
    { x: 11, h: 18, o: 0.95 },
    { x: 21, h: 26, o: 1 },
  ];
  const bottom = inset + box - 2 * unit;
  return defs
    .map(
      (b) =>
        `<rect x="${x(b.x)}" y="${bottom - b.h * unit}" width="${barW}" height="${
          b.h * unit
        }" rx="${r}" fill="#fff" fill-opacity="${b.o}"/>`,
    )
    .join("");
}

function squircleIcon(size) {
  const radius = size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND}"/>
    ${bars(size, size * 0.26)}
  </svg>`;
}

function maskableIcon(size) {
  // Full-bleed solid, bars within the ~80% safe zone.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${BRAND}"/>
    ${bars(size, size * 0.32)}
  </svg>`;
}

async function render(svg, file, size) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(OUT, file));
  console.log("✓", file);
}

await render(squircleIcon(192), "icon-192.png", 192);
await render(squircleIcon(512), "icon-512.png", 512);
await render(squircleIcon(180), "apple-touch-icon.png", 180);
await render(maskableIcon(512), "maskable-512.png", 512);
console.log("Icons generated in public/icons");
