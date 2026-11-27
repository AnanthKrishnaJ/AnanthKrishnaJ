// Pixel-art section headers for the profile README, each with a tiny
// animated Kiyanagi Miko doing something different (the game header gets
// the little bot instead).
//   node scripts/miko-headers.mjs   -> assets/pixel/h-*.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, textWidth, sprite, pxBox, MIKO, MIKO_PAL, MIKO_FX, FX_PAL, BOT, BOT_PAL, BOT_FACES } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel");
mkdirSync(OUT, { recursive: true });

const W = 850, H = 84, S = 2; // Miko at 2x = 48x60
const WHITE = "#f5f5f5", GREY = "#8a8a8a", PINK = "#f7a8c6", BG = "#0b0b0b";
const STEP = "animation-timing-function:steps(1,end)";
const miko = (x, y, fx) =>
  sprite(MIKO, MIKO_PAL, x, y, S) + (fx ? sprite(MIKO_FX[fx], FX_PAL, x, y, S) : "");
const blinkLayer = (x, y) => `<g class="blink">${sprite(MIKO_FX.blink, FX_PAL, x, y, S)}</g>`;
const heart = (x, y, c = PINK) => `<path fill="${c}" d="M${x + 2} ${y}h4v2h2v-2h4v2h2v4h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2h-2v-4h2z"/>`;
const spark = (x, y, c = WHITE) => `<path fill="${c}" d="M${x + 4} ${y}h2v4h4v2h-4v4h-2v-4h-4v-2h4z"/>`;

const BASE_CSS = `
  .ar{animation:ar .8s infinite;${STEP}}@keyframes ar{0%{opacity:1}50%{opacity:0}}
  .march{animation:march 1.2s steps(4,end) infinite}@keyframes march{from{transform:translateX(0)}to{transform:translateX(16px)}}
  .bob{animation:bob .8s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-3px)}}
  .blink{animation:blink 3.6s infinite;${STEP}}@keyframes blink{0%{opacity:0}90%{opacity:1}95%,100%{opacity:0}}`;

function frame(title, scene, css = "") {
  const tw = textWidth(title, 4);
  let dashes = "";
  for (let x = -16; x < tw + 34; x += 16) dashes += `<rect x="${x}" width="8" height="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>${BASE_CSS}${css}</style>
  <defs><clipPath id="u"><rect x="30" y="58" width="${tw + 34}" height="3"/></clipPath>
  <clipPath id="cl"><rect x="4" y="4" width="${W - 8}" height="${H - 8}"/></clipPath></defs>
  ${pxBox(0, 0, W, H, 4, BG, "#3a3a3a")}
  <g class="ar">${pxText(">", 30, 26, 4, PINK)}</g>
  ${pxText(title, 64, 26, 4, WHITE)}
  <g clip-path="url(#u)"><g class="march" fill="${GREY}" transform="translate(30 58)">${dashes}</g></g>
  <g clip-path="url(#cl)">${scene}</g>
</svg>`;
}

const headers = {
  // waving hello: hops with hearts floating up
  about: frame("HEY THERE, I'M ANANTH", `
    <g transform="translate(720 12)"><g class="bob">${miko(0, 0, "smug")}</g></g>
    <g class="h1">${heart(780, 30)}</g><g class="h2">${heart(700, 36, "#ffffff")}</g><g class="h3">${heart(790, 50)}</g>`,
    `.h1,.h2,.h3{animation:up 2.4s steps(8,end) infinite}.h2{animation-delay:-.8s}.h3{animation-delay:-1.6s}
     @keyframes up{0%{transform:translateY(20px);opacity:0}15%{opacity:1}100%{transform:translateY(-34px);opacity:0}}`),

  // walking back and forth along the header
  tools: frame("TOOLS I REACH FOR", `
    <g class="walk"><g class="bob">${miko(0, 14)}${blinkLayer(0, 14)}</g></g>`,
    `.walk{animation:walk 9s steps(36,end) infinite alternate}
     @keyframes walk{from{transform:translateX(520px)}to{transform:translateX(780px)}}
     .walk .bob{animation-duration:.4s}`),

  // peeking up from the bottom edge, surprised "!"
  built: frame("THINGS I'VE BUILT", `
    <g class="peek">${miko(700, 30, "fluster")}</g>
    <g class="ex">${pxText("!", 760, 18, 3, PINK)}</g>`,
    `.peek{animation:peek 4s infinite;${STEP}}
     @keyframes peek{0%{transform:translateY(60px)}20%{transform:translateY(40px)}25%{transform:translateY(20px)}30%{transform:translateY(0)}75%{transform:translateY(20px)}80%{transform:translateY(40px)}85%,100%{transform:translateY(60px)}}
     .ex{animation:ex 4s infinite;${STEP}}@keyframes ex{0%{opacity:0}32%{opacity:1}36%{opacity:0}40%{opacity:1}72%,100%{opacity:0}}`),

  // the game header: a little bot instead of Miko (she stays out of the game)
  game: frame("ROCK PAPER SCISSORS", `
    <g transform="translate(740 12)"><g class="bob">${sprite(BOT, BOT_PAL, 0, 0, S)}
      <g class="open">${sprite(BOT_FACES.neutral, BOT_PAL, 10, 16, S)}</g><g class="shut">${sprite(BOT_FACES.smug, BOT_PAL, 10, 16, S)}</g></g></g>
    <g class="s1">${spark(716, 14)}</g><g class="s2">${spark(796, 40, PINK)}</g>`,
    `.s1,.s2{animation:tw 1.2s infinite;${STEP}}.s2{animation-delay:-.6s}
     @keyframes tw{0%{opacity:1}50%{opacity:0}}
     .open{animation:tw 2.4s infinite;${STEP}}.shut{animation:tw 2.4s infinite;${STEP};animation-delay:-1.2s}`),

  // dozing off while the snake eats the graph
  snake: frame("CONTRIBUTION SNAKE", `
    <g transform="translate(730 14)"><g class="breathe">${miko(0, 0)}${sprite(MIKO_FX.blink, FX_PAL, 0, 0, S)}</g></g>
    <g class="z1">${pxText("Z", 784, 30, 2, GREY)}</g><g class="z2">${pxText("Z", 796, 16, 3, WHITE)}</g>`,
    `.breathe{animation:bob 2s infinite;${STEP}}
     .z1,.z2{animation:zz 2.4s steps(6,end) infinite}.z2{animation-delay:-1.2s}
     @keyframes zz{0%{transform:translate(0,10px);opacity:0}20%{opacity:1}100%{transform:translate(10px,-12px);opacity:0}}`),
};

for (const [id, svg] of Object.entries(headers)) writeFileSync(join(OUT, `h-${id}.svg`), svg.trim() + "\n");
console.log("wrote", Object.keys(headers).length, "headers");
