/**
 * PWA icon generator for SunnySide (Luxury Summer Resort theme).
 *
 * Renders a sun-gold disc over a sandy-cream field with an ocean-blue arc,
 * then rasterizes to /public/icon-192x192.png and /public/icon-512x512.png.
 *
 * Requires the optional `sharp` dependency:
 *   npm i -D sharp && node scripts/generate-icons.mjs
 *
 * If `sharp` is unavailable, the committed PNG assets are used as-is.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const GOLD_FROM = "#FBBF24"; // amber-400
const GOLD_TO = "#F59E0B"; // amber-500
const WHITE = "#FFFFFF";

/** White sun (disc + 8 rays) on a gold gradient — matches the in-app logo. */
function svg(size) {
  const c = size / 2;
  const disc = size * 0.17;
  const r1 = size * 0.28;
  const r2 = size * 0.38;
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    const x1 = (c + Math.cos(a) * r1).toFixed(2);
    const y1 = (c + Math.sin(a) * r1).toFixed(2);
    const x2 = (c + Math.cos(a) * r2).toFixed(2);
    const y2 = (c + Math.sin(a) * r2).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WHITE}" stroke-width="${size * 0.055}" stroke-linecap="round"/>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD_FROM}"/>
      <stop offset="1" stop-color="${GOLD_TO}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <circle cx="${c}" cy="${c}" r="${disc}" fill="${WHITE}"/>
  ${rays}
</svg>`;
}

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[generate-icons] `sharp` not installed; keeping existing PNGs.");
    await writeFile(join(publicDir, "icon.svg"), svg(512), "utf8");
    return;
  }

  for (const size of [192, 512]) {
    const buffer = Buffer.from(svg(size));
    await sharp(buffer).png().toFile(join(publicDir, `icon-${size}x${size}.png`));
    console.log(`[generate-icons] wrote icon-${size}x${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
