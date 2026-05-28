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

const CREAM = "#FDFBF7";
const GOLD = "#F59E0B";
const SUN = "#FDE047";
const OCEAN = "#0EA5E9";

function svg(size) {
  const c = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${CREAM}"/>
  <circle cx="${c}" cy="${size * 0.42}" r="${size * 0.18}" fill="${SUN}" stroke="${GOLD}" stroke-width="${size * 0.02}"/>
  <path d="M ${size * 0.12} ${size * 0.72} Q ${c} ${size * 0.6} ${size * 0.88} ${size * 0.72}" fill="none" stroke="${OCEAN}" stroke-width="${size * 0.035}" stroke-linecap="round"/>
  <path d="M ${size * 0.12} ${size * 0.82} Q ${c} ${size * 0.7} ${size * 0.88} ${size * 0.82}" fill="none" stroke="${OCEAN}" stroke-width="${size * 0.03}" stroke-linecap="round" opacity="0.6"/>
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
