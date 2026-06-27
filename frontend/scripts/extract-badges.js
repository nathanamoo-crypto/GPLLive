/**
 * extract-badges.js
 * -----------------
 * ONE-TIME SCRIPT: Writes base64-encoded PNG badge images to
 *   frontend/assets/badges/<club-id>.png
 *
 * Usage:
 *   node scripts/extract-badges.js
 *
 * === TODO / PLACEHOLDER ===
 * Replace the VALUES below with actual base64 PNG strings for each club.
 * You can generate base64 from a PNG file with:
 *   node -e "console.log(fs.readFileSync('path/to/badge.png').toString('base64'))"
 *
 * The script will skip any entry whose value is still the placeholder "TODO".
 * Delete or replace the TODO entries once you have real artwork.
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 🔽 PASTE YOUR BASE64 PNG STRINGS BELOW
// Each key is the filename slug (matches logos.ts).
// ─────────────────────────────────────────────
const BADGE_DATA = {
  'asante_kotoko': 'TODO',
  'hearts_of_oak': 'TODO',
  'medeama_sc': 'TODO',
  'dreams_fc': 'TODO',
  'bibiani_gold_stars': 'TODO',
  'berekum_chelsea': 'TODO',
  'mighty_jets': 'TODO',
  'legon_cities': 'TODO',
  'king_faisal': 'TODO',
  'karela_united': 'TODO',
  'ashanti_gold': 'TODO',
  'aduana_stars': 'TODO',
  'real_tamale_united': 'TODO',
  'great_olympics': 'TODO',
  'accra_lions': 'TODO',
  'king_solomon': 'TODO',
  'elmina_sharks': 'TODO',
  'great_mariners': 'TODO',
};

const OUT_DIR = path.resolve(__dirname, '..', 'assets', 'badges');

// ─────────────────────────────────────────────
// DO NOT EDIT BELOW THIS LINE
// ─────────────────────────────────────────────

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let written = 0;
  let skipped = 0;

  for (const [slug, base64] of Object.entries(BADGE_DATA)) {
    if (!base64 || base64 === 'TODO') {
      console.warn(`  ⏭  ${slug}.png — skipped (TODO)`);
      skipped++;
      continue;
    }

    const filePath = path.join(OUT_DIR, `${slug}.png`);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    written++;
  }

  console.log(`\nDone. ${written} file(s) written, ${skipped} skipped.`);
  console.log(`Output directory: ${OUT_DIR}\n`);
}

main();
