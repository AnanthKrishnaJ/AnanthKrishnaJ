// "MIKO.EXE" — pixel-art scene of Kiyanagi Miko living inside a retro
// computer, coding at her desk. 12s loop: typing → bug popup (she panics)
// → fixing → BUILD OK (smug).
//   node scripts/miko-desk.mjs   -> assets/pixel/miko-desk.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, sprite, pxBox, MIKO, MIKO_PAL, MIKO_FX, FX_PAL } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel");
mkdirSync(OUT, { recursive: true });

const W = 850, H = 420, T = 12;
const WHITE = "#f5f5f5", GREY = "#8a8a8a", PINK = "#f7a8c6", BG = "#0b0b0b", GREEN = "#7ee08a", RED = "#ff6b7a";
const STEP = "animation-timing-function:steps(1,end)";

let seed = 5;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const LAPTOP = [
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "KLLLLLLLLLLLLLLLLLLLLLLLLLLK",
  "KLLLLLLLLLLLLLLLLLLLLLLLLLLK",
  "KLLLLLLLLLLLHHLHHLLLLLLLLLLK",
  "KLLLLLLLLLLHHHHHHHLLLLLLLLLK",
  "KLLLLLLLLLLLHHHHHLLLLLLLLLLK",
  "KLLLLLLLLLLLLHHHLLLLLLLLLLLK",
  "KLLLLLLLLLLLLLHLLLLLLLLLLLLK",
  "KLLLLLLLLLLLLLLLLLLLLLLLLLLK",
  "KllllllllllllllllllllllllllK",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "KDDDDDDDDDDDDDDDDDDDDDDDDDDK",
];
const LAPTOP_PAL = { K: "#2a2a2a", L: "#d4d4d4", l: "#a8a8a8", H: PINK, D: "#8a8a8a" };
const HAND = ["KKK", "KSSK", "KSSK", ".KK."].map((r) => r.padEnd(4, "."));
const MUG = [
  ".KKKKKK..",
  ".KWWWWKKK",
  ".KWHWWK.K",
  ".KWWWWK.K",
  ".KWWWWKKK",
  ".KWWWWK..",
  "..KKKK...",
];
const PLANT = [
  "....g...G...",
  "...GG..GGg..",
  "..gGGgGGG...",
  ".gGG.GGgGg..",
  "..gG.GG.GG..",
  "....GGgG....",
  ".....GG.....",
  "..KKKKKKKK..",
  "..KPPPPPPK..",
  "...KPPPPK...",
  "...KPPPPK...",
  "....KKKK....",
];
const BOOKS = [
  "KKKKKKKKKKKKKKKKKKKK",
  "KAAAAAAAAAAAAAAAAAAK",
  "KKKKKKKKKKKKKKKKKKKK",
  "..KBBBBBBBBBBBBBBBK.",
  "..KKKKKKKKKKKKKKKKK.",
  ".KCCCCCCCCCCCCCCCCK.",
  ".KKKKKKKKKKKKKKKKKK.",
];
const MISC_PAL = { K: "#2a1a12", W: WHITE, H: PINK, G: "#6fcf7a", g: "#3f9a4c", P: "#c0704a", S: "#ffe4d2",
  A: "#7aa2f7", B: PINK, C: "#e0c060" };

function terminal(x, y, w, h) {
  const N = 20, LH = 12;
  const cols = [PINK, WHITE, GREY, GREEN, "#7aa2f7", "#e0c060"];
  let lines = "";
  const rows = [];
  let indent = 0;
  for (let i = 0; i < N; i++) {
    if (rnd() > 0.7) indent = Math.min(3, indent + 1); else if (rnd() > 0.6) indent = Math.max(0, indent - 1);
    let cx = indent * 14, segs = [];
    const k = 1 + Math.floor(rnd() * 4);
    for (let j = 0; j < k; j++) {
      const sw = 10 + Math.round(rnd() * 8) * 6;
      if (cx + sw > w - 30) break;
      segs.push([cx, sw, cols[Math.floor(rnd() * cols.length)]]);
      cx += sw + 6;
    }
    rows.push(segs);
  }
  for (let rep = 0; rep < 2; rep++)
    rows.forEach((segs, i) => {
      for (const [sx, sw, c] of segs) lines += `<rect x="${sx}" y="${(rep * N + i) * LH}" width="${sw}" height="6" fill="${c}"/>`;
    });
  return `
  ${pxBox(x, y, w, h, 4, BG, WHITE)}
  <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="18" fill="${WHITE}"/>
  ${pxText("TERMINAL", x + 12, y + 7, 2, BG)}
  ${pxText("_ X", x + w - 12, y + 7, 2, BG, { anchor: "end" })}
  <clipPath id="tc"><rect x="${x + 10}" y="${y + 28}" width="${w - 20}" height="${h - 52}"/></clipPath>
  <g clip-path="url(#tc)"><g transform="translate(${x + 14} ${y + 32})"><g class="scroll">${lines}</g></g></g>
  ${pxText("> NPM RUN BUILD", x + 14, y + h - 20, 2, GREEN)}
  <rect class="cur" x="${x + 14 + 16 * 12}" y="${y + h - 20}" width="10" height="14" fill="${GREEN}"/>
  <style>.scroll{animation:scroll 8s steps(${N},end) infinite}@keyframes scroll{from{transform:translateY(0)}to{transform:translateY(-${N * LH}px)}}</style>`;
}

function popup(x, y, w, title, color, line1, line2, cls) {
  return `<g class="${cls}">
    <rect x="${x + 6}" y="${y + 6}" width="${w}" height="64" fill="#000" opacity=".5"/>
    ${pxBox(x, y, w, 64, 4, WHITE, WHITE)}
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="18" fill="${color}"/>
    ${pxText(title, x + 10, y + 7, 2, BG)}
    ${pxText("X", x + w - 10, y + 7, 2, BG, { anchor: "end" })}
    ${pxText(line1, x + 12, y + 30, 2, BG)}
    ${pxText(line2, x + 12, y + 46, 2, "#555")}
  </g>`;
}

function scene() {
  // screen area
  const sx = 48, sy = 34, sw = 754, sh = 284;
  let stars = "";
  for (let i = 0; i < 10; i++) {
    const x = 652 + Math.round(rnd() * 100), y = 62 + Math.round(rnd() * 64);
    stars += `<rect class="tw" style="animation-delay:${(-rnd() * 2).toFixed(1)}s" x="${x}" y="${y}" width="3" height="3" fill="${WHITE}"/>`;
  }
  const mx = 470, my = 98, S = 5; // Miko
  return `
  <!-- monitor bezel -->
  ${pxBox(20, 8, 810, 362, 6, "#cfcfcf", WHITE)}
  <rect x="26" y="360" width="798" height="4" fill="#b4b4b4"/>
  <path fill="#e9e9e9" d="M26 14h798v6h-798z"/>
  ${pxBox(sx - 8, sy - 8, sw + 16, sh + 16, 4, "#2a2a2a", "#9a9a9a")}
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="#17121c"/>

  <g clip-path="url(#scr)">
    <!-- wall details -->
    <rect x="${sx}" y="${sy + 200}" width="${sw}" height="4" fill="#211a27"/>
    <!-- night window -->
    ${pxBox(640, 54, 128, 90, 4, "#0e1830", "#4a4a5a")}
    ${stars}
    <path fill="#fff6c8" d="M736 66h14v4h4v14h-4v4h-14v-4h-4v-14h4z"/><path fill="#0e1830" d="M730 66h12v4h4v10h-4v4h-12z"/>
    <rect x="702" y="58" width="4" height="82" fill="#4a4a5a"/><rect x="644" y="97" width="120" height="4" fill="#4a4a5a"/>
    <!-- clock -->
    ${pxBox(574, 58, 44, 44, 4, WHITE, "#4a4a5a")}
    <rect x="594" y="64" width="4" height="4" fill="#bbb"/><rect x="594" y="92" width="4" height="4" fill="#bbb"/>
    <rect x="580" y="78" width="4" height="4" fill="#bbb"/><rect x="608" y="78" width="4" height="4" fill="#bbb"/>
    <g transform="translate(596 80)"><rect class="hand" x="-2" y="-14" width="4" height="16" fill="${BG}"/><rect x="-2" y="-2" width="10" height="4" fill="${PINK}"/></g>
    ${terminal(64, 50, 270, 226)}

    <!-- Miko -->
    <g class="bob">
      ${sprite(MIKO, MIKO_PAL, mx, my, S)}
      <g class="blink">${sprite(MIKO_FX.blink, FX_PAL, mx, my, S)}</g>
      <g class="bug">${sprite(MIKO_FX.fluster, FX_PAL, mx, my, S)}<path fill="#7ac8ff" d="M${mx + 104} ${my + 34}h5v5h5v10h-5v5h-5v-5h-5v-10h5z"/></g>
      <g class="ok">${sprite(MIKO_FX.smug, FX_PAL, mx, my, S)}</g>
    </g>
    <!-- desk -->
    <rect x="352" y="256" width="460" height="10" fill="#8a6248"/>
    <rect x="352" y="266" width="460" height="40" fill="#5a3e2e"/>
    <rect x="352" y="266" width="460" height="4" fill="#3e2a1f"/>
    ${sprite(LAPTOP, LAPTOP_PAL, 476, 208, 4)}
    <g class="tl">${sprite(HAND, { K: "#2b1a12", S: "#ffe4d2" }, 480, 196, 4)}</g>
    <g class="tr">${sprite(HAND, { K: "#2b1a12", S: "#ffe4d2" }, 570, 196, 4)}</g>
    ${sprite(BOOKS, MISC_PAL, 372, 228, 4)}
    ${sprite(MUG, MISC_PAL, 624, 228, 4)}
    <g class="st1"><rect x="636" y="214" width="4" height="8" fill="#aaa"/></g>
    <g class="st2"><rect x="646" y="206" width="4" height="8" fill="#aaa"/></g>
    ${sprite(PLANT, MISC_PAL, 714, 208, 4)}

    <!-- thought bubble -->
    ${pxBox(360, 150, 100, 30, 3, WHITE, WHITE)}<path fill="${WHITE}" d="M460 160h6v4h6v4h-6v4h-6z"/>
    <g class="t1">${pxText(".", 386, 158, 2, BG)}<g class="d2">${pxText(".", 400, 158, 2, BG)}</g><g class="d3">${pxText(".", 414, 158, 2, BG)}</g></g>
    <g class="t2">${pxText("EH?!", 410, 158, 2, RED, { anchor: "middle" })}</g>
    <g class="t3">${pxText("FIXING", 410, 158, 2, BG, { anchor: "middle" })}</g>
    <g class="t4">${pxText("EASY!", 410, 158, 2, "#2f9a4a", { anchor: "middle" })}</g>

    ${popup(352, 42, 200, "ERROR", RED, "BUG IN LINE 404", "HEART.JS: 404", "bug")}
    ${popup(352, 42, 200, "BUILD", GREEN, "BUILD SUCCESS!", "0 BUGS. EASY.", "ok")}
    <g class="ok">
      <path class="sp" fill="${WHITE}" d="M452 108h4v8h8v4h-8v8h-4v-8h-8v-4h8z"/>
      <path class="sp" style="animation-delay:-.3s" fill="${PINK}" d="M610 120h4v8h8v4h-8v8h-4v-8h-8v-4h8z"/>
    </g>

    <!-- taskbar -->
    <rect x="${sx}" y="${sy + sh - 22}" width="${sw}" height="22" fill="#2a2a2a"/>
    <rect x="${sx}" y="${sy + sh - 22}" width="${sw}" height="2" fill="#4a4a4a"/>
    ${pxBox(sx + 4, sy + sh - 19, 72, 17, 2, "#3a3a3a", "#6a6a6a")}${pxText("START", sx + 12, sy + sh - 15, 2, WHITE)}
    ${pxBox(sx + 82, sy + sh - 19, 110, 17, 2, "#4a4a4a", "#8a8a8a")}${pxText("TERMINAL", sx + 92, sy + sh - 15, 2, WHITE)}
    ${pxBox(sx + 198, sy + sh - 19, 110, 17, 2, "#1f1f1f", "#6a6a6a")}${pxText("MIKO.EXE", sx + 208, sy + sh - 15, 2, PINK)}
    ${pxText("02:47 AM", sx + sw - 10, sy + sh - 15, 2, WHITE, { anchor: "end" })}
  </g>

  <!-- CRT scanlines + flicker -->
  <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="url(#scan)" class="flick"/>

  <!-- chin -->
  ${pxText("MIKO.EXE", 56, 333, 3, "#5a5a5a")}
  ${pxText("ANANTH OS 2.0", 220, 340, 2, "#8a8a8a")}
  <rect x="380" y="330" width="90" height="4" fill="#a8a8a8"/><rect x="380" y="338" width="90" height="4" fill="#a8a8a8"/><rect x="380" y="346" width="90" height="4" fill="#a8a8a8"/>
  <rect x="770" y="332" width="14" height="10" fill="#3a3a3a"/><rect class="led" x="772" y="334" width="10" height="6" fill="${GREEN}"/>
  <!-- stand -->
  <rect x="370" y="370" width="110" height="18" fill="#b4b4b4"/>
  ${pxBox(310, 388, 230, 24, 4, "#cfcfcf", WHITE)}`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .tw{animation:tw 1.6s infinite;${STEP}}@keyframes tw{0%{opacity:1}50%{opacity:.2}}
    .cur{animation:tw .8s infinite;${STEP}}
    .led{animation:led 2.4s infinite;${STEP}}@keyframes led{0%{opacity:1}90%{opacity:.3}}
    .hand{transform-box:view-box;transform-origin:596px 80px;animation:spin 12s steps(12,end) infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .bob{animation:bob .6s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(3px)}}
    .tl{animation:ty .24s infinite;${STEP}}.tr{animation:ty .24s infinite;${STEP};animation-delay:-.12s}
    @keyframes ty{0%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .blink{animation:blink ${T}s infinite;${STEP}}
    @keyframes blink{0%{opacity:0}12%{opacity:1}13.5%{opacity:0}33%{opacity:1}34.5%{opacity:0}74%{opacity:1}75.5%,100%{opacity:0}}
    .bug{animation:bug ${T}s infinite;${STEP}}@keyframes bug{0%{opacity:0}55%{opacity:1}68%,100%{opacity:0}}
    .ok{animation:ok ${T}s infinite;${STEP}}@keyframes ok{0%{opacity:0}85%{opacity:1}100%{opacity:1}}
    .t1{animation:t1 ${T}s infinite;${STEP}}@keyframes t1{0%{opacity:1}55%,100%{opacity:0}}
    .t2{animation:bug ${T}s infinite;${STEP}}
    .t3{animation:t3 ${T}s infinite;${STEP}}@keyframes t3{0%{opacity:0}68%{opacity:1}85%,100%{opacity:0}}
    .t4{animation:ok ${T}s infinite;${STEP}}
    .d2{animation:d2 1.2s infinite;${STEP}}@keyframes d2{0%{opacity:0}33%{opacity:1}}
    .d3{animation:d3 1.2s infinite;${STEP}}@keyframes d3{0%{opacity:0}66%{opacity:1}}
    .st1,.st2{animation:steam 1.6s steps(4,end) infinite}.st2{animation-delay:-.8s}
    @keyframes steam{0%{transform:translateY(6px);opacity:0}30%{opacity:1}100%{transform:translateY(-14px);opacity:0}}
    .sp{animation:tw .5s infinite;${STEP}}
    .flick{animation:flick 4s infinite;${STEP}}@keyframes flick{0%{opacity:.55}96%{opacity:.8}98%{opacity:.55}}
  </style>
  <defs>
    <clipPath id="scr"><rect x="48" y="34" width="754" height="284"/></clipPath>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".35"/></pattern>
  </defs>
  ${scene()}
</svg>`;

writeFileSync(join(OUT, "miko-desk.svg"), svg.trim() + "\n");
console.log("wrote miko-desk.svg");
