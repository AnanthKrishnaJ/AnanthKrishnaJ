// Extra pixel pieces for the profile README:
//   node scripts/miko-extras.mjs  -> assets/pixel/{ticker,hud,achievements}.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, pxBox } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel");
mkdirSync(OUT, { recursive: true });

const WHITE = "#f5f5f5", GREY = "#8a8a8a", PINK = "#f7a8c6", BG = "#0b0b0b", PANEL = "#141414";
const EDGE = "#3a3a3a", GOLD = "#ffd166", CYAN = "#7fdbff", MINT = "#7ee3b0";
const STEP = "animation-timing-function:steps(1,end)";

const svg = (w, h, css, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">
  <style>${css}</style>
${body}
</svg>
`;

// 1) Scrolling marquee ticker -------------------------------------------------
function ticker() {
  const W = 850, H = 52, s = 3;
  const msg = "+ ANANTH OS + MIKO IS WATCHING + NEW BUILDS SOON + TSUNDERE APPROVED + ";
  const loop = msg.length * 6 * s; // one full cycle, in px
  const y = (H - 7 * s) / 2;
  const copy = (x) => pxText(msg, x, y, s, PINK);
  const css = `.tk{animation:tk 24s linear infinite}
  @keyframes tk{from{transform:translateX(0)}to{transform:translateX(${-loop}px)}}
  .tw{animation:tw 1.2s ${STEP} infinite}@keyframes tw{0%{fill:${PINK}}50%{fill:${CYAN}}}`;
  return svg(W, H, css, `
  <defs><clipPath id="cl"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
  ${pxBox(0, 0, W, H, 4, BG, EDGE)}
  <rect x="4" y="4" width="${W - 8}" height="4" fill="${GOLD}" opacity=".35"/>
  <rect x="4" y="${H - 8}" width="${W - 8}" height="4" fill="${GOLD}" opacity=".35"/>
  <g clip-path="url(#cl)"><g class="tk">${copy(0)}${copy(loop)}</g></g>`);
}

// 2) Quest HUD: name, level and a "shipped" XP bar -----------------------------
function hud() {
  const W = 850, H = 80, shipped = 22, total = 31; // 22 built, 9 in progress
  const barX = 28, barW = W - 56, barY = 40, barH = 14;
  const fill = Math.round((barW - 8) * (shipped / total));
  const left = "PLAYER 1: ANANTH";
  const right = `${shipped} / ${total} SHIPPED`;
  const css = `.xp{animation:xp 1.6s ${STEP} infinite}@keyframes xp{0%{opacity:1}50%{opacity:.55}}
  .cur{animation:cur 0.8s ${STEP} infinite}@keyframes cur{0%{opacity:1}50%{opacity:0}}`;
  const body = `
  ${pxBox(0, 0, W, H, 4, BG, EDGE)}
  ${pxText(left, 28, 10, 3, WHITE)}
  ${pxText(right, W - 28, 10, 3, GOLD, { anchor: "end" })}
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="#000" stroke="${EDGE}" stroke-width="4"/>
  <rect class="xp" x="${barX + 4}" y="${barY + 4}" width="${fill}" height="${barH - 8}" fill="${PINK}"/>
  <rect x="${barX + 4 + fill}" y="${barY + 4}" width="6" height="${barH - 8}" fill="${WHITE}" class="cur"/>
  ${pxText("9 MORE IN PROGRESS", W - 28, 63, 1, GREY, { anchor: "end" })}
  ${pxText("LV 22", 28, 63, 1, MINT)}`;
  return svg(W, H, css, body);
}

// 3) Achievement badges -------------------------------------------------------
const TROPHY = [
  "YYYYYYYYY",
  "YYYYYYYYY",
  ".YYYYYYY.",
  "..YYYYY..",
  "...YYY...",
  "....Y....",
  "....Y....",
  "..YYYYY..",
  ".YYYYYYY.",
];
function trophy(x, y, s, color) {
  let d = "";
  TROPHY.forEach((row, ry) => {
    let run = -1;
    for (let rx = 0; rx <= row.length; rx++) {
      const on = rx < row.length && row[rx] === "Y";
      if (on && run < 0) run = rx;
      if (!on && run >= 0) {
        d += `M${x + run * s} ${y + ry * s}h${(rx - run) * s}v${s}h${-(rx - run) * s}z`;
        run = -1;
      }
    }
  });
  return `<path fill="${color}" d="${d}"/>`;
}

function achievements() {
  const W = 850, H = 230;
  const badges = [
    { title: "22 BUILT", lines: ["single-file apps, games", "and tools, all shipped"] },
    { title: "IN PROGRESS", lines: ["9 more on the way", "some are in progress"] },
    { title: "ANIME FAN", lines: ["the watch list lives", "on my anime shelf"] },
    { title: "MIKO'S CREATOR", lines: ["she's a tsundere.", "i built her myself"] },
  ];
  const bw = 196, bh = 150, gap = 14, by = 64;
  const bx0 = Math.round((W - (bw * badges.length + gap * (badges.length - 1))) / 2);
  const css = `.tr{animation:bob 1.6s ${STEP} infinite}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  .sp{animation:sp 1.6s ${STEP} infinite}@keyframes sp{0%{opacity:1}50%{opacity:0}}
  .ttl{animation:ttl 2.4s ${STEP} infinite}@keyframes ttl{0%{opacity:1}75%{opacity:.7}}`;

  let body = `
  ${pxBox(0, 0, W, H, 4, BG, EDGE)}
  ${pxText("ACHIEVEMENTS UNLOCKED", W / 2, 22, 3, GOLD, { anchor: "middle", cls: "ttl" })}
  <rect x="${bx0}" y="48" width="${W - 2 * bx0}" height="4" fill="${EDGE}"/>`;

  badges.forEach((b, i) => {
    const x = bx0 + i * (bw + gap);
    const cx = x + bw / 2;
    const delay = `style="animation-delay:-${(i * 0.4).toFixed(1)}s"`;
    const col = [GOLD, CYAN, MINT, PINK][i];
    body += `
  ${pxBox(x, by, bw, bh, 4, PANEL, col)}
  <g class="tr" ${delay}>${trophy(cx - 13, by + 14, 3, GOLD)}</g>
  <rect class="sp" ${delay} x="${cx + 14}" y="${by + 12}" width="4" height="4" fill="${WHITE}"/>
  ${pxText(b.title, cx, by + 66, 2, col, { anchor: "middle" })}
  ${pxText(b.lines[0], cx, by + 94, 1, WHITE, { anchor: "middle" })}
  ${pxText(b.lines[1], cx, by + 108, 1, GREY, { anchor: "middle" })}`;
  });

  return svg(W, H, css, body);
}

const files = { "ticker.svg": ticker(), "hud.svg": hud(), "achievements.svg": achievements() };
for (const [name, markup] of Object.entries(files)) {
  writeFileSync(join(OUT, name), markup);
  console.log("wrote", name);
}
