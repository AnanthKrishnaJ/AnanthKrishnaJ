// Rock Paper Scissors in the profile README.
// A visitor opens an issue titled "rps|rock" (or paper / scissors) from the
// buttons in README.md. The "Rock Paper Scissors" workflow runs this script,
// which plays the bot's move, updates data/rps.json, redraws the animated
// board SVG and the "recent rounds" table in README.md, and writes the reply
// that the workflow posts on the issue.
//
//   node scripts/rps.mjs            -> redraw board/buttons/README from saved data
//   ISSUE_TITLE=... ISSUE_USER=... ISSUE_NUMBER=... BOT_MOVE=... node scripts/rps.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";
import { pxText, textWidth, sprite, pxBox, HANDS, HAND_PAL, BOT, BOT_PAL, BOT_FACES } from "./pixel.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data", "rps.json");
const ART = join(ROOT, "assets", "rps");
const README = join(ROOT, "README.md");
const REPLY = join(ROOT, ".rps-reply.md");
mkdirSync(dirname(DATA), { recursive: true });
mkdirSync(ART, { recursive: true });

const REPO = process.env.GITHUB_REPOSITORY || "AnanthKrishnaJ/AnanthKrishnaJ";
const MOVES = ["rock", "paper", "scissors"];
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
const EMOJI = { rock: "🪨", paper: "📄", scissors: "✂️" };

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const login = (s) => String(s || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 39);

// ---------- data ----------
const empty = { total: 0, playerWins: 0, botWins: 0, draws: 0, rounds: [], players: {} };
const data = existsSync(DATA) ? { ...empty, ...JSON.parse(readFileSync(DATA, "utf8")) } : empty;

let reply = null;
const title = process.env.ISSUE_TITLE;
if (title !== undefined) {
  const user = login(process.env.ISSUE_USER) || "someone";
  const number = Number(process.env.ISSUE_NUMBER) || 0;
  const move = String(title).trim().toLowerCase().split("|")[1]?.trim();

  if (!MOVES.includes(move)) {
    reply = `Hi @${user}! I couldn't read a move from \`${esc(String(title).slice(0, 40))}\`.\n\n` +
      `Use one of the buttons on [my profile](https://github.com/${REPO.split("/")[0]}) to play — the title should be \`rps|rock\`, \`rps|paper\` or \`rps|scissors\`.`;
  } else if (data.rounds.some((r) => r.n === number && number)) {
    reply = null; // already played (workflow re-run) — nothing to do
  } else {
    const bot = MOVES.includes(process.env.BOT_MOVE) ? process.env.BOT_MOVE : MOVES[randomInt(3)];
    const result = move === bot ? "draw" : BEATS[move] === bot ? "win" : "loss";
    data.total++;
    if (result === "win") data.playerWins++;
    else if (result === "loss") data.botWins++;
    else data.draws++;
    const p = (data.players[user] ||= { w: 0, l: 0, d: 0 });
    p[result === "win" ? "w" : result === "loss" ? "l" : "d"]++;
    data.rounds.unshift({ n: number, user, move, bot, result, at: new Date().toISOString() });
    data.rounds = data.rounds.slice(0, 10);

    const line = {
      win: `**You win!** ${EMOJI[move]} ${cap(move)} beats ${EMOJI[bot]} ${bot}. Nice one 🎉\n\n> \`ERROR: HUMAN WON. REBOOTING PRIDE.EXE…\` — bot`,
      loss: `**My bot wins!** ${EMOJI[bot]} ${cap(bot)} beats ${EMOJI[move]} ${move}.\n\n> \`GG. TOO EASY. BEEP BOOP.\` — bot`,
      draw: `**Draw!** You both threw ${EMOJI[move]} ${move}.\n\n> \`DRAW DETECTED. RETRY? [Y/N]\` — bot`,
    }[result];
    reply = `@${user} threw ${EMOJI[move]} **${move}** · my bot threw ${EMOJI[bot]} **${bot}**\n\n${line}\n\n` +
      `Your record: **${p.w}W · ${p.l}L · ${p.d}D** · All players: ${data.playerWins} – bot: ${data.botWins} (${data.draws} draws)\n\n` +
      `The board on [my profile](https://github.com/${REPO.split("/")[0]}) updates in a minute or so. Pick another move there for a rematch!`;
  }
}
writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");
if (reply) writeFileSync(REPLY, reply + "\n");

// ---------- pixel board ----------
const WHITE = "#f5f5f5", GREY = "#8a8a8a", DIM = "#3a3a3a", BG = "#0b0b0b";
const HP = { ...HAND_PAL, K: "#4a4a4a" };
const T = 5; // seconds per jan-ken-pon loop
const STEP = "animation-timing-function:steps(1,end)";

// seeded RNG so redraws don't create noisy diffs
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

function stars(W, H, count) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = Math.round(rnd() * (W - 20) / 5) * 5 + 10, y = Math.round(rnd() * (H - 90) / 5) * 5 + 10;
    const d = (1.5 + rnd() * 2.5).toFixed(1), dl = (-rnd() * 4).toFixed(1);
    const big = rnd() > 0.7;
    out += big
      ? `<path class="tw" style="animation-duration:${d}s;animation-delay:${dl}s" fill="${GREY}" d="M${x} ${y - 5}h3v5h5v3h-5v5h-3v-5h-5v-3h5z"/>`
      : `<rect class="tw" style="animation-duration:${d}s;animation-delay:${dl}s" x="${x}" y="${y}" width="3" height="3" fill="${DIM}"/>`;
  }
  return out;
}
function petals(W, H, count) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = Math.round(rnd() * W), d = (6 + rnd() * 6).toFixed(1), dl = (-rnd() * 12).toFixed(1);
    const c = rnd() > 0.5 ? "#f7a8c6" : "#d0d0d0";
    out += `<g transform="translate(${x} 0)"><path class="pf" style="animation-duration:${d}s;animation-delay:${dl}s;--h:${H + 20}px" fill="${c}" d="M0 0h4v4h-4zM4 4h4v4h-4z"/></g>`;
  }
  return out;
}
const flip = (inner, x, w) => `<g transform="translate(${x + w} 0) scale(-1 1)">${inner}</g>`;

function board() {
  const W = 850, H = 410;
  const last = data.rounds[0];
  const move = last ? last.move : "rock", bot = last ? last.bot : "rock";
  const res = last ? last.result : null;
  const user = last ? "@" + (last.user.length > 14 ? last.user.slice(0, 13) + "." : last.user) : "YOU?";
  const resultText = !last ? "YOUR TURN!" : res === "win" ? "YOU WIN!" : res === "loss" ? "BOT WINS!" : "DRAW!";
  const before = last ? "BEEP. READY TO LOSE?" : "BEEP. PICK A MOVE!";
  const after = !last ? "WAITING FOR HUMAN..." : res === "win" ? "ERROR: YOU WON?!" : res === "loss" ? "GG. TOO EASY. BEEP." : "DRAW. RETRY? Y/N";
  const fx = !last ? "neutral" : res === "win" ? "error" : res === "loss" ? "smug" : "flat";
  const tot = Math.max(1, data.total);
  const pw = Math.round((data.playerWins / tot) * 290), bw = Math.round((data.botWins / tot) * 290);

  // bot window
  const wx = 572, wy = 118, ww = 250, wh = 226;
  const mx = wx + (ww - 144) / 2, my = wy + 34;
  const bubbleX = 438, bubbleY = 66, bubbleW = 396, bubbleH = 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .tw{animation:tw 2s steps(1,end) infinite}
    @keyframes tw{0%{opacity:1}50%{opacity:.15}}
    .pf{animation:pf linear infinite;animation-timing-function:steps(24,end)}
    @keyframes pf{from{transform:translate(0,-10px)}to{transform:translate(-60px,var(--h))}}
    .shake{animation:shake ${T}s infinite;${STEP}}
    @keyframes shake{0%{transform:translateY(0)}4%{transform:translateY(-16px)}10%{transform:translateY(0)}14%{transform:translateY(-16px)}20%{transform:translateY(0)}24%{transform:translateY(-16px)}30%,100%{transform:translateY(0)}}
    .pre{animation:pre ${T}s infinite;${STEP}}
    @keyframes pre{0%{opacity:1}30%,100%{opacity:0}}
    .post{animation:post ${T}s infinite;${STEP}}
    @keyframes post{0%{opacity:0}30%,100%{opacity:1}}
    .jan{animation:jan ${T}s infinite;${STEP}}@keyframes jan{0%{opacity:1}10%,100%{opacity:0}}
    .ken{animation:ken ${T}s infinite;${STEP}}@keyframes ken{0%{opacity:0}10%{opacity:1}20%,100%{opacity:0}}
    .pon{animation:pon ${T}s infinite;${STEP}}@keyframes pon{0%{opacity:0}20%{opacity:1}30%,100%{opacity:0}}
    .res{animation:res ${T}s infinite;${STEP}}
    @keyframes res{0%{opacity:0}30%{opacity:1}34%{opacity:0}38%{opacity:1}42%{opacity:0}46%,100%{opacity:1}}
    .bob{animation:bob 1s infinite;${STEP}}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    .blink{animation:blink ${T}s infinite;${STEP}}@keyframes blink{0%{opacity:0}12%{opacity:1}15%,100%{opacity:0}}
    .eyes{animation:eyes ${T}s infinite;${STEP}}@keyframes eyes{0%{opacity:1}12%{opacity:0}15%,100%{opacity:1}}
    .scanl{animation:scanl 1.5s steps(11,end) infinite}@keyframes scanl{from{transform:translateY(0)}to{transform:translateY(66px)}}
    .react{animation:${res === "loss" ? "hop" : res === "win" ? "jitter" : "none"} ${T}s infinite;${STEP}}
    @keyframes hop{0%{transform:translateY(0)}30%{transform:translateY(-15px)}34%{transform:translateY(0)}38%{transform:translateY(-15px)}42%,100%{transform:translateY(0)}}
    @keyframes jitter{0%{transform:translateX(0)}30%{transform:translateX(-5px)}33%{transform:translateX(5px)}36%{transform:translateX(-5px)}39%{transform:translateX(5px)}42%,100%{transform:translateX(0)}}
    .vs{animation:vs .8s infinite;${STEP}}@keyframes vs{0%{opacity:1}50%{opacity:.35}}
    .grow{animation:grow 1.2s steps(10,end) both}@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
    .on{animation:vs 1.2s infinite;${STEP}}
  </style>
  <defs>
    <clipPath id="cl"><rect x="5" y="5" width="${W - 10}" height="${H - 10}"/></clipPath>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#191919"/></pattern>
  </defs>
  ${pxBox(0, 0, W, H, 5, BG, WHITE)}
  <g clip-path="url(#cl)">
    <rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="url(#dots)"/>
    ${stars(W, H, 34)}
    ${petals(W, H, 12)}
  </g>

  ${pxText("ROCK PAPER SCISSORS", 30, 26, 3, WHITE)}
  ${pxText("VS ANANTH'S BOT", 30, 56, 2, GREY)}
  ${pxText(`ROUND ${String(data.total).padStart(3, "0")}`, W - 30, 26, 3, WHITE, { anchor: "end" })}
  <rect class="on" x="${W - 30 - textWidth(`ROUND ${String(data.total).padStart(3, "0")}`, 3) - 18}" y="30" width="9" height="9" fill="#7ee08a"/>

  <!-- player -->
  ${pxText("P1", 151, 112, 2, GREY, { anchor: "middle" })}
  <rect x="103" y="262" width="96" height="5" fill="${DIM}"/>
  <g class="shake">
    <g class="pre">${sprite(HANDS.rock, HP, 95, 140, 7)}</g>
    <g class="post">${sprite(HANDS[move], HP, 95, 140, 7)}</g>
  </g>
  ${pxText(user, 151, 282, 2, WHITE, { anchor: "middle" })}

  <!-- center -->
  <g class="jan">${pxText("JAN...", 375, 168, 4, WHITE, { anchor: "middle" })}</g>
  <g class="ken">${pxText("KEN...", 375, 168, 4, WHITE, { anchor: "middle" })}</g>
  <g class="pon">${pxText("PON!", 375, 168, 4, WHITE, { anchor: "middle" })}</g>
  <g class="res">${pxText(resultText, 375, 168, 4, WHITE, { anchor: "middle" })}</g>
  <g class="vs">${pxText("VS", 375, 220, 6, GREY, { anchor: "middle" })}</g>

  <!-- speech bubble -->
  ${pxBox(bubbleX, bubbleY, bubbleW, bubbleH, 3, WHITE, WHITE)}
  <path fill="${WHITE}" d="M${wx + 150} ${bubbleY + bubbleH}h15v5h-5v5h-5v-5h-5z"/>
  <g class="pre">${pxText(before, bubbleX + bubbleW / 2, bubbleY + 11, 2, BG, { anchor: "middle" })}</g>
  <g class="post">${pxText(after, bubbleX + bubbleW / 2, bubbleY + 11, 2, BG, { anchor: "middle" })}</g>

  <!-- BOT.EXE window -->
  ${pxBox(wx, wy, ww, wh, 5, "#141014", WHITE)}
  <rect x="${wx + 5}" y="${wy + 5}" width="${ww - 10}" height="22" fill="${WHITE}"/>
  ${pxText("BOT.EXE", wx + 14, wy + 11, 2, BG)}
  ${pxText("_ X", wx + ww - 14, wy + 11, 2, BG, { anchor: "end" })}
  <g class="react"><g class="bob">
    ${sprite(BOT, BOT_PAL, mx, my, 6)}
    <g class="pre"><g class="eyes">${sprite(BOT_FACES.neutral, BOT_PAL, mx + 30, my + 48, 6)}</g>
      <g class="blink">${sprite(BOT_FACES.blink, BOT_PAL, mx + 30, my + 48, 6)}</g></g>
    <g class="post">${sprite(BOT_FACES[fx], BOT_PAL, mx + 30, my + 48, 6)}</g>
    <rect class="scanl" x="${mx + 30}" y="${my + 48}" width="84" height="6" fill="#7ee08a" opacity=".12"/>
  </g></g>
  <g class="shake">
    <g class="pre">${flip(sprite(HANDS.rock, HP, 0, 214, 5), 486, 80)}</g>
    <g class="post">${flip(sprite(HANDS[bot], HP, 0, 214, 5), 486, 80)}</g>
  </g>

  <!-- score bars -->
  ${pxText(`YOU ${data.playerWins}`, 30, 362, 2, WHITE)}
  ${pxText(`BOT ${data.botWins}`, W - 30, 362, 2, WHITE, { anchor: "end" })}
  ${pxText(`GAMES ${data.total}  DRAWS ${data.draws}`, W / 2, 362, 2, GREY, { anchor: "middle" })}
  ${pxBox(30, 378, 300, 16, 3, "#1c1c1c", GREY)}
  ${pxBox(W - 330, 378, 300, 16, 3, "#1c1c1c", GREY)}
  <g transform="translate(35 383)"><rect class="grow" width="${pw}" height="6" fill="${WHITE}"/></g>
  <g transform="translate(${W - 35} 383) scale(-1 1)"><rect class="grow" width="${bw}" height="6" fill="#f7a8c6"/></g>
</svg>`;
}

function button(m) {
  const W = 260, H = 84, i = MOVES.indexOf(m);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <style>
    .hi{animation:hi 1.8s infinite;animation-timing-function:steps(1,end);animation-delay:${i * 0.6}s}
    @keyframes hi{0%{opacity:0}60%{opacity:1}}
    .bob{animation:bob .9s infinite;animation-timing-function:steps(1,end);animation-delay:${i * 0.3}s}
    @keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .ar{animation:ar .6s infinite;animation-timing-function:steps(1,end)}@keyframes ar{0%{opacity:1}50%{opacity:0}}
  </style>
  ${pxBox(0, 0, W, H, 4, BG, "#4a4a4a")}
  <g class="hi">${pxBox(0, 0, W, H, 4, "none", WHITE).replace(/<path fill="none"[^>]*\/>/, "")}</g>
  <g class="bob">${sprite(HANDS[m], HP, 16, 18, 3)}</g>
  ${pxText(m, 82, 22, 3, WHITE)}
  <g class="ar">${pxText(">", 82, 52, 2, "#f7a8c6")}</g>
  ${pxText("THROW IT", 98, 52, 2, GREY)}
</svg>`;
}

writeFileSync(join(ART, "board.svg"), board().trim() + "\n");
for (const m of MOVES) writeFileSync(join(ART, `btn-${m}.svg`), button(m).trim() + "\n");

// ---------- README section ----------
function section() {
  const recent = data.rounds.slice(0, 5);
  const res = { win: "🏆 player", loss: "🤖 bot", draw: "🤝 draw" };
  let md = "";
  if (recent.length) {
    md += "| Round | Player | Threw | Bot threw | Winner |\n|:-:|:--|:-:|:-:|:-:|\n";
    for (const r of recent)
      md += `| ${r.n ? `[#${r.n}](https://github.com/${REPO}/issues/${r.n})` : "–"} | [@${r.user}](https://github.com/${r.user}) | ${EMOJI[r.move]} ${r.move} | ${EMOJI[r.bot]} ${r.bot} | ${res[r.result]} |\n`;
    const top = Object.entries(data.players)
      .sort((a, b) => b[1].w - a[1].w || a[1].l - b[1].l)
      .slice(0, 5)
      .filter(([, s]) => s.w > 0);
    if (top.length) {
      md += "\n**Top players:** " + top.map(([u, s], i) => `${["🥇", "🥈", "🥉", "④", "⑤"][i]} [@${u}](https://github.com/${u}) (${s.w} win${s.w === 1 ? "" : "s"})`).join(" · ") + "\n";
    }
  } else {
    md += "_No rounds yet — be the first to beat my bot!_\n";
  }
  return md;
}
if (existsSync(README)) {
  const src = readFileSync(README, "utf8");
  const re = /(<!-- RPS:START -->)[\s\S]*?(<!-- RPS:END -->)/;
  if (re.test(src)) writeFileSync(README, src.replace(re, `$1\n${section()}$2`));
}
