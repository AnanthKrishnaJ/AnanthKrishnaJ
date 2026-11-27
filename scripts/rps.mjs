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
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Fira Code', 'JetBrains Mono', Consolas, 'DejaVu Sans Mono', monospace";

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
      win: `**You win!** ${EMOJI[move]} ${cap(move)} beats ${EMOJI[bot]} ${bot}. Nice one 🎉`,
      loss: `**I win!** ${EMOJI[bot]} ${cap(bot)} beats ${EMOJI[move]} ${move}. Better luck next round 😼`,
      draw: `**Draw!** We both threw ${EMOJI[move]} ${move}. Great minds…`,
    }[result];
    reply = `@${user} threw ${EMOJI[move]} **${move}**, my bot threw ${EMOJI[bot]} **${bot}**.\n\n${line}\n\n` +
      `Your record: **${p.w}W · ${p.l}L · ${p.d}D** · Global: players ${data.playerWins} – bot ${data.botWins} (${data.draws} draws)\n\n` +
      `The board on [my profile](https://github.com/${REPO.split("/")[0]}) updates in a minute or so. Want another round? Pick a move there again!`;
  }
}
writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");
if (reply) writeFileSync(REPLY, reply + "\n");

// ---------- hand icons (drawn, so they look the same everywhere) ----------
const ICON = {
  rock: `<path d="M-20 7 L-16 -10 L-3 -20 L12 -16 L21 -3 L17 14 L1 21 L-14 17 Z" fill="#f2f2f2" stroke="#0b0b0b" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-8 -6 L0 -2 L3 7 M6 -11 L10 -4" fill="none" stroke="#0b0b0b" stroke-width="2" stroke-linecap="round"/>`,
  paper: `<g transform="rotate(-8)"><path d="M-15 -20 H8 L16 -12 V20 H-15 Z" fill="#f2f2f2" stroke="#0b0b0b" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M8 -20 V-12 H16" fill="none" stroke="#0b0b0b" stroke-width="2"/>
    <path d="M-9 -8 H9 M-9 0 H9 M-9 8 H4" stroke="#0b0b0b" stroke-width="2" stroke-linecap="round"/></g>`,
  scissors: `<g fill="none" stroke="#f2f2f2" stroke-width="3.5" stroke-linecap="round">
    <path d="M-5 8 L12 -21 M5 8 L-12 -21"/><circle cx="-9" cy="14" r="7"/><circle cx="9" cy="14" r="7"/></g>
    <circle r="2.2" cx="0" cy="-1" fill="#0b0b0b" stroke="#f2f2f2" stroke-width="1.5"/>`,
};
const iconOnDisc = (m, scale = 1) =>
  `<g transform="scale(${scale})"><circle r="34" fill="#0b0b0b" stroke="#f2f2f2" stroke-width="2"/>${ICON[m]}</g>`;

// ---------- board ----------
function board() {
  const W = 850, H = 300;
  const last = data.rounds[0];
  const banner = !last
    ? "No rounds yet — be the first to play!"
    : last.result === "win" ? `@${last.user} wins this round!`
    : last.result === "loss" ? `Ananth's bot wins this round!` : "It's a draw!";
  const left = last ? last.move : "rock";
  const right = last ? last.bot : "rock";
  const who = last ? `@${last.user}` : "you";
  const pct = (n) => (data.total ? Math.round((n / data.total) * 100) : 0);
  const stat = (x, value, label) => `<g transform="translate(${x} 248)">
      <text class="mono" x="0" y="0" text-anchor="middle" font-size="22" font-weight="700" fill="#f5f5f5">${value}</text>
      <text x="0" y="20" text-anchor="middle" font-size="11" letter-spacing="2" fill="#8a8a8a">${label}</text></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${SANS}">
  <style>
    .mono{font-family:${MONO}}
    .shakeL{animation:shake 2.4s ease-in-out infinite}
    .shakeR{animation:shake 2.4s ease-in-out infinite;animation-delay:.05s}
    @keyframes shake{0%,8%{transform:translateY(0)}12%{transform:translateY(-16px)}18%{transform:translateY(0)}24%{transform:translateY(-16px)}30%{transform:translateY(0)}36%{transform:translateY(-16px)}42%,100%{transform:translateY(0)}}
    .pop{transform-box:fill-box;transform-origin:center;animation:pop 2.4s ease-out infinite}
    @keyframes pop{0%,40%{transform:scale(1)}48%{transform:scale(1.18)}56%,100%{transform:scale(1)}}
    .vs{animation:vs 2.4s ease-in-out infinite}
    @keyframes vs{0%,40%{opacity:.35}50%,100%{opacity:1}}
    .msg{animation:msg 2.4s ease-out infinite}
    @keyframes msg{0%,42%{opacity:0;transform:translateY(6px)}55%,100%{opacity:1;transform:translateY(0)}}
    .scan{animation:scan 6s linear infinite}
    @keyframes scan{from{transform:translateX(-200px)}to{transform:translateX(${W + 200}px)}}
  </style>
  <defs>
    <clipPath id="cl"><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12"/></clipPath>
    <linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#242424"/></pattern>
  </defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0b0b0b" stroke="#333"/>
  <g clip-path="url(#cl)">
    <rect width="${W}" height="${H}" fill="url(#dots)"/>
    <g transform="skewX(-20)"><rect class="scan" width="160" height="${H}" fill="url(#sh)"/></g>
  </g>

  <text x="28" y="40" font-size="13" letter-spacing="4" fill="#8a8a8a">MINI GAME</text>
  <text x="28" y="66" font-size="24" font-weight="800" fill="#ffffff">ROCK · PAPER · SCISSORS</text>
  <text x="${W - 28}" y="40" text-anchor="end" font-size="13" letter-spacing="2" fill="#8a8a8a">ROUND</text>
  <text class="mono" x="${W - 28}" y="66" text-anchor="end" font-size="24" font-weight="700" fill="#ffffff">#${data.total}</text>

  <g transform="translate(${W / 2 - 200} 140)">
    <g class="shakeL"><g class="pop">${iconOnDisc(left, 1.15)}</g></g>
    <text x="0" y="62" text-anchor="middle" font-size="14" fill="#d6d6d6">${esc(who)}</text>
  </g>
  <text class="vs mono" x="${W / 2}" y="150" text-anchor="middle" font-size="30" font-weight="800" fill="#ffffff">VS</text>
  <g transform="translate(${W / 2 + 200} 140)">
    <g class="shakeR"><g class="pop">${iconOnDisc(right, 1.15)}</g></g>
    <text x="0" y="62" text-anchor="middle" font-size="14" fill="#d6d6d6">Ananth's bot</text>
  </g>
  <g class="msg"><text x="${W / 2}" y="104" text-anchor="middle" font-size="15" font-weight="600" fill="#f5f5f5">${esc(banner)}</text></g>

  <rect x="28" y="222" width="${W - 56}" height="1" fill="#333"/>
  ${stat(W * 0.2, data.total, "GAMES")}
  ${stat(W * 0.4, `${data.playerWins}`, `PLAYER WINS · ${pct(data.playerWins)}%`)}
  ${stat(W * 0.6, `${data.botWins}`, `BOT WINS · ${pct(data.botWins)}%`)}
  ${stat(W * 0.8, data.draws, "DRAWS")}
</svg>`;
}

function button(m) {
  const W = 260, H = 70;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${SANS}">
  <style>
    .glow{animation:glow 3s ease-in-out infinite;animation-delay:${MOVES.indexOf(m) * 0.4}s}
    @keyframes glow{0%,100%{stroke-opacity:.35}50%{stroke-opacity:1}}
    .bob{animation:bob 3s ease-in-out infinite;animation-delay:${MOVES.indexOf(m) * 0.4}s}
    @keyframes bob{0%,100%{transform:translate(38px,35px) rotate(-6deg)}50%{transform:translate(38px,33px) rotate(6deg)}}
  </style>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="35" fill="#0b0b0b" stroke="#333" stroke-width="1.5"/>
  <rect class="glow" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="35" fill="none" stroke="#fff" stroke-width="1.5"/>
  <g class="bob">${iconOnDisc(m, 0.72)}</g>
  <text x="76" y="33" font-size="20" font-weight="800" letter-spacing="2" fill="#ffffff">${m.toUpperCase()}</text>
  <text x="76" y="52" font-size="12" fill="#8a8a8a">click to throw ${m}</text>
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
