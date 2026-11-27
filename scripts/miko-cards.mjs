// Pixel project cards for "Things I've built": each shows Miko doing that
// project (fighting a slime in ECLIPSE, chatting in WTalk, taking an Airi
// quiz...). The Rock Paper Scissors card shows cycling hands, no Miko.
//   node scripts/miko-cards.mjs   -> assets/pixel/cards/*.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, sprite, pxBox, MIKO, MIKO_PAL, MIKO_FX, FX_PAL, HANDS, HAND_PAL } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel", "cards");
mkdirSync(OUT, { recursive: true });

const W = 420, H = 170;
const WHITE = "#f5f5f5", GREY = "#8a8a8a", PINK = "#f7a8c6", BG = "#0b0b0b", GREEN = "#7ee08a", RED = "#ff6b7a", BLUE = "#7aa2f7", GOLD = "#e0c060";
const STEP = "animation-timing-function:steps(1,end)";
const r = (x, y, w, h, c, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${extra}/>`;

// scene panel origin
const OX = 10, OY = 10, PW = 160, PH = 150;
const MX = OX + 44, MY = OY + 46, S = 3; // Miko at 3x (72x90)
const miko = (fx, cls = "") =>
  `<g${cls ? ` class="${cls}"` : ""}>${sprite(MIKO, MIKO_PAL, MX, MY, S)}${fx ? sprite(MIKO_FX[fx], FX_PAL, MX, MY, S) : ""}</g>`;
const blink = `<g class="bl">${sprite(MIKO_FX.blink, FX_PAL, MX, MY, S)}</g>`;
const bubble = (x, y, text, fill = WHITE, ink = BG) => {
  const w = text.length * 12 + 10;
  return `${pxBox(x, y, w, 22, 2, fill, fill)}${pxText(text, x + 6, y + 4, 2, ink)}`;
};
const heart = (x, y, c = PINK) => `<path fill="${c}" d="M${x + 2} ${y}h4v2h2v-2h4v2h2v4h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2h-2v-4h2z"/>`;
const spark = (x, y, c = WHITE) => `<path fill="${c}" d="M${x + 4} ${y}h2v4h4v2h-4v4h-2v-4h-4v-2h4z"/>`;

const CSS = `
  .bob{animation:bob .8s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-3px)}}
  .bl{animation:bl 3.2s infinite;${STEP}}@keyframes bl{0%{opacity:0}90%{opacity:1}95%,100%{opacity:0}}
  .tw{animation:tw 1s infinite;${STEP}}@keyframes tw{0%{opacity:1}50%{opacity:.15}}
  .a{animation:a 2s infinite;${STEP}}@keyframes a{0%{opacity:1}50%,100%{opacity:0}}
  .b{animation:b 2s infinite;${STEP}}@keyframes b{0%{opacity:0}50%{opacity:1}100%{opacity:1}}`;

const SCENES = {
  // sword slash vs a slime, damage numbers
  eclipse: {
    css: `.sl{animation:sl 1.2s infinite;${STEP}}@keyframes sl{0%{transform:translateY(0)}25%{transform:translateY(-10px)}50%{transform:translateY(0)}}
          .hit{animation:hit 1.2s infinite;${STEP}}@keyframes hit{0%{opacity:0}50%{opacity:1}85%,100%{opacity:0}}
          .up{animation:up 1.2s steps(4,end) infinite}@keyframes up{0%,50%{transform:translateY(0)}100%{transform:translateY(-14px)}}
          .s1{animation:s1 1.2s infinite;${STEP}}@keyframes s1{0%{opacity:1}50%,100%{opacity:0}}
          .s2{animation:s2 1.2s infinite;${STEP}}@keyframes s2{0%{opacity:0}50%{opacity:1}85%,100%{opacity:0}}`,
    art: () => `
      <path fill="#fff6c8" d="M${OX + 128} ${OY + 12}h12v4h4v12h-4v4h-12v-4h-4v-12h4z"/><path fill="#141014" d="M${OX + 122} ${OY + 12}h10v4h4v8h-4v4h-10z"/>
      ${miko("smug")}
      <g class="s1">${r(MX + 70, MY + 26, 4, 34, "#dfe7f2")}${r(MX + 64, MY + 58, 16, 4, GOLD)}${r(MX + 70, MY + 62, 4, 8, "#6b4e3d")}</g>
      <g class="s2"><g transform="rotate(60 ${MX + 72} ${MY + 66})">${r(MX + 70, MY + 26, 4, 34, "#dfe7f2")}${r(MX + 64, MY + 58, 16, 4, GOLD)}</g>
        <path fill="${WHITE}" opacity=".8" d="M${OX + 116} ${OY + 92}h8v4h4v8h4v8h-4v-4h-4v-8h-4v-4h-4z"/></g>
      <g transform="translate(${OX + 120} ${OY + 118})"><g class="sl">
        <path fill="#6fcf7a" d="M8 0h16v4h4v4h4v12h-32v-12h4v-4h4z"/><path fill="${BG}" d="M10 8h4v4h-4zM20 8h4v4h-4z"/><path fill="#3f9a4c" d="M0 16h32v4h-32z"/></g></g>
      <g class="hit"><g class="up">${pxText("-12", OX + 118, OY + 98, 2, RED)}</g></g>
      <rect x="${OX + 4}" y="${OY + PH - 12}" width="${PW - 8}" height="8" fill="#2a2030"/>`,
  },
  // tinkering with a wrench while tool icons orbit
  zxvi: {
    css: `.g{transform-box:fill-box;transform-origin:center;animation:g 2s steps(8,end) infinite}@keyframes g{to{transform:rotate(360deg)}}
          .wr{transform-box:fill-box;transform-origin:50% 90%;animation:wr .6s infinite;${STEP}}@keyframes wr{0%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}`,
    art: () => `
      <path class="g" fill="${GREY}" d="M${OX + 20} ${OY + 14}h8v4h4v-4h4v8h-4v4h4v8h-4v-4h-4v4h-8v-4h-4v4h-4v-8h4v-4h-4v-8h4v4h4z"/>
      <g class="tw">${r(OX + 126, OY + 16, 12, 12, GOLD)}${r(OX + 128, OY + 28, 8, 4, GREY)}</g>
      <g class="tw" style="animation-delay:-.5s">${pxText("AI", OX + 18, OY + 70, 2, PINK)}</g>
      <g class="bob">${miko("smug")}${blink}</g>
      <g class="wr">${r(MX + 72, MY + 44, 6, 26, "#bdbdbd")}${r(MX + 68, MY + 38, 14, 8, "#bdbdbd")}${r(MX + 72, MY + 38, 6, 4, "#141014")}</g>
      ${pxBox(OX + 104, OY + 112, 46, 30, 2, "#3a2a2a", "#6b4e3d")}${r(OX + 104, OY + 120, 46, 3, "#6b4e3d")}`,
  },
  // chat bubbles popping in
  wtalk: {
    css: `.c1,.c2,.c3{opacity:0;animation:c 3s infinite;${STEP}}.c2{animation-delay:-2s}.c3{animation-delay:-1s}
          @keyframes c{0%{opacity:1}66%,100%{opacity:0}}`,
    art: () => `
      <g class="c1">${bubble(OX + 8, OY + 10, "HI!")}</g>
      <g class="c2">${bubble(OX + 82, OY + 20, "YO", "#2a2a2a", WHITE)}</g>
      <g class="c3">${pxBox(OX + 30, OY + 32, 34, 22, 2, PINK, PINK)}${heart(OX + 40, OY + 37, BG)}</g>
      <g class="bob">${miko()}${blink}</g>
      ${pxBox(MX + 64, MY + 50, 18, 28, 2, "#2a2a2a", "#6a6a6a")}${r(MX + 67, MY + 54, 12, 16, BLUE)}`,
  },
  // flicking through a shelf of anime covers
  "anime-shelf": {
    css: `.cv{animation:cv 2.4s infinite;${STEP}}@keyframes cv{0%{fill:${PINK}}33%{fill:${BLUE}}66%{fill:${GOLD}}}`,
    art: () => {
      const cols = [PINK, BLUE, GOLD, GREEN, RED, "#c08cf0", WHITE, PINK, BLUE];
      let shelf = "";
      cols.forEach((c, i) => (shelf += r(OX + 8 + i * 16, OY + 12 + (i % 3) * 2, 12, 34 - (i % 3) * 2, c)));
      return `${shelf}${r(OX + 4, OY + 46, PW - 8, 4, "#6b4e3d")}
      <g class="bob">${miko("smug")}</g>
      ${pxBox(MX + 58, MY + 40, 28, 38, 2, PINK, WHITE).replace(`fill="${PINK}"`, `class="cv" fill="${PINK}"`)}${r(MX + 64, MY + 48, 16, 4, BG)}
      <g class="tw">${spark(OX + 14, OY + 70)}</g><g class="tw" style="animation-delay:-.5s">${spark(OX + 136, OY + 60, PINK)}</g>`;
    },
  },
  // quiz board: cursor moves A -> B -> C, then a tick
  airi: {
    css: `.cur{animation:cur 3s infinite;${STEP}}@keyframes cur{0%{transform:translateY(0)}25%{transform:translateY(14px)}50%,100%{transform:translateY(28px)}}
          .ok{opacity:0;animation:ok 3s infinite;${STEP}}@keyframes ok{0%{opacity:0}60%{opacity:1}}`,
    art: () => `
      ${pxBox(OX + 8, OY + 8, 62, 72, 2, WHITE, WHITE)}
      ${pxText("Q1", OX + 14, OY + 13, 2, BG)}
      ${pxText("A", OX + 26, OY + 32, 2, "#555")}${pxText("B", OX + 26, OY + 46, 2, "#555")}${pxText("C", OX + 26, OY + 60, 2, "#555")}
      <g class="cur">${pxText(">", OX + 14, OY + 32, 2, PINK)}</g>
      <g class="ok"><path fill="${GREEN}" d="M${OX + 46} ${OY + 62}h4v4h4v-4h4v-4h4v-4h4v4h-4v4h-4v4h-4v4h-4v-4h-4z"/></g>
      <g class="b">${miko("smug")}</g><g class="a">${miko()}${sprite(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "...........KKK"], MIKO_PAL, MX, MY, S)}</g>
      ${r(MX + 68, MY + 46, 4, 22, GOLD)}${r(MX + 68, MY + 68, 4, 4, PINK)}`,
  },
  // "?" then "!" as the silhouette card flips
  "anime-guess": {
    css: ``,
    art: () => `
      <g class="a">${pxBox(OX + 12, OY + 12, 40, 54, 2, "#2a2a2a", GREY)}${pxText("?", OX + 26, OY + 30, 3, GREY)}
        ${pxBox(MX + 50, MY - 30, 26, 26, 2, WHITE, WHITE)}${pxText("?", MX + 58, MY - 24, 2, BG)}${miko("pout")}</g>
      <g class="b">${pxBox(OX + 12, OY + 12, 40, 54, 2, PINK, WHITE)}${r(OX + 22, OY + 22, 20, 20, "#fff6c8")}${r(OX + 22, OY + 46, 20, 4, BG)}
        ${pxBox(MX + 50, MY - 30, 26, 26, 2, PINK, PINK)}${pxText("!", MX + 58, MY - 24, 2, BG)}${miko("smug")}
        <g class="tw">${spark(OX + 56, OY + 14)}</g></g>`,
  },
  // studying past papers under a lamp, A+ stamp
  pyq: {
    css: `.pg{animation:pg .9s infinite;${STEP}}@keyframes pg{0%{transform:translateX(0)}50%{transform:translateX(-14px)}}
          .st{opacity:0;animation:st 3s infinite;${STEP}}@keyframes st{0%{opacity:0}70%{opacity:1}}`,
    art: () => `
      ${r(OX + 120, OY + 20, 4, 60, "#6a6a6a")}${r(OX + 100, OY + 14, 30, 10, GOLD)}<path fill="#fff6c8" opacity=".18" d="M${OX + 96} ${OY + 24}h38l18 70h-74z"/>
      ${miko()}${blink}
      ${r(OX + 4, OY + 118, PW - 8, 28, "#5a3e2e")}${r(OX + 4, OY + 114, PW - 8, 6, "#8a6248")}
      ${r(MX + 4, MY + 76, 64, 18, WHITE)}<g class="pg">${r(MX + 36, MY + 76, 32, 18, "#e6e6e6")}</g>${r(MX + 35, MY + 76, 2, 18, GREY)}
      <g class="st">${pxBox(OX + 10, OY + 20, 40, 26, 2, "none", RED).replace(/<path fill="none"[^>]*\/>/, "")}${pxText("A+", OX + 18, OY + 26, 2, RED)}</g>`,
  },
  // no Miko here — just the hands cycling
  rps: {
    css: `.h0,.h1,.h2{opacity:0;animation:h 2.4s infinite;${STEP}}.h1{animation-delay:-1.6s}.h2{animation-delay:-.8s}
          @keyframes h{0%{opacity:1}33.3%,100%{opacity:0}}`,
    art: () => `
      ${["rock", "paper", "scissors"].map((m, i) => `<g class="h${i}"><g class="bob">${sprite(HANDS[m], { ...HAND_PAL, K: "#4a4a4a" }, OX + 32, OY + 30, 6)}</g></g>`).join("")}
      <g class="tw">${spark(OX + 16, OY + 16)}</g><g class="tw" style="animation-delay:-.5s">${spark(OX + 134, OY + 120, PINK)}</g>`,
  },
};

const PROJECTS = [
  { slug: "eclipse", name: "ECLIPSE: THE LAST KINGDOM", tag: "GAME", desc: "ANIME ACTION RPG, EVOLVING SKILLS" },
  { slug: "zxvi", name: "ZXVI ONEAI TOOLKIT", tag: "TOOLKIT", desc: "AI TOOLS IN ONE OFFLINE HTML FILE" },
  { slug: "wtalk", name: "WTALK", tag: "WEB APP", desc: "GLOBAL REAL-TIME CHAT WITH ANTI-ABUSE" },
  { slug: "anime-shelf", name: "ANIME SHELF", tag: "ANIME", desc: "MY ANILIST AS AN ANIMATED STOREFRONT" },
  { slug: "airi", name: "AIRI", tag: "STUDY", desc: "MCQ AND APTITUDE EXAM PRACTICE APP" },
  { slug: "anime-guess", name: "ANIME GUESSING GAME", tag: "GAME", desc: "HOW WELL DO YOU KNOW YOUR ANIME?" },
  { slug: "pyq", name: "S7 AI PYQ BANK", tag: "STUDY", desc: "KTU S7 PAST QUESTIONS WITH ANSWERS" },
  { slug: "rps", name: "ROCK PAPER SCISSORS", tag: "GAME", desc: "THE CLASSIC HAND GAME, IN BROWSER" },
];

function wrap(text, max) {
  const out = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function card(p, i) {
  const sc = SCENES[p.slug];
  const tx = OX + PW + 16, max = Math.floor((W - tx - 12) / 12);
  const title = wrap(p.name, max).slice(0, 2);
  const desc = wrap(p.desc, max).slice(0, title.length > 1 ? 2 : 3);
  const dy = 22 + title.length * 20 + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>${CSS}${sc.css}
    .edge{animation:edge 2.4s infinite;${STEP};animation-delay:${-i * 0.3}s}@keyframes edge{0%{opacity:0}80%{opacity:1}90%,100%{opacity:0}}
  </style>
  <defs><clipPath id="p"><rect x="${OX + 4}" y="${OY + 4}" width="${PW - 8}" height="${PH - 8}"/></clipPath></defs>
  ${pxBox(0, 0, W, H, 4, BG, "#3a3a3a")}
  <g class="edge">${pxBox(0, 0, W, H, 4, "none", WHITE).replace(/<path fill="none"[^>]*\/>/, "")}</g>
  ${pxBox(OX, OY, PW, PH, 4, "#141014", "#2a2a2a")}
  <g clip-path="url(#p)">${sc.art()}</g>
  ${title.map((l, k) => pxText(l, tx, 22 + k * 20, 2, WHITE)).join("")}
  ${desc.map((l, k) => pxText(l, tx, dy + k * 18, 2, GREY)).join("")}
  ${pxBox(tx, H - 38, p.tag.length * 12 + 14, 22, 2, "#1c1c1c", PINK)}${pxText(p.tag, tx + 7, H - 34, 2, PINK)}
  <g class="tw">${pxText(">", W - 26, H - 34, 2, PINK)}</g>
</svg>`;
}

PROJECTS.forEach((p, i) => writeFileSync(join(OUT, `${p.slug}.svg`), card(p, i).trim() + "\n"));
console.log("wrote", PROJECTS.length, "cards");
