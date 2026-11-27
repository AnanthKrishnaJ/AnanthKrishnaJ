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
  // Miko vs her own mirror: she always throws the same move, so it's always a draw
  rps: {
    css: `.h0,.h1,.h2{opacity:0;animation:h 2.4s infinite;${STEP}}.h1{animation-delay:-1.6s}.h2{animation-delay:-.8s}
          @keyframes h{0%{opacity:1}33.3%,100%{opacity:0}}
          .sh{animation:sh .8s infinite;${STEP}}@keyframes sh{0%{transform:translateY(0)}25%{transform:translateY(-6px)}50%{transform:translateY(0)}}
          .dr{animation:dr .8s infinite;${STEP}}@keyframes dr{0%,40%{opacity:0}50%,100%{opacity:1}}`,
    art: () => {
      const hp = { ...HAND_PAL, K: "#4a4a4a" };
      const hands = (x, flipIt) => ["rock", "paper", "scissors"].map((m, i) => {
        const h = sprite(HANDS[m], hp, 0, 0, 2);
        return `<g class="h${i}"><g transform="translate(${flipIt ? x + 32 : x} ${OY + 30}) scale(${flipIt ? -1 : 1} 1)">${h}</g></g>`;
      }).join("");
      const m2 = (x, y) => sprite(MIKO, MIKO_PAL, x, y, 2) + sprite(MIKO_FX.pout, FX_PAL, x, y, 2);
      const mx = OX + 84;
      return `
      ${pxBox(mx, OY + 18, 64, 124, 4, "#9fb8c8", "#d0d0d0")}${r(mx + 4, OY + 22, 56, 116, "#b8d0dc")}
      <path fill="#ffffff" opacity=".5" d="M${mx + 8} ${OY + 30}h6v6h-6zM${mx + 14} ${OY + 36}h6v6h-6zM${mx + 40} ${OY + 100}h6v6h-6z"/>
      <g transform="translate(${OX + 10} ${OY + 70})">${m2(0, 0)}</g>
      <g opacity=".8" transform="translate(${2 * mx + 64 - 10} ${OY + 70}) scale(-1 1)"><g transform="translate(${mx + 8} 0)">${m2(0, 0)}</g></g>
      <g class="sh">${hands(OX + 18, false)}${hands(mx + 16, true)}</g>
      <g class="dr">${pxText("DRAW!", OX + 52, OY + 10, 2, GOLD, { anchor: "middle" })}</g>
      ${pxText("x999", OX + 14, OY + 134, 1, GREY)}`;
    },
  },
};

// ---------- extra props ----------
const note = (x, y, c = PINK) => `<path fill="${c}" d="M${x + 6} ${y}h8v4h-4v12h-2v2h-6v-4h4z"/>`;
const coin = (x, y) => `<path fill="${GOLD}" d="M${x + 4} ${y}h8v2h2v2h2v8h-2v2h-2v2h-8v-2h-2v-2h-2v-8h2v-2h2z"/><path fill="#b08a20" d="M${x + 7} ${y + 4}h2v8h-2z"/>`;
const win = (x, y, w, h, title, body = "#f5f5f5") =>
  `${pxBox(x, y, w, h, 2, body, WHITE)}${r(x + 2, y + 2, w - 4, 10, "#3a3a3a")}${r(x + w - 10, y + 4, 6, 6, RED)}${title ? pxText(title, x + 5, y + 3, 1, WHITE) : ""}`;
const wipBar = (x, y, w) => {
  let stripes = "";
  for (let i = -16; i < w + 16; i += 8) stripes += `<path d="M${i} 0h4l-4 8h-4z"/>`;
  return `${pxBox(x, y, w, 12, 2, "#1c1c1c", GREY)}<clipPath id="wb"><rect x="${x + 2}" y="${y + 2}" width="${Math.round(w * 0.62)}" height="8"/></clipPath>
    <g clip-path="url(#wb)"><rect x="${x + 2}" y="${y + 2}" width="${w}" height="8" fill="${PINK}"/><g class="mar" fill="#c0628a" transform="translate(${x} ${y + 2})">${stripes}</g></g>`;
};
const CSS_EXTRA = `.mar{animation:mar .6s steps(2,end) infinite}@keyframes mar{to{transform:translateX(8px)}}
  .f3a,.f3b,.f3c{opacity:0;animation:f3 1.5s infinite;${STEP}}.f3b{animation-delay:-1s}.f3c{animation-delay:-.5s}@keyframes f3{0%{opacity:1}33.3%,100%{opacity:0}}
  .rise{animation:rise 1.6s steps(6,end) infinite}@keyframes rise{from{transform:translateY(10px);opacity:1}to{transform:translateY(-26px);opacity:0}}
  .hop{animation:hop .6s infinite;${STEP}}@keyframes hop{0%{transform:translateY(0)}50%{transform:translateY(-6px)}}`;

Object.assign(SCENES, {
  // neural net nodes lighting up layer by layer
  "dl-viva": {
    css: ``,
    art: () => {
      const L = [[OX + 16, [20, 44, 68]], [OX + 46, [14, 34, 54, 74]], [OX + 76, [32, 56]]];
      let lines = "", nodes = "";
      for (let a = 0; a < 2; a++) for (const y1 of L[a][1]) for (const y2 of L[a + 1][1]) {
        const x1 = L[a][0] + 8, x2 = L[a + 1][0];
        lines += `<path stroke="#3a3a4a" stroke-width="2" d="M${x1} ${OY + y1 + 4}L${x2} ${OY + y2 + 4}"/>`;
      }
      L.forEach(([x, ys], k) => ys.forEach((y) => (nodes += `${r(x, OY + y, 8, 8, "#3a3a4a")}<g class="f3${"abc"[k]}">${r(x, OY + y, 8, 8, [PINK, BLUE, GREEN][k])}</g>`)));
      return `<g shape-rendering="auto">${lines}</g>${nodes}${pxText("ACC 98%", OX + 10, OY + 92, 1, GREEN)}
        <g transform="translate(26 6)">${miko("smug")}</g>`;
    },
  },
  // reading the giant powers tome
  "eclipse-wiki": {
    css: `.pg2{animation:pg2 .8s infinite;${STEP}}@keyframes pg2{0%{transform:translateX(0)}50%{transform:translateX(-12px)}}`,
    art: () => `${miko()}${blink}
      ${r(MX - 6, MY + 58, 84, 30, "#5a2a6a")}${r(MX - 2, MY + 60, 38, 24, "#f2e6c8")}${r(MX + 38, MY + 60, 38, 24, "#f2e6c8")}<g class="pg2">${r(MX + 38, MY + 60, 38, 24, "#e6d6b0")}</g>
      ${r(MX + 6, MY + 66, 20, 2, "#8a6a4a")}${r(MX + 6, MY + 72, 24, 2, "#8a6a4a")}${r(MX + 46, MY + 66, 22, 2, "#8a6a4a")}
      <g class="tw">${spark(OX + 20, OY + 20, "#c08cf0")}</g><g class="tw" style="animation-delay:-.5s">${spark(OX + 130, OY + 30, GOLD)}</g>
      ${pxText("112", OX + 12, OY + 50, 2, "#c08cf0")}`,
  },
  // trophy bounce on a podium
  uma: {
    css: ``,
    art: () => `<g transform="translate(-24 0)">${miko("smug")}</g>
      ${r(OX + 98, OY + 112, 48, 34, "#6a6a6a")}${pxText("1", OX + 116, OY + 120, 2, WHITE)}
      <g class="hop"><path fill="${GOLD}" d="M${OX + 104} ${OY + 72}h36v6h6v10h-6v4h-6v6h-4v6h8v6h-28v-6h8v-6h-4v-6h-6v-4h-6v-10h6z"/><path fill="#fff6a0" d="M${OX + 110} ${OY + 76}h4v12h-4z"/></g>
      <g class="tw">${spark(OX + 96, OY + 60)}</g><g class="tw" style="animation-delay:-.5s">${spark(OX + 140, OY + 56, PINK)}</g>`,
  },
  // turn-based battle menu
  myrpggame: {
    css: `.cr{animation:cr 2.4s infinite;${STEP}}@keyframes cr{0%{transform:translateY(0)}33%{transform:translateY(12px)}66%,100%{transform:translateY(0)}}
          .fb{opacity:0;animation:fb 2.4s infinite;${STEP}}@keyframes fb{0%,66%{opacity:0}70%{opacity:1}90%,100%{opacity:0}}`,
    art: () => `<g transform="translate(-30 -10)">${miko()}</g>
      ${pxBox(OX + 96, OY + 92, 56, 50, 2, "#1a1a3a", WHITE)}
      ${pxText("ATK", OX + 112, OY + 100, 1, WHITE)}${pxText("MAG", OX + 112, OY + 112, 1, WHITE)}${pxText("RUN", OX + 112, OY + 124, 1, WHITE)}
      <g class="cr">${pxText(">", OX + 102, OY + 100, 1, PINK)}</g>
      <g class="fb">${r(OX + 104, OY + 30, 14, 14, "#ff9a3a")}${r(OX + 108, OY + 26, 6, 22, "#ffd24a")}${r(OX + 100, OY + 34, 22, 6, "#ff6b3a")}</g>
      ${pxText("HP", OX + 100, OY + 12, 1, GREY)}${r(OX + 114, OY + 12, 32, 6, GREEN)}`,
  },
  // tiny blobs evolving pointless traits
  "useless-evo": {
    css: ``,
    art: () => {
      const blob = (x, y, c, face = "") => `<path fill="${c}" d="M${x + 4} ${y}h12v4h4v12h-20v-12h4z"/>${r(x + 6, y + 6, 2, 3, BG)}${r(x + 12, y + 6, 2, 3, BG)}${face}`;
      return `<g transform="translate(0 -18)">${miko()}${blink}</g>
        <g class="hop">${blob(OX + 14, OY + 120, PINK)}</g>
        <g class="hop" style="animation-delay:-.3s">${blob(OX + 52, OY + 124, BLUE)}${pxText("!", OX + 76, OY + 116, 1, BLUE)}</g>
        ${blob(OX + 96, OY + 124, GREEN, r(OX + 102, OY + 130, 8, 2, RED))}${r(OX + 126, OY + 132, 16, 10, "#7a7a7a")}${r(OX + 128, OY + 128, 10, 4, "#9a9a9a")}
        <g class="tw">${pxText("#!", OX + 108, OY + 108, 1, RED)}</g>`;
    },
  },
  // puzzle piece snapping into place
  jigsaw: {
    css: `.pc{animation:pc 2s infinite;animation-timing-function:steps(6,end)}@keyframes pc{0%{transform:translate(30px,-30px)}60%,100%{transform:translate(0,0)}}`,
    art: () => {
      const g = OX + 92, y = OY + 76;
      return `<g transform="translate(-30 0)">${miko("smug")}</g>
        ${r(g, y, 26, 26, BLUE)}${r(g + 28, y, 26, 26, PINK)}${r(g, y + 28, 26, 26, GOLD)}${r(g + 24, y + 8, 8, 10, BG)}
        <g class="pc">${r(g + 28, y + 28, 26, 26, GREEN)}${r(g + 36, y + 24, 10, 6, GREEN)}</g>`;
    },
  },
  // spinning hexagon with falling blocks
  hextris: {
    css: `.hx{transform-box:fill-box;transform-origin:center;animation:hx 3s steps(6,end) infinite}@keyframes hx{to{transform:rotate(360deg)}}
          .fall{animation:fall 1.2s steps(6,end) infinite}@keyframes fall{from{transform:translateY(-40px)}to{transform:translateY(0)}}`,
    art: () => `<g transform="translate(-34 0)">${miko("smug")}</g>
      <g class="hx"><path fill="#2a2a3a" stroke="${WHITE}" stroke-width="2" shape-rendering="auto" d="M${OX + 120} ${OY + 72}l24 14v28l-24 14l-24-14v-28z"/>
      ${r(OX + 104, OY + 84, 12, 6, PINK)}${r(OX + 126, OY + 112, 12, 6, BLUE)}${r(OX + 98, OY + 104, 6, 12, GOLD)}</g>
      <g class="fall">${r(OX + 114, OY + 46, 12, 8, GREEN)}</g>`,
  },
  // letter grid with a found-word highlight sweeping
  wordsearch: {
    css: `.hl{animation:hl 2.4s infinite;${STEP}}@keyframes hl{0%{transform:translateY(0)}33%{transform:translateY(17px)}66%,100%{transform:translateY(34px)}}`,
    art: () => {
      const L = ["MIKOQ", "XCODE", "ANIME", "ZPIXL", "RAMEN"];
      let g = "";
      L.forEach((row, y) => (g += pxText(row, OX + 14, OY + 14 + y * 17, 2, "#8a8a8a")));
      return `${pxBox(OX + 8, OY + 8, 72, 92, 2, "#1c1c1c", "#3a3a3a")}<g class="hl">${r(OX + 11, OY + 28, 66, 17, PINK, ' opacity=".35"')}</g>${g}
        <g transform="translate(34 14)">${miko("smug")}</g>`;
    },
  },
  // headphones + equalizer + notes
  spotimer: {
    css: `.eq{transform-box:fill-box;transform-origin:bottom;animation:eq .6s infinite;${STEP}}@keyframes eq{0%{transform:scaleY(1)}50%{transform:scaleY(.4)}}`,
    art: () => `<g class="bob">${miko("smug")}${r(MX + 2, MY + 30, 10, 22, "#2a2a2a")}${r(MX + 60, MY + 30, 10, 22, "#2a2a2a")}${r(MX + 6, MY + 4, 60, 6, "#2a2a2a")}${r(MX + 4, MY + 34, 6, 14, GREEN)}${r(MX + 62, MY + 34, 6, 14, GREEN)}</g>
      ${[0, 1, 2, 3, 4].map((i) => `<rect class="eq" style="animation-delay:${-i * 0.13}s" x="${OX + 14 + i * 10}" y="${OY + 112 - (i % 3) * 10}" width="6" height="${24 + (i % 3) * 10}" fill="${GREEN}"/>`).join("")}
      <g class="rise">${note(OX + 120, OY + 40)}</g><g class="rise" style="animation-delay:-.8s">${note(OX + 136, OY + 60, WHITE)}</g>
      ${pxText("128H", OX + 10, OY + 12, 2, GREEN)}`,
  },
  // robot arm swinging + flashcard
  robotics: {
    css: `.arm{transform-box:view-box;transform-origin:${OX + 112}px ${OY + 120}px;animation:arm 1.6s infinite;${STEP}}@keyframes arm{0%{transform:rotate(-20deg)}50%{transform:rotate(15deg)}}`,
    art: () => `<g transform="translate(-34 0)">${miko()}${blink}</g>
      ${r(OX + 100, OY + 124, 26, 18, "#6a6a6a")}
      <g class="arm">${r(OX + 108, OY + 74, 8, 50, "#e0c060")}${r(OX + 104, OY + 68, 16, 10, "#b08a20")}${r(OX + 102, OY + 62, 4, 8, GREY)}${r(OX + 118, OY + 62, 4, 8, GREY)}</g>
      ${pxBox(OX + 96, OY + 14, 50, 32, 2, WHITE, WHITE)}${pxText("Q?", OX + 104, OY + 22, 2, BG)}`,
  },
  // graduation cap + score
  ccw: {
    css: ``,
    art: () => `<g class="bob">${miko("smug")}<path fill="#2a2a2a" d="M${MX + 4} ${MY - 4}h64v6h-64z"/><path fill="#2a2a2a" d="M${MX + 20} ${MY + 2}h32v6h-32z"/>${r(MX + 64, MY + 2, 2, 14, GOLD)}${r(MX + 62, MY + 16, 6, 4, GOLD)}</g>
      ${pxBox(OX + 8, OY + 10, 56, 26, 2, WHITE, WHITE)}<g class="a">${pxText("9/10", OX + 13, OY + 16, 2, BG)}</g><g class="b">${pxText("10/10", OX + 11, OY + 16, 2, "#2f9a4a")}</g>`,
  },
  // chat moderation: a toxic line gets blocked
  mei: {
    css: ``,
    art: () => `<g transform="translate(26 10)">${miko("smug")}</g>
      ${r(OX + 10, OY + 12, 60, 10, "#2a3a2a")}${r(OX + 12, OY + 15, 40, 4, GREEN)}
      ${r(OX + 10, OY + 28, 70, 10, "#2a3a2a")}${r(OX + 12, OY + 31, 52, 4, GREEN)}
      <g class="a">${r(OX + 10, OY + 44, 66, 10, "#3a2a2a")}${r(OX + 12, OY + 47, 46, 4, RED)}</g>
      <g class="b">${r(OX + 10, OY + 44, 66, 10, "#3a1a1a")}${pxText("BLOCKED", OX + 14, OY + 46, 1, RED)}
        <path fill="${BLUE}" d="M${OX + 84} ${OY + 40}h16v4h2v8h-2v4h-2v2h-4v2h-4v-2h-4v-2h-2v-4h-2v-8h2z"/></g>`,
  },
  // burger site in a browser window
  mcweb: {
    css: ``,
    art: () => `${win(OX + 8, OY + 8, 80, 66, "")}
      <g class="hop"><path fill="#e0a040" d="M${OX + 30} ${OY + 30}h36v4h4v6h-44v-6h4z"/>${r(OX + 26, OY + 42, 44, 4, "#6fcf7a")}${r(OX + 26, OY + 46, 44, 6, "#6b3e2e")}${r(OX + 28, OY + 54, 40, 6, "#e0a040")}</g>
      <g transform="translate(26 6)">${miko("smug")}</g>`,
  },
  // old portfolio, under construction
  oldprofile: {
    css: ``,
    art: () => {
      let st = "";
      for (let i = 0; i < 9; i++) st += `<path fill="${i % 2 ? BG : GOLD}" d="M${OX + 12 + i * 8} ${OY + 56}h8l-6 10h-8z"/>`;
      return `${win(OX + 8, OY + 8, 84, 64, "")}${pxText("V1.0", OX + 16, OY + 24, 2, "#555")}${st}
        <g transform="translate(26 6)">${miko()}${blink}</g>`;
    },
  },

  // ---------- in progress ----------
  "miko-exe": {
    css: ``,
    art: () => `<g class="b">${miko("fluster")}</g><g class="a">${miko()}</g>
      ${win(OX + 6, OY + 8, 120, 40, "MIKO.EXE")}${pxText("NOT RESPONDING", OX + 12, OY + 26, 1, RED)}${pxText("HEART: 404", OX + 12, OY + 36, 1, "#555")}`,
  },
  yadav: {
    css: `.tap{animation:tap .5s infinite;${STEP}}@keyframes tap{0%{transform:translateY(0)}50%{transform:translateY(4px)}}`,
    art: () => `<g transform="translate(-30 0)">${miko("smug")}</g>
      <g class="tap"><path fill="#f2e6c8" d="M${OX + 104} ${OY + 70}h30v6h6v40h-6v6h-30v-6h-6v-40h6z"/>${r(OX + 104, OY + 82, 30, 6, "#c07040")}${r(OX + 104, OY + 96, 30, 6, "#6fcf7a")}${r(OX + 104, OY + 108, 30, 4, RED)}</g>
      <g class="rise">${pxText("+1", OX + 112, OY + 48, 2, GOLD)}</g>${pxText("TAP!", OX + 100, OY + 132, 2, PINK)}`,
  },
  navaneeth: {
    css: ``,
    art: () => `<g transform="translate(-34 0)">${miko()}${blink}</g>
      <path fill="${PINK}" d="M${OX + 106} ${OY + 50}h32v6h6v8h4v44h-4v8h-6v6h-32v-6h-6v-8h-4v-44h4v-8h6z"/>
      ${r(OX + 106, OY + 70, 32, 30, "#b8d8a8")}
      <g class="hop">${r(OX + 112, OY + 84, 20, 12, "#7a7a7a")}${r(OX + 116, OY + 80, 12, 4, "#8a8a8a")}${r(OX + 116, OY + 88, 2, 2, BG)}${r(OX + 126, OY + 88, 2, 2, BG)}</g>
      ${r(OX + 110, OY + 106, 6, 6, WHITE)}${r(OX + 120, OY + 108, 6, 6, WHITE)}${r(OX + 130, OY + 106, 6, 6, WHITE)}
      <g class="tw">${heart(OX + 122, OY + 34)}</g>`,
  },
  inkborn: {
    css: ``,
    art: () => {
      const stick = (x, punch) => `<g fill="none" stroke="${WHITE}" stroke-width="4" shape-rendering="auto" stroke-linecap="square">
        <rect x="${x - 7}" y="${OY + 40}" width="14" height="14" fill="${WHITE}" stroke="none"/>
        <path d="M${x} ${OY + 54}v34M${x} ${OY + 88}l-10 26M${x} ${OY + 88}l10 26"/>
        <path d="${punch ? `M${x} ${OY + 64}h26` : `M${x} ${OY + 64}l14 10`}M${x} ${OY + 64}l-12 12"/></g>`;
      return `<g class="a">${stick(OX + 46, true)}${stick(OX + 110, false).replace(new RegExp(`${OX + 110}`, "g"), String(OX + 110))}${pxText("POW", OX + 64, OY + 22, 2, RED)}</g>
        <g class="b">${stick(OX + 46, false)}<g transform="translate(${2 * (OX + 110)} 0) scale(-1 1)">${stick(OX + 110, true)}</g>${pxText("WHAM", OX + 56, OY + 22, 2, GOLD)}</g>
        ${r(OX + 4, OY + 132, PW - 8, 4, "#3a3a3a")}`;
    },
  },
  "zxvi-voice": {
    css: `.eq{transform-box:fill-box;transform-origin:center;animation:eq .5s infinite;${STEP}}@keyframes eq{0%{transform:scaleY(1)}50%{transform:scaleY(.3)}}`,
    art: () => `<g transform="translate(-34 0)">${miko("smug")}</g>
      ${pxBox(OX + 112, OY + 70, 20, 32, 4, "#6a6a6a", "#9a9a9a")}${r(OX + 120, OY + 102, 4, 18, GREY)}${r(OX + 110, OY + 120, 24, 4, GREY)}
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect class="eq" style="animation-delay:${-i * 0.09}s" x="${OX + 96 + i * 9}" y="${OY + 22 + (i % 2) * 6}" width="5" height="${26 - (i % 2) * 12}" fill="${PINK}"/>`).join("")}
      ${pxText("EN JA HI", OX + 92, OY + 56, 1, GREY)}`,
  },
  marin: {
    css: ``,
    art: () => `<g transform="translate(-30 0)">${miko("smug")}</g>
      ${coin(OX + 108, OY + 124)}${coin(OX + 108, OY + 114)}${coin(OX + 108, OY + 104)}<g class="hop">${coin(OX + 128, OY + 124)}</g>
      <g class="rise">${pxText("+500", OX + 98, OY + 70, 2, GOLD)}</g>${pxText("AURA", OX + 104, OY + 14, 2, "#c08cf0")}`,
  },
  yuka: {
    css: ``,
    art: () => `${r(OX + 30, OY + 60, 70, 46, "#2a2a2a")}<path fill="#2a2a2a" d="M${OX + 100} ${OY + 70}l24-12v50l-24-12z"/>
      ${r(OX + 40, OY + 70, 20, 20, "#4a4a4a")}${r(OX + 44, OY + 74, 12, 12, BLUE)}
      ${pxBox(OX + 26, OY + 18, 76, 30, 2, "#1c1c1c", WHITE)}${[0, 1, 2, 3, 4].map((i) => `<path fill="${i % 2 ? WHITE : BG}" d="M${OX + 28 + i * 15} ${OY + 20}h15l-6 8h-15z"/>`).join("")}
      ${pxText("YUKA", OX + 40, OY + 32, 2, WHITE)}
      <g class="tw">${r(OX + 16, OY + 120, 10, 10, RED)}</g>${pxText("REC", OX + 32, OY + 122, 2, RED)}`,
  },
  ananthimation: {
    css: ``,
    art: () => `<g transform="translate(0 -26)">${miko()}${blink}</g>
      ${pxBox(OX + 6, OY + 100, 148, 42, 3, "#1a1a3a", WHITE)}
      <g class="a">${pxText("I'LL WAIT FOR", OX + 14, OY + 110, 1, WHITE)}${pxText("YOU, ALWAYS...", OX + 14, OY + 122, 1, WHITE)}</g>
      <g class="b">${pxText("...EVEN IF THE", OX + 14, OY + 110, 1, WHITE)}${pxText("WORLD ENDS.", OX + 14, OY + 122, 1, WHITE)}</g>
      <g class="tw">${pxText(">", OX + 138, OY + 128, 1, PINK)}</g>
      <path fill="#7ac8ff" d="M${MX + 50} ${MY + 10}h3v3h3v6h-3v3h-3v-3h-3v-6h3z"/>`,
  },
  vocaloid: {
    css: ``,
    art: () => `<g class="bob">${miko("smug")}</g>${r(MX + 66, MY + 44, 6, 30, GREY)}${pxBox(MX + 62, MY + 32, 14, 14, 2, "#6a6a6a", "#9a9a9a")}
      <g class="rise">${note(OX + 18, OY + 60)}</g><g class="rise" style="animation-delay:-.5s">${note(OX + 124, OY + 40, BLUE)}</g><g class="rise" style="animation-delay:-1.1s">${note(OX + 30, OY + 30, WHITE)}</g>
      ${pxText("LA LA", OX + 96, OY + 14, 2, PINK)}`,
  },
});

// built = public repos (newest first); wip = private repos + projects without a repo yet
export const PROJECTS = [
  { slug: "pyq", repo: "s7-ai-pyq-bank", name: "S7 AI PYQ BANK", tag: "STUDY", desc: "KTU S7 PAST QUESTIONS WITH ANSWERS" },
  { slug: "anime-shelf", repo: "anime-shelf", name: "ANIME SHELF", tag: "ANIME", desc: "MY ANILIST AS AN ANIMATED STOREFRONT" },
  { slug: "dl-viva", repo: "deep-learning-lab-viva", name: "DEEP LEARNING LAB", tag: "STUDY", desc: "11 EXPERIMENTS + VIVA MCQ PRACTICE" },
  { slug: "eclipse", repo: "eclipse-the-last-kingdom", name: "ECLIPSE: THE LAST KINGDOM", tag: "GAME", desc: "PIXEL ACTION RPG IN ONE HTML FILE" },
  { slug: "wtalk", repo: "WTalk", name: "WTALK", tag: "WEB APP", desc: "GLOBAL REAL-TIME CHAT WITH ANTI-ABUSE" },
  { slug: "rps", repo: "RPS", name: "ROCK PAPER SCISSORS", tag: "GAME", desc: "MIRROR MATCH: ALL DRAWS" },
  { slug: "eclipse-wiki", repo: "eclipse-evolution-wiki", name: "ECLIPSE EVOLUTION WIKI", tag: "WIKI", desc: "ALL 112 POWERS AND HOW THEY EVOLVE" },
  { slug: "zxvi", repo: "zxvi-oneai-toolkit", name: "ZXVI ONEAI TOOLKIT", tag: "TOOLKIT", desc: "220 OFFLINE TOOLS IN ONE HTML FILE" },
  { slug: "airi", repo: "Airi", name: "AIRI", tag: "STUDY", desc: "MCQ AND APTITUDE EXAM PRACTICE APP" },
  { slug: "uma", repo: "Uma-Sus-Cup-Tracker", name: "UMA SUS CUP TRACKER", tag: "TRACKER", desc: "UMA MUSUME CUP RESULTS TRACKER" },
  { slug: "myrpggame", repo: "myrpggame", name: "MY RPG GAME", tag: "GAME", desc: "OPEN-WORLD TURN-BASED FANTASY RPG" },
  { slug: "useless-evo", repo: "useless-evolution1", name: "USELESS EVOLUTION SIM", tag: "SIM", desc: "LIFE EVOLVES POINTLESS TRAITS" },
  { slug: "jigsaw", repo: "jigsaw-solver", name: "JIGSAW AUTO SOLVER", tag: "EXTENSION", desc: "SOLVES JIGSAW PLANET IN ONE CLICK" },
  { slug: "hextris", repo: "auto-solver-hextris", name: "AUTO SOLVER HEXTRIS", tag: "BOT", desc: "HEXTRIS THAT PLAYS ITSELF" },
  { slug: "wordsearch", repo: "solver1", name: "WORD SEARCH SOLVER", tag: "SOLVER", desc: "FINDS EVERY WORD IN THE GRID" },
  { slug: "spotimer", repo: "spotimer", name: "SPOTIMER", tag: "MUSIC", desc: "MY SPOTIFY LISTENING TIME AND TOP ARTISTS" },
  { slug: "robotics", repo: "LabRoboticsAIT332", name: "ROBOTICS LAB VIVA", tag: "STUDY", desc: "AIT332 VIVA FLASHCARDS" },
  { slug: "ccw", repo: "ccw-scholar", name: "CCW SCHOLAR", tag: "STUDY", desc: "COURSE WORK QUIZ PLATFORM" },
  { slug: "mei", repo: "Mei", name: "MEI", tag: "AI", desc: "MULTILINGUAL GAME-CHAT TOXICITY DETECTOR" },
  { slug: "mcweb", repo: "MCwebmake", name: "MCWEBMAKE", tag: "WEB", desc: "A BURGER JOINT WEBSITE WE MADE" },
  { slug: "oldprofile", repo: "Ananathprofile", name: "ANANATHPROFILE", tag: "WEB", desc: "MY FIRST PORTFOLIO, MADE FOR FUN" },
  { slug: "anime-guess", repo: "Anime-Guessing-Game", name: "ANIME GUESSING GAME", tag: "GAME", desc: "HOW WELL DO YOU KNOW YOUR ANIME?" },
];
export const WIP = [
  { slug: "miko-exe", name: "MIKO.EXE", tag: "SHORTS", desc: "TSUNDERE DESKTOP-MASCOT SHORTS" },
  { slug: "yadav", name: "YADAV SHAWARMA SIMULATOR", tag: "GAME", desc: "TAP GAME, LIVE LEADERBOARD" },
  { slug: "navaneeth", name: "NAVANEETH ROCK SIMULATOR", tag: "GAME", desc: "RAISE A PIXEL PET ROCK" },
  { slug: "inkborn", name: "INKBORN", tag: "SHORTS", desc: "STICKMAN FIGHT SHORTS" },
  { slug: "zxvi-voice", name: "ZXVI VOICE", tag: "AI", desc: "MULTILINGUAL AI VOICE GENERATOR" },
  { slug: "marin", name: "MARIN AURA BANK", tag: "BOT", desc: "DISCORD AURA ECONOMY BOT" },
  { slug: "yuka", name: "YUKA SHORTS", tag: "SHORTS", desc: "3D CHIBI DAILY-LIFE COMEDY" },
  { slug: "ananthimation", name: "ANANTHIMATION", tag: "SHORTS", desc: "EMOTIONAL PIXEL-RPG STORY SHORTS" },
  { slug: "vocaloid", name: "MY OWN VOCALOID", tag: "MUSIC", desc: "BUILDING MY OWN VIRTUAL SINGER" },
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

function card(p, i, wip = false) {
  const sc = SCENES[p.slug];
  const tx = OX + PW + 16, max = Math.floor((W - tx - 12) / 12);
  const title = wrap(p.name, max).slice(0, 2);
  const desc = wrap(p.desc, max).slice(0, title.length > 1 ? 2 : 3);
  const dy = 22 + title.length * 20 + 10;
  const tag = wip ? "WIP" : p.tag;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>${CSS}${CSS_EXTRA}${sc.css}
    .edge{animation:edge 2.4s infinite;${STEP};animation-delay:${-i * 0.3}s}@keyframes edge{0%{opacity:0}80%{opacity:1}90%,100%{opacity:0}}
  </style>
  <defs><clipPath id="p"><rect x="${OX + 4}" y="${OY + 4}" width="${PW - 8}" height="${PH - 8}"/></clipPath></defs>
  ${pxBox(0, 0, W, H, 4, BG, wip ? "#5a3a4a" : "#3a3a3a")}
  <g class="edge">${pxBox(0, 0, W, H, 4, "none", wip ? PINK : WHITE).replace(/<path fill="none"[^>]*\/>/, "")}</g>
  ${pxBox(OX, OY, PW, PH, 4, "#141014", "#2a2a2a")}
  <g clip-path="url(#p)">${sc.art()}</g>
  ${title.map((l, k) => pxText(l, tx, 22 + k * 20, 2, WHITE)).join("")}
  ${desc.map((l, k) => pxText(l, tx, dy + k * 18, 2, GREY)).join("")}
  ${pxBox(tx, H - 38, tag.length * 12 + 14, 22, 2, "#1c1c1c", PINK)}${pxText(tag, tx + 7, H - 34, 2, PINK)}
  ${wip ? wipBar(tx + tag.length * 12 + 24, H - 33, W - (tx + tag.length * 12 + 24) - 16) : `<g class="tw">${pxText(">", W - 26, H - 34, 2, PINK)}</g>`}
</svg>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  PROJECTS.forEach((p, i) => writeFileSync(join(OUT, `${p.slug}.svg`), card(p, i).trim() + "\n"));
  WIP.forEach((p, i) => writeFileSync(join(OUT, `${p.slug}.svg`), card(p, i, true).trim() + "\n"));
  console.log("wrote", PROJECTS.length, "built +", WIP.length, "in-progress cards");
}
