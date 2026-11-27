// Pixel title-screen banner: "ANANTH KRISHNA J" as a game logo, Miko waving
// on a rooftop, a scrolling dusk city, rotating roles and PRESS START.
//   node scripts/miko-hero.mjs   -> assets/pixel/hero.svg
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pxText, textWidth, sprite, pxBox, MIKO, MIKO_PAL, MIKO_FX, FX_PAL } from "./pixel.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "pixel");
mkdirSync(OUT, { recursive: true });

const W = 850, H = 340;
const WHITE = "#ffffff", PINK = "#f7a8c6", HOT = "#ff5fa2", INK = "#1a0b24", GREY = "#b9a8c9";
const STEP = "animation-timing-function:steps(1,end)";
let seed = 21;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// dusk sky as hard pixel bands
const SKY = ["#140a2a", "#1d0f3a", "#2a1450", "#3d1a62", "#5a226e", "#7e2e78", "#a8487f", "#d0688a", "#f08ea0"];
function sky() {
  let out = "", y = 0;
  const hs = [60, 34, 28, 24, 20, 18, 16, 14, 126];
  SKY.forEach((c, i) => { out += `<rect x="0" y="${y}" width="${W}" height="${hs[i] + 2}" fill="${c}"/>`; y += hs[i]; });
  // dither seams
  y = 0;
  hs.slice(0, -1).forEach((h, i) => {
    y += h;
    let d = "";
    for (let x = (i % 2) * 4; x < W; x += 8) d += `M${x} ${y - 4}h4v4h-4z`;
    out += `<path fill="${SKY[i + 1]}" d="${d}"/>`;
  });
  return out;
}
function stars() {
  let out = "";
  for (let i = 0; i < 40; i++) {
    const x = Math.round(rnd() * W / 4) * 4, y = Math.round(rnd() * 120 / 4) * 4;
    const d = (1 + rnd() * 2.5).toFixed(1), dl = (-rnd() * 3).toFixed(1);
    out += rnd() > 0.8
      ? `<path class="tw" style="animation-duration:${d}s;animation-delay:${dl}s" fill="${WHITE}" d="M${x} ${y - 4}h4v4h4v4h-4v4h-4v-4h-4v-4h4z"/>`
      : `<rect class="tw" style="animation-duration:${d}s;animation-delay:${dl}s" x="${x}" y="${y}" width="4" height="4" fill="${i % 3 ? "#e6d6ff" : PINK}"/>`;
  }
  return out;
}
// one skyline tile (width W), drawn twice for seamless scrolling
function skyline(base, hMin, hMax, color, winColor, wins) {
  let out = "", x = 0;
  while (x < W) {
    const w = 8 * (4 + Math.floor(rnd() * 7)), h = 8 * Math.floor(hMin / 8 + rnd() * ((hMax - hMin) / 8));
    out += `<rect x="${x}" y="${base - h}" width="${w}" height="${h + 60}" fill="${color}"/>`;
    if (rnd() > 0.6) out += `<rect x="${x + w / 2 - 2}" y="${base - h - 12}" width="4" height="12" fill="${color}"/>`;
    if (wins) for (let wy = base - h + 8; wy < base - 4; wy += 12) for (let wx = x + 6; wx < x + w - 6; wx += 10) {
      if (rnd() > 0.55) out += `<rect ${rnd() > 0.85 ? `class="tw" style="animation-duration:${(2 + rnd() * 4).toFixed(1)}s"` : ""} x="${wx}" y="${wy}" width="4" height="6" fill="${winColor}"/>`;
    }
    x += w + 4 * Math.floor(rnd() * 3);
  }
  return out;
}
function petals(n) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * (W + 200)), d = (7 + rnd() * 6).toFixed(1), dl = (-rnd() * 13).toFixed(1);
    out += `<g transform="translate(${x} 0)"><path class="pf" style="animation-duration:${d}s;animation-delay:${dl}s" fill="${rnd() > 0.4 ? PINK : WHITE}" d="M0 0h4v4h-4zM4 4h4v4h-4z"/></g>`;
  }
  return out;
}

// logo: outline + drop shadow + two-tone fill + shine, letters bob in a wave
function logo(str, x, y, s, top, bottom, shadow, id, delay0 = 0) {
  let out = "";
  [...str].forEach((ch, i) => {
    if (ch === " ") return;
    const cx = x + i * 6 * s;
    const glyph = (dx, dy, c) => pxText(ch, cx + dx, y + dy, s, c);
    const o = Math.round(s * 0.45); // bold: each stroke drawn twice, o apart
    const bold = (dx, dy, c) => glyph(dx, dy, c) + glyph(dx + o, dy, c);
    out += `<g class="wave" style="animation-delay:${(delay0 + i * 0.08).toFixed(2)}s">
      ${bold(o, o + Math.round(s * 0.6), INK)}
      ${bold(0, Math.round(s * 0.6), shadow)}
      <g clip-path="url(#${id}t)">${bold(0, 0, top)}</g><g clip-path="url(#${id}b)">${bold(0, 0, bottom)}</g>
    </g>`;
  });
  const w = textWidth(str, s);
  return `<clipPath id="${id}t"><rect x="${x - s}" y="${y - 20}" width="${w + 2 * s}" height="${20 + 3.5 * s}"/></clipPath>
    <clipPath id="${id}b"><rect x="${x - s}" y="${y + 3.5 * s}" width="${w + 2 * s}" height="${5 * s}"/></clipPath>
    <clipPath id="${id}s">${pxText(str, x, y, s, "#000").replace("<path", '<path class="nob"')}</clipPath>
    ${out}
    <g clip-path="url(#${id}s)"><g class="shine" style="animation-delay:${delay0}s"><path fill="#fff" opacity=".85" d="M${x - 60} ${y - 10}h${s * 3}l-${s * 6} ${s * 9}h-${s * 3}z"/></g></g>`;
}

// Miko waving: base sprite + a raised arm that flaps between two frames
const ARM_A = ["..SSS.", ".SSSSK", ".SSSSK", "..WWK.", "..WWK.", ".WWK..", "WWK..."];
const ARM_B = ["...SSS", "..SSSSK", "..SSSSK", "...WWK", "..WWK.", ".WWK..", "WWK..."];

function hero() {
  const ms = 6, mx = 636, my = 300 - 30 * ms + 6; // stands on the roof
  const roles = ["AI STUDENT @ KTU", "GAME MAKER", "WEB BUILDER", "ANIME ENJOYER", "MIKO'S CREATOR"];
  const RT = roles.length * 2.4;
  let roleSvg = "", roleCss = "";
  roles.forEach((r, i) => {
    const a = (i / roles.length) * 100, b = ((i + 1) / roles.length) * 100;
    roleCss += `.r${i}{opacity:0;animation:r${i} ${RT}s infinite;${STEP}}@keyframes r${i}{0%{opacity:0}${a.toFixed(2)}%{opacity:1}${b.toFixed(2)}%,100%{opacity:0}}`;
    if (i === 0) roleCss = roleCss.replace("@keyframes r0{0%{opacity:0}0.00%{opacity:1}", "@keyframes r0{0%{opacity:1}");
    // typed reveal for each role
    const w = textWidth(r, 3);
    roleSvg += `<g class="r${i}"><clipPath id="rc${i}"><rect class="rt" style="animation-delay:${(i * 2.4).toFixed(1)}s" x="70" y="226" width="${w}" height="21"/></clipPath>
      <g clip-path="url(#rc${i})">${pxText(r, 70, 226, 3, WHITE)}</g></g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .tw{animation:tw 2s infinite;${STEP}}@keyframes tw{0%{opacity:1}50%{opacity:.2}}
    .pf{animation:pf linear infinite;animation-timing-function:steps(30,end)}@keyframes pf{from{transform:translate(0,-10px)}to{transform:translate(-160px,${H + 10}px)}}
    .far{animation:scroll 60s linear infinite;animation-timing-function:steps(240,end)}
    .near{animation:scroll 30s linear infinite;animation-timing-function:steps(240,end)}
    @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}
    .wave{animation:wave 1.6s infinite;${STEP}}
    @keyframes wave{0%{transform:translateY(0)}12%{transform:translateY(-6px)}24%,100%{transform:translateY(0)}}
    .shine{animation:shine 4s infinite;animation-timing-function:steps(24,end)}@keyframes shine{0%{transform:translateX(0)}40%,100%{transform:translateX(560px)}}
    .bob{animation:bob .8s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .aa{animation:aa .5s infinite;${STEP}}@keyframes aa{0%{opacity:1}50%{opacity:0}}
    .ab{animation:ab .5s infinite;${STEP}}@keyframes ab{0%{opacity:0}50%{opacity:1}}
    .bl{animation:bl 3.4s infinite;${STEP}}@keyframes bl{0%{opacity:0}92%{opacity:1}96%,100%{opacity:0}}
    .start{animation:start 1s infinite;${STEP}}@keyframes start{0%{opacity:1}60%{opacity:0}}
    .cur{animation:start .6s infinite;${STEP}}
    .rt{transform-box:fill-box;transform-origin:left;animation:rt ${RT}s infinite;animation-timing-function:steps(16,end)}
    @keyframes rt{0%{transform:scaleX(0)}${(100 / roles.length * 0.4).toFixed(2)}%,100%{transform:scaleX(1)}}
    .b1{animation:b1 6s infinite;${STEP}}@keyframes b1{0%{opacity:1}50%,100%{opacity:0}}
    .b2{animation:b2 6s infinite;${STEP}}@keyframes b2{0%{opacity:0}50%{opacity:1}}
    .shoot{animation:shoot 7s infinite;animation-timing-function:steps(14,end)}@keyframes shoot{0%,80%{transform:translate(0,0);opacity:0}81%{opacity:1}100%{transform:translate(-280px,140px);opacity:0}}
    .hr{animation:hr 1.4s steps(7,end) infinite}@keyframes hr{from{transform:translateY(0);opacity:1}to{transform:translateY(-42px);opacity:0}}
    ${roleCss}
  </style>
  <defs><clipPath id="frame"><rect width="${W}" height="${H}"/></clipPath></defs>
  <g clip-path="url(#frame)">
    ${sky()}
    ${stars()}
    <g class="shoot"><path fill="${WHITE}" d="M700 30h8v4h-8zM708 26h8v4h-8zM716 22h12v4h-12z"/></g>
    <g class="far">${skyline(282, 60, 150, "#3a1d55", "#f2b4d0", true)}<g transform="translate(${W} 0)">${(seed = 21, skyline(282, 60, 150, "#3a1d55", "#f2b4d0", true))}</g></g>
    <g class="near">${(seed = 77, skyline(300, 30, 90, "#24103a", "#ffd68a", true))}<g transform="translate(${W} 0)">${(seed = 77, skyline(300, 30, 90, "#24103a", "#ffd68a", true))}</g></g>
    ${(seed = 5, petals(16))}

    <!-- rooftop -->
    <rect x="0" y="300" width="${W}" height="40" fill="#120820"/>
    <rect x="0" y="300" width="${W}" height="4" fill="#4a2a6a"/>
    ${Array.from({ length: Math.ceil(W / 32) }, (_, i) => `<rect x="${i * 32}" y="310" width="28" height="4" fill="#1e0f30"/>`).join("")}

    <!-- HUD -->
    ${pxText("1P", 24, 14, 2, PINK)}${pxText("ANANTH", 52, 14, 2, WHITE)}
    ${pxText("HI-SCORE", W / 2, 14, 2, PINK, { anchor: "middle" })}${pxText("999999", W / 2, 32, 2, WHITE, { anchor: "middle" })}
    ${pxText("CREDIT 01", W - 24, 14, 2, WHITE, { anchor: "end" })}

    <!-- logo -->
    ${logo("ANANTH", 40, 64, 11, WHITE, PINK, HOT, "l1", 0)}
    ${logo("KRISHNA J", 44, 156, 7, WHITE, "#ffd1e3", "#8a3cff", "l2", 0.5)}

    <!-- text band -->
    <rect x="28" y="214" width="470" height="80" fill="#140a2a" opacity=".78"/>
    <rect x="28" y="214" width="4" height="80" fill="${PINK}"/>
    <!-- rotating roles -->
    <g class="cur">${pxText(">", 46, 226, 3, PINK)}</g>
    ${roleSvg}

    <g class="start">${pxText("PRESS START", 46, 272, 3, "#ffd68a")}</g>
    ${pxText("(C) 2026 ANANTH OS", 270, 278, 2, GREY)}

    <!-- Miko -->
    <rect x="${mx + 10}" y="300" width="${24 * ms - 20}" height="6" fill="#0a0414" opacity=".6"/>
    <g class="bob">
      ${sprite(MIKO, MIKO_PAL, mx, my, ms)}
      ${sprite(MIKO_FX.smug, FX_PAL, mx, my, ms)}
      <g class="aa">${sprite(ARM_A, MIKO_PAL, mx + 20 * ms, my + 13 * ms, ms)}</g>
      <g class="ab">${sprite(ARM_B, MIKO_PAL, mx + 20 * ms, my + 13 * ms, ms)}</g>
    </g>
    <g class="hr"><path fill="${PINK}" transform="translate(${mx - 14} ${my + 40}) scale(3)" d="M1 0h2v1h1v-1h2v1h1v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-2h1z"/></g>
    <g class="hr" style="animation-delay:-.7s"><path fill="${WHITE}" transform="translate(${mx + 150} ${my + 70}) scale(2)" d="M1 0h2v1h1v-1h2v1h1v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-2h1z"/></g>

    <!-- speech bubble -->
    ${pxBox(548, 52, 290, 40, 3, WHITE, WHITE)}<path fill="${WHITE}" d="M${mx + 64} 92h14v6h-4v4h-4v4h-6z"/>
    <g class="b1">${pxText("WELCOME, TRAVELER!", 693, 64, 2, INK, { anchor: "middle" })}</g>
    <g class="b2">${pxText("...N-NOT THAT I WAITED.", 693, 64, 2, INK, { anchor: "middle" })}</g>
  </g>
  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#3a3a3a" stroke-width="4"/>
</svg>`;
}

writeFileSync(join(OUT, "hero.svg"), hero().trim() + "\n");
console.log("wrote pixel hero.svg");
