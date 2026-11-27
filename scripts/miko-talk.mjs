// Reaction strips for the "Talk to Miko" section of the README. The README
// wraps them in <details> toggles, so tapping "Pat her head" etc. reveals
// her reaction right on the profile (no JS needed). Chains escalate:
// pat -> pat again -> one more...
//   node scripts/miko-talk.mjs   -> assets/pixel/talk/*.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, sprite, pxBox, MIKO, MIKO_PAL, MIKO_FX, FX_PAL } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel", "talk");
mkdirSync(OUT, { recursive: true });

const W = 850, H = 200, S = 6;
const WHITE = "#f5f5f5", GREY = "#8a8a8a", PINK = "#f7a8c6", BG = "#0b0b0b", RED = "#ff6b7a", GOLD = "#e0c060";
const STEP = "animation-timing-function:steps(1,end)";
const MX = 40, MY = 26; // Miko bust position
const BX = 230, BY = 34, BW = 590, BH = 120; // speech bubble

const heart = (x, y, c = PINK, s = 2) => `<path fill="${c}" transform="translate(${x} ${y}) scale(${s})" d="M1 0h2v1h1v-1h2v1h1v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-2h1z"/>`;
const anger = (x, y) => `<path fill="${RED}" d="M${x} ${y}h6v6h-6zM${x + 12} ${y}h6v6h-6zM${x + 6} ${y + 6}h6v6h-6zM${x} ${y + 12}h6v6h-6zM${x + 12} ${y + 12}h6v6h-6z"/>`;
const sweat = (x, y) => `<path fill="#7ac8ff" d="M${x + 4} ${y}h4v4h4v12h-4v4h-4v-4h-4v-12h4z"/>`;

function wrap(text, max) {
  const out = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** typewriter text: each line revealed by a clip rect stepping across it */
function typed(text, x, y, s, color, T) {
  const lines = wrap(text, Math.floor((BW - 40) / (6 * s)));
  const total = lines.reduce((a, l) => a + l.length, 0);
  let done = 0, out = "", css = "";
  const typeEnd = 0.2; // fraction of the loop spent typing
  lines.forEach((l, i) => {
    const a = (done / total) * typeEnd * 100, b = ((done + l.length) / total) * typeEnd * 100;
    done += l.length;
    const w = l.length * 6 * s;
    css += `.ty${i}{animation:ty${i} ${T}s infinite;animation-timing-function:steps(${l.length},end)}
      @keyframes ty${i}{0%,${a.toFixed(2)}%{transform:scaleX(0)}${b.toFixed(2)}%,100%{transform:scaleX(1)}}`;
    out += `<clipPath id="tc${i}"><rect class="ty${i}" style="transform-box:fill-box;transform-origin:left" x="${x}" y="${y + i * (8 * s + 6)}" width="${w}" height="${8 * s}"/></clipPath>
      <g clip-path="url(#tc${i})">${pxText(l, x, y + i * (8 * s + 6), s, color)}</g>`;
  });
  return { out, css };
}

function strip({ fx, line, extra = "", css = "", mood = "", step }) {
  const T = 12;
  const t = typed(line, BX + 22, BY + 20, 3, BG, T);
  const body = sprite(MIKO, MIKO_PAL, MX, MY, S) + (fx ? sprite(MIKO_FX[fx], FX_PAL, MX, MY, S) : "");
  const moodCls = { shake: "shk", squish: "sq", glitch: "gl", bob: "bob" }[mood] || "bob";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .bob{animation:bob .8s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .sq{animation:sq .5s infinite;${STEP}}@keyframes sq{0%{transform:translateY(6px)}50%{transform:translateY(10px)}}
    .shk{animation:shk .16s infinite;${STEP}}@keyframes shk{0%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
    .gl{animation:gl 1.2s infinite;${STEP}}@keyframes gl{0%{transform:translateX(0)}8%{transform:translateX(10px)}12%{transform:translateX(-6px)}16%,100%{transform:translateX(0)}}
    .rise{animation:rise 1.6s steps(8,end) infinite}@keyframes rise{from{transform:translateY(20px);opacity:1}to{transform:translateY(-40px);opacity:0}}
    .blk{animation:blk .8s infinite;${STEP}}@keyframes blk{0%{opacity:1}50%{opacity:0}}
    .pop{animation:pop ${T}s infinite;${STEP}}@keyframes pop{0%,18%{opacity:0}20%,100%{opacity:1}}
    ${t.css}${css}
  </style>
  <defs><clipPath id="cl"><rect x="4" y="4" width="${W - 8}" height="${H - 8}"/></clipPath></defs>
  ${pxBox(0, 0, W, H, 4, BG, "#3a3a3a")}
  <g clip-path="url(#cl)">
    <rect x="4" y="${H - 30}" width="${W - 8}" height="26" fill="#1a1418"/>
    <g class="${moodCls}">${body}${extra}</g>
  </g>
  ${pxBox(BX, BY, BW, BH, 4, WHITE, WHITE)}
  <path fill="${WHITE}" d="M${BX - 16} ${BY + 50}h16v16h-6v-6h-4v-4h-6z"/>
  ${t.out}
  <g class="blk">${pxText(">", BX + BW - 30, BY + BH - 28, 2, PINK)}</g>
  ${step ? pxText(step, W - 24, H - 22, 2, GREY, { anchor: "end" }) : ""}
</svg>`;
}

// effects positioned relative to the bust (sprite grid * 6)
const g = (cx, cy) => [MX + cx * S, MY + cy * S];
const hearts = () => {
  const [x1, y1] = g(1, 2), [x2, y2] = g(20, 0), [x3, y3] = g(10, -2);
  return `<g class="rise">${heart(x1, y1)}</g><g class="rise" style="animation-delay:-.5s">${heart(x2, y2, WHITE)}</g><g class="rise" style="animation-delay:-1.1s">${heart(x3, y3)}</g>`;
};
const steam = () => [0, 1, 2].map((i) => `<g class="rise" style="animation-delay:${-i * 0.5}s"><rect x="${MX + 40 + i * 30}" y="${MY - 4}" width="6" height="12" fill="#cfcfcf"/></g>`).join("");
const crash = (title = "MIKO.EXE", l1 = "NOT RESPONDING", l2 = "HEART RATE: 404") => `<g class="pop">
  <rect x="${MX + 14}" y="${MY + 104}" width="200" height="56" fill="#000"/>
  ${pxBox(MX + 8, MY + 98, 200, 56, 3, WHITE, WHITE)}<rect x="${MX + 11}" y="${MY + 101}" width="194" height="14" fill="${RED}"/>
  ${pxText(title, MX + 16, MY + 104, 1, BG)}${pxText(l1, MX + 16, MY + 122, 2, BG)}${pxText(l2, MX + 16, MY + 140, 1, "#555")}</g>`;

const TALK = {
  hello: { fx: null, line: "...WHAT? PICK SOMETHING BELOW. N-NOT THAT I CARE WHAT YOU DO.", extra: `<g class="blk" style="animation-duration:3.2s">${sprite(MIKO_FX.blink, FX_PAL, MX, MY, S)}</g>` },
  pat1: { fx: "smug", mood: "squish", line: "H-HEY! WHO SAID YOU COULD PAT ME?!", extra: hearts(), step: "PAT 1/3" },
  pat2: { fx: "fluster", mood: "squish", line: "...FINE. ONE MORE. IT'S NOT LIKE I LIKE IT OR ANYTHING!", extra: hearts() + sweat(...g(20, 6)), step: "PAT 2/3" },
  pat3: { fx: "fluster", mood: "shake", line: "E-ERROR... HEART OVERFLOW... B-BAKA!!", extra: steam() + crash(), step: "PAT 3/3" },
  poke1: { fx: "pout", mood: "shake", line: "HEY! STOP POKING ME. I'M NOT A BUTTON!", extra: anger(...g(19, 3)), step: "POKE 1/3" },
  poke2: { fx: "pout", mood: "shake", line: "POKE ME AGAIN AND I'LL DELETE ALL YOUR COMMITS.", extra: anger(...g(19, 3)) + anger(...g(2, 6)), step: "POKE 2/3" },
  poke3: {
    fx: "pout", mood: "glitch", line: "SEGFAULT (CORE DUMPED). ARE YOU HAPPY NOW?!", step: "POKE 3/3",
    extra: `<g opacity=".5" transform="translate(8 0)" style="mix-blend-mode:screen"><rect x="${MX}" y="${MY}" width="144" height="180" fill="${RED}" opacity=".25"/></g>
      ${[30, 70, 110].map((y, i) => `<rect class="blk" style="animation-duration:${0.3 + i * 0.1}s" x="${MX - 10}" y="${MY + y}" width="164" height="6" fill="${i % 2 ? "#7ac8ff" : RED}" opacity=".7"/>`).join("")}`,
  },
  ribbon: {
    fx: "fluster", mood: "bob", line: "DON'T TOUCH THE RIBBONS! THEY'RE NOT ANTENNAS!", step: "RIBBONS",
    css: `.rb{animation:rb .3s infinite;${STEP}}@keyframes rb{0%{transform:translateY(-6px)}50%{transform:translateY(0)}}`,
    extra: `<g class="rb">${sprite(MIKO.slice(0, 4), MIKO_PAL, MX, MY, S)}</g>` + anger(...g(21, 6)),
  },
  coffee: {
    fx: "smug", mood: "bob", line: "C-COFFEE? FOR ME? ...THANKS. I GUESS. IT'S TOO SWEET. I'LL DRINK IT ANYWAY.", step: "COFFEE",
    extra: `${pxBox(MX + 100, MY + 120, 36, 40, 3, WHITE, WHITE)}${heart(MX + 108, MY + 132, PINK, 3)}<rect x="${MX + 136}" y="${MY + 128}" width="8" height="20" fill="${WHITE}"/>
      ${[0, 1].map((i) => `<g class="rise" style="animation-delay:${-i * 0.8}s"><rect x="${MX + 110 + i * 12}" y="${MY + 104}" width="4" height="10" fill="#cfcfcf"/></g>`).join("")}`,
  },
  praise1: { fx: "fluster", mood: "shake", line: "Y-YOU CAN'T JUST SAY THAT TO SOMEONE!", extra: sweat(...g(20, 6)) + hearts(), step: "PRAISE 1/2" },
  praise2: { fx: "fluster", mood: "bob", line: "...I'M SAVING THAT IN MY LOGS. F-FOR DEBUGGING. NO OTHER REASON.", extra: crash("MIKO.EXE", "SAVING...", "LOG: COMPLIMENT.TXT"), step: "PRAISE 2/2" },
};

for (const [id, t] of Object.entries(TALK)) writeFileSync(join(OUT, `${id}.svg`), strip(t).trim() + "\n");
console.log("wrote", Object.keys(TALK).length, "talk strips");
