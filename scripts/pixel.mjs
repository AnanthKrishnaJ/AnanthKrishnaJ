// Tiny pixel-art toolkit for the profile SVGs: a 5x7 bitmap font and a
// sprite renderer. Everything is drawn as merged <path> rectangles with
// crisp edges, so it stays sharp at any size and needs no web fonts.

// ---------- 5x7 bitmap font ----------
const G = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  ",": [".....", ".....", ".....", ".....", ".....", "..#..", ".#..."],
  "'": ["..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  ":": [".....", "..#..", ".....", ".....", ".....", "..#..", "....."],
  "#": [".#.#.", "#####", ".#.#.", ".#.#.", "#####", ".#.#.", "....."],
  "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."],
  "/": ["....#", "...#.", "...#.", "..#..", ".#...", ".#...", "#...."],
  "%": ["##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##"],
  "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
  ">": ["#....", "##...", "###..", "####.", "###..", "##...", "#...."], // play arrow
  "<": [".....", ".#.#.", "#####", "#####", ".###.", "..#..", "....."], // heart
};

const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;
const n = (v) => Math.round(v * 100) / 100;

/** width in SVG units of `str` drawn at pixel size `s` */
export const textWidth = (str, s) => (String(str).length * 6 - 1) * s;

/** Draw text with the bitmap font. anchor: "start" | "middle" | "end". */
export function pxText(str, x, y, s, fill, { anchor = "start", cls = "", style = "" } = {}) {
  str = String(str).toUpperCase();
  const w = textWidth(str, s);
  let x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  x0 = Math.round(x0);
  let d = "";
  [...str].forEach((ch, i) => {
    const g = G[ch] || G["?"];
    g.forEach((row, ry) => {
      // merge horizontal runs
      let run = -1;
      for (let rx = 0; rx <= 5; rx++) {
        const on = row[rx] === "#";
        if (on && run < 0) run = rx;
        if (!on && run >= 0) {
          d += rect(n(x0 + (i * 6 + run) * s), n(y + ry * s), n((rx - run) * s), s);
          run = -1;
        }
      }
    });
  });
  return `<path${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""} fill="${fill}" d="${d}"/>`;
}

/** Render a sprite (array of strings, one char per pixel) with a palette. */
export function sprite(rows, palette, x, y, s, { cls = "", style = "" } = {}) {
  const byColor = {};
  rows.forEach((row, ry) => {
    let run = -1, cur = null;
    for (let rx = 0; rx <= row.length; rx++) {
      const ch = rx < row.length ? row[rx] : ".";
      const c = palette[ch] ? ch : null;
      if (c !== cur) {
        if (cur) byColor[cur] = (byColor[cur] || "") + rect(n(x + run * s), n(y + ry * s), n((rx - run) * s), s);
        cur = c;
        run = rx;
      }
    }
  });
  const paths = Object.entries(byColor).map(([c, d]) => `<path fill="${palette[c]}" d="${d}"/>`).join("");
  return `<g${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${paths}</g>`;
}

/** Stepped (pixel) rounded box with a 1-pixel border. */
export function pxBox(x, y, w, h, s, fill, border) {
  return `<path fill="${border}" d="${rect(x + s, y, w - 2 * s, s)}${rect(x + s, y + h - s, w - 2 * s, s)}${rect(x, y + s, s, h - 2 * s)}${rect(x + w - s, y + s, s, h - 2 * s)}"/>` +
    `<path fill="${fill}" d="${rect(x + s, y + s, w - 2 * s, h - 2 * s)}"/>`;
}

// ---------- hand sprites (16x16) ----------
export const HAND_PAL = { K: "#0b0b0b", W: "#f5f5f5", S: "#b8b8b8" };
export const HANDS = {
  rock: [
    "................",
    "................",
    "................",
    "....KKKKKKKK....",
    "...KWWKWWKWWK...",
    "..KWWWKWWKWWWK..",
    "..KWWWKWWKWWWKK.",
    "..KWWWKWWKWWWKWK",
    "..KKKKKKKKKKKKWK",
    ".KWWWWWWWWWWWKWK",
    ".KWWWWWWWWWWWWSK",
    ".KWWWWWWWWWWWSK.",
    "..KWWWWWWWWWSSK.",
    "...KSWWWWWWSSK..",
    "....KKKKKKKKK...",
    "................",
  ],
  paper: [
    "......KK........",
    ".....KWWKKK.....",
    "...KKKWWKWWK....",
    "..KWWKWWKWWKKK..",
    "..KWWKWWKWWKWWK.",
    "..KWWKWWKWWKWWK.",
    "..KWWKWWKWWKWWK.",
    "..KWWKWWKWWKWWK.",
    "KK.KWWWWWWWWWWK.",
    "KWKKWWWWWWWWWWK.",
    "KWWKWWWWWWWWWSK.",
    ".KWWWWWWWWWWWSK.",
    "..KWWWWWWWWWSSK.",
    "...KSWWWWWWSSK..",
    "....KKKKKKKKK...",
    "................",
  ],
  scissors: [
    ".KK.........KK..",
    "KWWK.......KWWK.",
    "KWWK......KWWK..",
    ".KWWK.....KWWK..",
    ".KWWK....KWWK...",
    "..KWWK...KWWK...",
    "..KWWK..KWWK....",
    "...KWWKKWWK.....",
    "..KKKWWWWKKKK...",
    ".KWWKWWWWKWWWK..",
    ".KWWKKKKKKWWWK..",
    ".KWWWWWWWWWWSK..",
    "..KWWWWWWWWSSK..",
    "...KSWWWWWSSK...",
    "....KKKKKKKK....",
    "................",
  ],
};

// ---------- Kiyanagi Miko (24x30) ----------
// yellow wavy hair with ribbon buns, amber eyes, white shirt, magenta
// striped bow, pink plaid skirt
export const MIKO_PAL = {
  K: "#2b1a12", // outline
  Y: "#f4c51c", // hair
  y: "#c8930c", // hair shade
  h: "#fff28a", // hair shine
  R: "#ffd64a", // ribbon
  r: "#d9a414", // ribbon shade
  S: "#ffe4d2", // skin
  s: "#f2c2a6", // skin shade
  E: "#8a5a10", // eye
  e: "#e0a62a", // eye light
  w: "#ffffff", // eye shine / shirt
  m: "#c8566a", // mouth
  W: "#ffffff", // shirt
  g: "#d6d6e4", // shirt shade
  B: "#a8285e", // bow
  b: "#e0609a", // bow stripe
  P: "#f7a8c6", // skirt
  Q: "#e07aa8", // plaid
  L: "#3a2a28", // legs/shoes
};
export const MIKO = [
  "...KKK............KKK...",
  "..KRRRK..........KRRRK..",
  ".KRrRRRK........KRRRrRK.",
  ".KRRrRRKKKKKKKKKKRRrRRK.",
  "..KRRKKYYYhhYYYYYKKRRK..",
  "...KKYYYYhhYYYYYYYYKK...",
  "...KYYYYYYYYYYYYYYYYK...",
  "..KYYYYYYYYYYYYYYYYYYK..",
  "..KYYyYYYYYyYYYYYYyYYK..",
  "..KYyYYSyYYSSyYYSSyYYK..",
  ".KYYySSSSSSSSSSSSSSyYYK.",
  ".KYySKKKSSSSSSSSKKKSyYK.",
  ".KYySEEESSSSSSSSEEESyYK.",
  ".KYySEwESSSSSSSSEwESyYK.",
  ".KYySEeESSSSSSSSEeESyYK.",
  ".KYyySSSSSSSSSSSSSSSyYK.",
  ".KYyYsSSSSSmmSSSSSSsYyK.",
  "..KYYKsSSSSSSSSSSSsKYYK.",
  "..KYyYKKSSSSSSSSKKYyYK..",
  "...KYYKgKKSSSSKKgKYYK...",
  "....KKKWWWKBBKWWWKKK....",
  "......KWWBbBBbBWWK......",
  ".....KWWWKBBBBKWWWK.....",
  "....KSKWWWWKBBKWWWKSK...",
  "....KSKWWWWWBBWWWWKSK...",
  "....KKKgWWWWWWWWWgKKK...",
  ".....KPPQPPQPPQPPQPPK...",
  "....KQQQQQQQQQQQQQQQQK..",
  "....KPPQPPQPPQPPQPPQPK..",
  ".....KKKKKKKKKKKKKKKK...",
];
// expression overlays (same 24x30 grid; only the listed pixels are drawn)
export const MIKO_FX = {
  blink: [
    ...Array(11).fill(""),
    ".....SSSSSSSSSSSSSSSS...",
    ".....KKKSSSSSSSSKKKS....",
    ".....SSSSSSSSSSSSSSS....",
  ],
  // flustered: blush + wobbly mouth (she lost)
  fluster: [
    ...Array(15).fill(""),
    ".....bbb........bbb.....",
    "..........KmKm..........",
  ],
  // smug: happy closed eyes + grin (she won)
  smug: [
    ...Array(11).fill(""),
    ".....SSSSSSSSSSSSSSS....",
    ".....SKKKSSSSSSSSKKKS...",
    ".....KSSSKSSSSSSKSSSK...",
    ".....SSSSSSSSSSSSSSS....",
    "........................",
    "..........KmmmK.........",
  ],
  // pouty: flat mouth (draw)
  pout: [
    ...Array(16).fill(""),
    "...........KKK..........",
  ],
};
export const FX_PAL = { ...MIKO_PAL, b: "#ff8fb0" };

// ---------- retro computer bot (24x30) for the RPS game ----------
export const BOT_PAL = { K: "#2a2a2a", W: "#e6e6e6", w: "#bdbdbd", D: "#0e1a12", G: "#7ee08a", R: "#ff6b7a" };
export const BOT = [
  "........................",
  "...........KK...........",
  "...........KGK..........",
  "...........KK...........",
  "...........K............",
  "..KKKKKKKKKKKKKKKKKKKK..",
  "..KWWWWWWWWWWWWWWWWWWK..",
  "..KWKKKKKKKKKKKKKKKKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKDDDDDDDDDDDDDDKWK..",
  "..KWKKKKKKKKKKKKKKKKWK..",
  "..KWWWWWWWWWWWWWWWGwWK..",
  "..KwwwwwwwwwwwwwwwwwwK..",
  "..KKKKKKKKKKKKKKKKKKKK..",
  "..........KWWK..........",
  "..........KwwK..........",
  "........KKWWWWKK........",
  ".......KWWWWWWWWK.......",
  ".......KwwwwwwwwK.......",
  ".......KKKKKKKKKK.......",
  "........................",
];
// faces are 14x11, drawn inside the screen (offset col 5, row 8)
export const BOT_FACES = {
  neutral: ["", "", "..GG....GG...", "..GG....GG...", "..GG....GG...", "", "", "", "...GGGGGG....", "", ""],
  blink: ["", "", "", "", "..GG....GG...", "", "", "", "...GGGGGG....", "", ""],
  smug: ["", "", "..GG....GG...", ".G..G..G..G..", "", "", "..G......G...", "...GGGGGG....", "", "", ""],
  error: ["", ".R..R..R..R..", "..RR....RR...", ".R..R..R..R..", "", "", "", "..R.R.R.R.R..", "...R.R.R.R...", "", ""],
  flat: ["", "", "", ".GGG...GGG...", "", "", "", "", "..GGGGGGGG...", "", ""],
};
