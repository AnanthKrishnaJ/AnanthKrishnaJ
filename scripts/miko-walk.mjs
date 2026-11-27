// Contribution "snake", Miko edition: pixel Miko walks along the
// contribution graph row by row (zig-zag) and eats every day that has
// contributions, then celebrates and the graph refills.
//
// generate.mjs calls renderWalk() with real calendar data every day.
// Run directly (node scripts/miko-walk.mjs) to draw it from sample data.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, sprite, walker, walkCss, MIKO_WALK, MIKO_PAL } from "./pixel.mjs";

export const WALK_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel", "miko-walk.svg");

const LV = ["#1c1c1c", "#4a2a3a", "#7f3f5f", "#c0628a", "#f7a8c6"];
const n2 = (v) => Math.round(v * 1000) / 1000;

/** weeks: [{contributionDays:[{date, contributionCount}]}] (GitHub calendar) */
export function renderWalk(weeks, total) {
  const W = 850, C = 12, G = 2, P = C + G;
  const cols = weeks.length;
  const gx = Math.round((W - (cols * P - G)) / 2), gy = 100;
  const H = gy + 7 * P + 58;
  const counts = weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] || 1;
  const cut = [q(0.25), q(0.5), q(0.75)];
  const level = (c) => (c <= 0 ? 0 : c <= cut[0] ? 1 : c <= cut[1] ? 2 : c <= cut[2] ? 3 : 4);
  total ??= counts.reduce((a, b) => a + b, 0);

  // timeline (seconds)
  const dt = 0.07, turn = 0.35, party = 2.6;
  const rowT = (cols - 1) * dt;
  const T = 7 * rowT + 6 * turn + party;
  const pct = (t) => n2((t / T) * 100);
  const cellX = (c) => gx + c * P + C / 2;
  const rowY = (r) => gy + r * P + C; // feet line

  // Miko path: row r goes left->right if even, right->left if odd
  let path = "", face = "";
  for (let r = 0; r < 7; r++) {
    const t0 = r * (rowT + turn);
    const ltr = r % 2 === 0;
    const xs = ltr ? cellX(0) : cellX(cols - 1), xe = ltr ? cellX(cols - 1) : cellX(0);
    path += `${pct(t0)}%{transform:translate(${xs}px,${rowY(r)}px);animation-timing-function:steps(${cols - 1},end)}`;
    path += `${pct(t0 + rowT)}%{transform:translate(${xe}px,${rowY(r)}px);animation-timing-function:steps(1,end)}`;
    face += `${pct(t0)}%{transform:scaleX(${ltr ? 1 : -1})}`;
  }
  const tEnd = 7 * rowT + 6 * turn;
  path += `100%{transform:translate(${cellX(0)}px,${rowY(6)}px)}`;

  // cells: base (empty) + colored overlay eaten at the right moment
  let cells = "", css = "", k = 0;
  weeks.forEach((w, c) => {
    w.contributionDays.forEach((d) => {
      const r = new Date(d.date + "T00:00:00Z").getUTCDay();
      const x = gx + c * P, y = gy + r * P;
      cells += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${LV[0]}"/>`;
      const lv = level(d.contributionCount);
      if (!lv) return;
      const ltr = r % 2 === 0;
      const step = ltr ? c : cols - 1 - c;
      const te = r * (rowT + turn) + step * dt + dt * 0.5;
      css += `.e${k}{animation-name:e${k}}@keyframes e${k}{0%{opacity:1}${pct(te)}%{opacity:0}${pct(tEnd + 0.9)}%{opacity:1}}`;
      cells += `<rect class="e e${k}" x="${x}" y="${y}" width="${C}" height="${C}" fill="${LV[lv]}"/>`;
      k++;
    });
  });

  const heart = (x, y, c) => `<path fill="${c}" d="M${x + 2} ${y}h4v2h2v-2h4v2h2v4h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2h-2v-4h2z"/>`;
  const legend = LV.map((c, i) => `<rect x="${W - 150 + i * 16}" y="${H - 34}" width="12" height="12" fill="${c}"/>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .e{animation-duration:${n2(T)}s;animation-iteration-count:infinite;animation-timing-function:steps(1,end)}
    ${css}
    .mv{animation:mv ${n2(T)}s infinite}@keyframes mv{${path}}
    .fc{animation:fc ${n2(T)}s infinite;animation-timing-function:steps(1,end)}@keyframes fc{${face}${pct(tEnd)}%{transform:scaleX(-1)}}
    ${walkCss(0.36)}
    .walkset{animation:walkset ${n2(T)}s infinite;animation-timing-function:steps(1,end)}@keyframes walkset{0%{opacity:1}${pct(tEnd)}%{opacity:0}100%{opacity:0}}
    .yay{opacity:0;animation:yay ${n2(T)}s infinite;animation-timing-function:steps(1,end)}@keyframes yay{0%{opacity:0}${pct(tEnd)}%{opacity:1}${pct(T - 0.05)}%{opacity:0}}
    .hop{animation:hop .5s infinite;animation-timing-function:steps(1,end)}@keyframes hop{0%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .hr{animation:hr 1s steps(5,end) infinite}@keyframes hr{from{transform:translateY(0)}to{transform:translateY(-26px)}}
  </style>
  <rect width="${W}" height="${H}" fill="#0b0b0b"/>
  <path fill="#3a3a3a" d="M4 0h${W - 8}v4h-${W - 8}zM4 ${H - 4}h${W - 8}v4h-${W - 8}zM0 4h4v${H - 8}h-4zM${W - 4} 4h4v${H - 8}h-4z"/>
  ${pxText("NOM NOM: MIKO IS EATING MY COMMITS", gx, 22, 2, "#f5f5f5")}
  ${pxText(`${total} CONTRIBUTIONS IN THE LAST YEAR`, gx, H - 32, 2, "#8a8a8a")}
  ${pxText("LESS", W - 158, H - 32, 2, "#8a8a8a", { anchor: "end" })}${legend}${pxText("MORE", W - 66, H - 32, 2, "#8a8a8a")}
  ${cells}
  <g class="mv">
    <g class="fc">
      <g class="walkset">${walker(-20, -54, 2)}</g>
      <g class="yay"><g class="hop">${sprite(MIKO_WALK[1], MIKO_PAL, -20, -54, 2)}</g></g>
    </g>
    <g class="yay">
      <g class="hr">${heart(-36, -60, "#f7a8c6")}</g><g class="hr" style="animation-delay:-.5s">${heart(22, -70, "#ffffff")}</g>
      ${pxText("NOM!", -76, -40, 2, "#f7a8c6")}
    </g>
  </g>
</svg>`;
}

// sample data for local previews (the daily Action redraws with real data)
export function sampleWeeks() {
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const weeks = [];
  const start = Date.UTC(2025, 10, 30); // a Sunday
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start + (w * 7 + d) * 864e5).toISOString().slice(0, 10);
      const active = w > 30 ? rnd() > 0.45 : rnd() > 0.85;
      days.push({ date, contributionCount: active ? 1 + Math.floor(rnd() * 8) : 0 });
    }
    weeks.push({ contributionDays: days });
  }
  return weeks;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(dirname(WALK_FILE), { recursive: true });
  if (existsSync(WALK_FILE) && !process.argv.includes("--force")) console.log("kept existing miko-walk.svg (use --force to redraw from sample data)");
  else { writeFileSync(WALK_FILE, renderWalk(sampleWeeks()).trim() + "\n"); console.log("wrote miko-walk.svg (sample data)"); }
}
