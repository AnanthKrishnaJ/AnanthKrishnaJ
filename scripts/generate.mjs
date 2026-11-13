// Generates every animated black-and-white SVG used by the profile README.
// Static art (hero, typing line, project cards, footer) is always rebuilt.
// Stats + languages cards are rebuilt only when GitHub data can be fetched
// (GITHUB_TOKEN / GH_STATS_TOKEN in Actions); otherwise the old ones are kept.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");
mkdirSync(join(OUT, "cards"), { recursive: true });

const LOGIN = process.env.PROFILE_LOGIN || "AnanthKrishnaJ";
const TOKEN = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN || "";

// Radical-style palette (pink title, yellow icons, cyan text)
const C = {
  bg: "#0b0b0b",
  bg2: "#171717",
  border: "#333333",
  pink: "#ffffff",
  yellow: "#bdbdbd",
  cyan: "#d6d6d6",
  white: "#f5f5f5",
  muted: "#8a8a8a",
};
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Fira Code', 'JetBrains Mono', Consolas, 'DejaVu Sans Mono', monospace";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const write = (name, svg) => writeFileSync(join(OUT, name), svg.trim() + "\n");

// tiny seeded RNG so the art is identical on every run (no noisy commits)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const r = (a, b) => a + rnd() * (b - a);
const f = (n) => Math.round(n * 10) / 10;

const PETAL = "M0 -7 C4 -11 9 -6 7 0 C5 6 1 9 0 10 C-1 9 -5 6 -7 0 C-9 -6 -4 -11 0 -7 Z";

function petals(count, width, height, opts = {}) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = f(r(0, width));
    const s = f(r(0.55, 1.25));
    const dur = f(r(opts.min ?? 7, opts.max ?? 13));
    const delay = f(-r(0, dur));
    const sway = f(r(2.5, 4.5));
    const fill = rnd() > 0.35 ? "url(#petal)" : "#e6e6e6";
    out += `<g transform="translate(${x} 0)"><g class="sway" style="animation-duration:${sway}s;animation-delay:${f(-r(0, sway))}s">` +
      `<path class="fall" d="${PETAL}" fill="${fill}" style="animation-duration:${dur}s;animation-delay:${delay}s;--h:${height + 40}px;--s:${s}"/></g></g>`;
  }
  return out;
}
const PETAL_CSS = `
  .sway{animation:sway ease-in-out infinite alternate}
  .fall{transform-box:fill-box;transform-origin:center;animation:fall linear infinite;opacity:.9}
  @keyframes sway{from{transform:translateX(-18px)}to{transform:translateX(18px)}}
  @keyframes fall{0%{transform:translateY(-30px) rotate(0deg) scale(var(--s))}100%{transform:translateY(var(--h)) rotate(540deg) scale(var(--s))}}`;
const PETAL_DEF = `<radialGradient id="petal" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dcdcdc"/><stop offset="1" stop-color="#a8a8a8"/></radialGradient>`;

/* ------------------------------------------------------------------ hero */
function hero() {
  const W = 1200, H = 340;
  let stars = "";
  for (let i = 0; i < 70; i++) {
    stars += `<circle cx="${f(r(0, W))}" cy="${f(r(0, 220))}" r="${f(r(0.6, 1.9))}" fill="#fff" class="tw" style="animation-delay:${f(-r(0, 4))}s;animation-duration:${f(r(2, 4.5))}s"/>`;
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ananth Krishna J">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000000"/><stop offset=".55" stop-color="#121212"/><stop offset="1" stop-color="#262626"/>
    </linearGradient>
    <radialGradient id="moon" cx="40%" cy="38%" r="65%">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e2e2e2"/><stop offset="1" stop-color="#a0a0a0"/>
    </radialGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="#ffffff" stop-opacity=".28"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <linearGradient id="name" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="700" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="${C.pink}"/><stop offset=".5" stop-color="#7a7a7a"/><stop offset="1" stop-color="${C.cyan}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;700 0" dur="5s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="slash" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
    <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
    ${PETAL_DEF}
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <style>
    .tw{animation:tw ease-in-out infinite alternate}
    @keyframes tw{from{opacity:.15}to{opacity:1}}
    .moon{animation:pulse 6s ease-in-out infinite;transform-origin:975px 115px}
    @keyframes pulse{50%{transform:scale(1.04)}}
    .cloud{animation:drift linear infinite}
    @keyframes drift{from{transform:translateX(-260px)}to{transform:translateX(1260px)}}
    .rise{opacity:0;animation:rise .9s cubic-bezier(.2,.8,.2,1) forwards}
    @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .slash{stroke-dasharray:760;stroke-dashoffset:760;animation:slash 4.5s ease-in-out infinite}
    @keyframes slash{0%{stroke-dashoffset:760}35%{stroke-dashoffset:0}60%,100%{stroke-dashoffset:-760}}
    .g1,.g2{opacity:0;animation:glitch 7s steps(1) infinite}
    .g2{animation-delay:.08s}
    @keyframes glitch{0%,90%,100%{opacity:0;transform:none}91%{opacity:.8;transform:translate(-5px,2px)}93%{opacity:.8;transform:translate(4px,-2px)}95%{opacity:0}}
    .lantern{animation:bob 3.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:top}
    @keyframes bob{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
    ${PETAL_CSS}
  </style>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <circle cx="975" cy="115" r="150" fill="url(#halo)"/>
    <g class="moon"><circle cx="975" cy="115" r="66" fill="url(#moon)"/>
      <circle cx="950" cy="100" r="9" fill="#9e9e9e" opacity=".45"/><circle cx="995" cy="138" r="6" fill="#9e9e9e" opacity=".4"/><circle cx="1000" cy="92" r="4" fill="#9e9e9e" opacity=".35"/></g>
    <g fill="#ffffff" opacity=".07" filter="url(#soft)">
      <ellipse class="cloud" style="animation-duration:70s;animation-delay:-20s" cx="0" cy="70" rx="120" ry="16"/>
      <ellipse class="cloud" style="animation-duration:95s;animation-delay:-60s" cx="0" cy="150" rx="170" ry="20"/>
    </g>
    <!-- mountains -->
    <path d="M0 290 L140 220 L230 255 L360 180 L470 245 L560 215 L700 270 L820 205 L930 160 L1040 225 L1120 200 L1200 240 L1200 340 L0 340Z" fill="#1b1b1b" opacity=".9"/>
    <path d="M930 160 L905 178 L918 176 L930 186 L942 175 L955 178Z" fill="#e8e8e8" opacity=".55"/>
    <path d="M0 315 L120 285 L260 300 L400 270 L560 296 L720 276 L880 300 L1040 270 L1200 292 L1200 340 L0 340Z" fill="#0d0d0d"/>
    <!-- torii gate -->
    <g transform="translate(1065 228)" fill="#e6e6e6">
      <rect x="-56" y="0" width="112" height="9" rx="3"/><rect x="-48" y="15" width="96" height="6"/>
      <rect x="-38" y="6" width="8" height="70"/><rect x="30" y="6" width="8" height="70"/><rect x="-3" y="9" width="6" height="12"/>
    </g>
    <!-- lantern -->
    <g transform="translate(1160 0)"><line x1="0" y1="0" x2="0" y2="42" stroke="#555555" stroke-width="2"/>
      <g class="lantern"><rect x="-13" y="42" width="26" height="34" rx="11" fill="#f2f2f2" filter="url(#glow)"/><rect x="-7" y="38" width="14" height="5" fill="#2a2a2a"/><rect x="-7" y="75" width="14" height="5" fill="#2a2a2a"/></g></g>
    <!-- text -->
    <text x="74" y="92" font-family="${SANS}" font-size="20" letter-spacing="6" fill="${C.pink}" class="rise" style="animation-delay:.1s">アナント・クリシュナ</text>
    <g font-family="${SANS}" font-weight="800" font-size="66" letter-spacing="5">
      <text class="g1" x="70" y="164" fill="${C.cyan}">ANANTH KRISHNA J</text>
      <text class="g2" x="70" y="164" fill="${C.pink}">ANANTH KRISHNA J</text>
      <text x="70" y="164" fill="url(#name)" filter="url(#glow)" class="rise" style="animation-delay:.25s">ANANTH KRISHNA J</text>
    </g>
    <path class="slash" d="M64 186 L820 176" stroke="url(#slash)" stroke-width="3" stroke-linecap="round" fill="none"/>
    <text x="74" y="224" font-family="${SANS}" font-size="21" fill="${C.white}" opacity=".9" class="rise" style="animation-delay:.6s">AI student <tspan fill="${C.pink}">✦</tspan> web builder <tspan fill="${C.pink}">✦</tspan> game maker <tspan fill="${C.pink}">✦</tspan> anime enjoyer</text>
    ${petals(26, W, H)}
  </g>
</svg>`;
}

/* ---------------------------------------------------------------- typing */
function typing() {
  const lines = [
    "Artificial Intelligence student @ KTU",
    "I build anime-flavoured web apps & games",
    "Currently forging ECLIPSE: The Last Kingdom",
    "Single-file HTML tools are my love language",
    "Fuelled by anime, playlists & late-night commits",
  ];
  const W = 900, H = 56, FS = 22, CW = FS * 0.6, SLOT = 4.2;
  const T = SLOT * lines.length;
  let css = "", body = "";
  lines.forEach((ln, i) => {
    const w = Math.ceil(ln.length * CW) + 4;
    const x = Math.round((W - w) / 2);
    const p = (s) => f(((i * SLOT + s) / T) * 100) + "%";
    const start = p(0), typed = p(1.9), hold = p(3.3), erased = p(3.9);
    const steps = ln.length;
    css += `
    #c${i}{transform-box:fill-box;transform-origin:left;transform:scaleX(0);animation:t${i} ${T}s infinite}
    @keyframes t${i}{0%{transform:scaleX(0)}${start}{transform:scaleX(0);animation-timing-function:steps(${steps})}${typed}{transform:scaleX(1)}${hold}{transform:scaleX(1);animation-timing-function:steps(${steps})}${erased}{transform:scaleX(0)}100%{transform:scaleX(0)}}
    #k${i}{opacity:0;animation:k${i} ${T}s infinite}
    @keyframes k${i}{0%${i ? `,${p(-0.01)}` : ""}{transform:translateX(0);opacity:0}${start}{transform:translateX(0);opacity:1;animation-timing-function:steps(${steps})}${typed}{transform:translateX(${w}px);opacity:1}${hold}{transform:translateX(${w}px);opacity:1;animation-timing-function:steps(${steps})}${erased}{transform:translateX(0);opacity:1}${p(4.05)}{transform:translateX(0);opacity:0}100%{transform:translateX(0);opacity:0}}`;
    body += `<clipPath id="cp${i}"><rect id="c${i}" x="${x}" y="0" width="${w}" height="${H}"/></clipPath>
    <text x="${x}" y="36" clip-path="url(#cp${i})" font-family="${MONO}" font-size="${FS}" font-weight="600" fill="${i % 2 ? C.cyan : C.pink}">${esc(ln)}</text>
    <g id="k${i}"><rect class="caret" x="${x + 2}" y="14" width="3" height="28" fill="${C.yellow}"/></g>`;
  });
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(lines.join(" | "))}">
  <style>${css}
    .caret{animation:blink .8s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
  </style>
  ${body}
</svg>`;
}

/* ----------------------------------------------------------------- stack */
const STACK = ["HTML", "CSS", "JavaScript", "Python", "Git", "GitHub", "Vercel", "Godot", "VS Code"];
function stack() {
  const FS = 14, CW = FS * 0.6, PAD = 16, GAP = 10, H = 52;
  const widths = STACK.map((s) => f(s.length * CW + PAD * 2));
  const W = Math.ceil(widths.reduce((a, b) => a + b, 0) + GAP * (STACK.length - 1) + 4);
  let x = 2;
  const chips = STACK.map((s, i) => {
    const w = widths[i];
    const g = `<g class="in" style="animation-delay:${f(0.08 * i)}s"><rect x="${f(x)}" y="8" width="${w}" height="36" rx="18" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
      <rect class="pulse" style="animation-delay:${f(1 + i * 0.35)}s" x="${f(x)}" y="8" width="${w}" height="36" rx="18" fill="none" stroke="${C.white}" stroke-width="1.5"/>
      <text x="${f(x + w / 2)}" y="31" text-anchor="middle" font-family="${MONO}" font-size="${FS}" font-weight="600" fill="${C.cyan}">${esc(s)}</text></g>`;
    x += w + GAP;
    return g;
  }).join("");
  const cyc = f(1 + STACK.length * 0.35);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tools: ${STACK.join(", ")}">
  <defs><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="cl"><rect width="${W}" height="${H}"/></clipPath></defs>
  <style>
    .in{opacity:0;animation:in .6s ease-out forwards}
    @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .pulse{opacity:0;animation:pulse ${cyc}s ease-in-out infinite}
    @keyframes pulse{0%{opacity:0}5%{opacity:1}14%,100%{opacity:0}}
    .sweep{animation:sweep 4s 1s ease-in-out infinite;transform:translateX(-160px)}
    @keyframes sweep{0%{transform:translateX(-160px)}50%,100%{transform:translateX(${W + 40}px)}}
  </style>
  ${chips}
  <g clip-path="url(#cl)"><rect class="sweep" x="0" y="0" width="120" height="${H}" fill="url(#sh)"/></g>
</svg>`;
}

/* ---------------------------------------------------------- project cards */
const PROJECTS = [
  { slug: "eclipse", repo: "eclipse-the-last-kingdom", name: "ECLIPSE: The Last Kingdom", icon: "✶", tag: "Game", desc: "Anime-style 2D action RPG with an evolving skill system, playable right in the browser." },
  { slug: "zxvi", repo: "zxvi-oneai-toolkit", name: "ZXVI OneAI Toolkit", icon: "✦", tag: "Toolkit", desc: "One self-contained HTML file packed with offline tools, hosted by the ZXVI mascot." },
  { slug: "wtalk", repo: "WTalk", name: "WTalk", icon: "❝", tag: "Web app", desc: "Global real-time chat with built-in anti-NSFW and anti-abuse protection." },
  { slug: "anime-shelf", repo: "anime-shelf", name: "Anime Shelf", icon: "✿", tag: "Anime", desc: "My AniList watch list reimagined as an animated black-and-white storefront." },
  { slug: "airi", repo: "Airi", name: "Airi", icon: "✎", tag: "Study", desc: "MCQ and aptitude exam practice app with a clean, focused quiz flow." },
  { slug: "anime-guess", repo: "Anime-Guessing-Game", name: "Anime Guessing Game", icon: "?", tag: "Game", desc: "How well do you know your anime? A quick guessing game in a single page." },
  { slug: "pyq", repo: "s7-ai-pyq-bank", name: "S7 AI PYQ Bank", icon: "§", tag: "Study", desc: "KTU semester 7 previous-year questions, sorted by module, with answers." },
  { slug: "rps", repo: "RPS", name: "Rock Paper Scissors", icon: "✕", tag: "Game", desc: "The classic hand game, rebuilt as a snappy browser game." },
];

function wrap(text, max) {
  const words = text.split(" "), out = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += " " + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function card(p, i) {
  const W = 420, H = 150;
  const lines = wrap(p.desc, 50).slice(0, 3);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(p.name)}: ${esc(p.desc)}">
  <defs>
    <linearGradient id="b" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
      <stop offset="0" stop-color="${C.pink}"/><stop offset=".5" stop-color="${C.border}"/><stop offset="1" stop-color="${C.cyan}"/>
      <animateTransform attributeName="gradientTransform" type="rotate" values="0 ${W / 2} ${H / 2};360 ${W / 2} ${H / 2}" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="cl"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="12"/></clipPath>
    ${PETAL_DEF}
  </defs>
  <style>
    .in{opacity:0;animation:in .7s ease-out forwards}
    @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .shine{animation:shine 5s ease-in-out infinite;animation-delay:${f(i * 0.6)}s}
    @keyframes shine{0%{transform:translateX(-200px)}40%,100%{transform:translateX(${W + 100}px)}}
    .ico{transform-box:fill-box;transform-origin:center;animation:bob 2.6s ease-in-out infinite alternate}
    @keyframes bob{from{transform:translateY(-2px) rotate(-6deg)}to{transform:translateY(2px) rotate(6deg)}}
    ${PETAL_CSS}
  </style>
  <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="12" fill="${C.bg}" stroke="url(#b)" stroke-width="2"/>
  <g clip-path="url(#cl)">
    <g opacity=".85">${petals(4, W, H, { min: 6, max: 10 })}</g>
    <g transform="skewX(-20)"><rect class="shine" x="0" y="0" width="140" height="${H}" fill="url(#sh)"/></g>
  </g>
  <text class="ico" x="26" y="47" font-family="${SANS}" font-size="26" font-weight="700" fill="${C.white}">${p.icon}</text>
  <g class="in" style="animation-delay:.1s"><text x="64" y="44" font-family="${SANS}" font-size="19" font-weight="700" fill="${C.pink}">${esc(p.name)}</text></g>
  <g class="in" style="animation-delay:.3s" font-family="${SANS}" font-size="14" fill="${C.cyan}">
    ${lines.map((l, k) => `<text x="24" y="${80 + k * 21}">${esc(l)}</text>`).join("")}
  </g>
  <g class="in" style="animation-delay:.5s"><rect x="${W - 24 - (p.tag.length * 8 + 22)}" y="20" width="${p.tag.length * 8 + 22}" height="22" rx="11" fill="${C.bg2}" stroke="${C.yellow}" stroke-opacity=".5"/>
  <text x="${W - 24 - (p.tag.length * 8 + 22) / 2}" y="35.5" text-anchor="middle" font-family="${SANS}" font-size="12" font-weight="600" fill="${C.yellow}">${esc(p.tag)}</text></g>
</svg>`;
}

/* ---------------------------------------------------------------- footer */
function footer() {
  const W = 1200, H = 150;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thanks for dropping by — mata ne!">
  <defs>
    <linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="${C.pink}"/><stop offset="1" stop-color="#4a4a4a"/></linearGradient>
    ${PETAL_DEF}
  </defs>
  <style>
    .wv{animation:wv linear infinite}
    @keyframes wv{from{transform:translateX(0)}to{transform:translateX(-1200px)}}
    ${PETAL_CSS}
  </style>
  <g opacity=".35"><path class="wv" style="animation-duration:14s" d="M0 80 Q150 50 300 80 T600 80 T900 80 T1200 80 T1500 80 T1800 80 T2100 80 T2400 80 V150 H0Z" fill="url(#w)"/></g>
  <g opacity=".6"><path class="wv" style="animation-duration:9s" d="M0 100 Q150 125 300 100 T600 100 T900 100 T1200 100 T1500 100 T1800 100 T2100 100 T2400 100 V150 H0Z" fill="url(#w)"/></g>
  ${petals(14, W, H, { min: 6, max: 11 })}
  <text x="600" y="58" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="700" fill="${C.white}">Thanks for dropping by <tspan fill="${C.pink}">✿</tspan> またね!</text>
</svg>`;
}

/* ------------------------------------------------------------ stats data */
async function fetchData() {
  if (!TOKEN) return null;
  const query = `query($login:String!){user(login:$login){
    name login followers{totalCount}
    contributionsCollection{totalCommitContributions restrictedContributionsCount totalPullRequestReviewContributions}
    repositoriesContributedTo(first:1,contributionTypes:[COMMIT,ISSUE,PULL_REQUEST,REPOSITORY]){totalCount}
    pullRequests(first:1){totalCount}
    openIssues:issues(states:OPEN){totalCount} closedIssues:issues(states:CLOSED){totalCount}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,orderBy:{direction:DESC,field:STARGAZERS}){
      totalCount nodes{stargazerCount languages(first:10,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
  }}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": LOGIN },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!json.data?.user) throw new Error("GraphQL error: " + JSON.stringify(json.errors || json));
  return json.data.user;
}

// Same rank formula as github-readme-stats
function rank({ commits, prs, issues, reviews, stars, followers }) {
  const exp = (x) => 1 - 2 ** -x, logn = (x) => x / (1 + x);
  const W = { c: 2, p: 3, i: 1, r: 1, s: 4, f: 1 };
  const total = W.c + W.p + W.i + W.r + W.s + W.f;
  const rk = 1 - (W.c * exp(commits / 250) + W.p * exp(prs / 50) + W.i * exp(issues / 25) + W.r * exp(reviews / 2) + W.s * logn(stars / 50) + W.f * logn(followers / 10)) / total;
  const th = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const lv = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
  const pct = rk * 100;
  return { level: lv[th.findIndex((t) => pct <= t)], pct };
}

const ICONS = {
  star: "M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z",
  commit: "M1.643 3.143 .427 1.927A.25.25 0 0 0 0 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.5 6.5 0 1 1-1.18 4.458.75.75 0 1 0-1.493.154 8.001 8.001 0 1 0 1.6-5.684ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z",
  pr: "M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z",
  issue: "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z",
  repo: "M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z",
};

function statsCard(d) {
  const W = 495, H = 195;
  const rows = [
    ["star", "Total Stars Earned", d.stars],
    ["commit", "Total Commits (last year)", d.commits],
    ["pr", "Total PRs", d.prs],
    ["issue", "Total Issues", d.issues],
    ["repo", "Contributed to (last year)", d.contrib],
  ];
  const { level, pct } = d.rank;
  const R = 40, CIRC = 2 * Math.PI * R;
  const off = d.ready ? CIRC * (pct / 100) : CIRC;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.name)}'s GitHub stats">
  <defs>${PETAL_DEF}<clipPath id="cl"><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>
  <style>
    .row{opacity:0;animation:fade .45s ease-in-out forwards}
    @keyframes fade{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
    .ring{stroke-dasharray:${f(CIRC)};stroke-dashoffset:${f(CIRC)};animation:ring 1.4s .3s cubic-bezier(.4,.2,.2,1) forwards;transform:rotate(-90deg);transform-origin:center;transform-box:fill-box}
    @keyframes ring{to{stroke-dashoffset:${f(off)}}}
    .lvl{opacity:0;animation:pop .6s 1.1s ease-out forwards;transform-box:fill-box;transform-origin:center}
    @keyframes pop{0%{opacity:0;transform:scale(.4)}70%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
    .halo{opacity:0;animation:halo 2.4s 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes halo{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(1.35)}}
    ${PETAL_CSS}
  </style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.border}"/>
  <g clip-path="url(#cl)" opacity=".75">${petals(4, W, H, { min: 7, max: 11 })}</g>
  <text x="25" y="38" font-family="${SANS}" font-size="19" font-weight="600" fill="${C.pink}" class="row">${esc(d.name)}'s GitHub Stats</text>
  ${rows.map(([ic, label, val], k) => `
  <g transform="translate(25 ${62 + k * 25})"><g class="row" style="animation-delay:${f(0.15 * (k + 1))}s">
    <svg x="0" y="-13" width="16" height="16" viewBox="0 0 16 16"><path fill="${C.yellow}" d="${ICONS[ic]}"/></svg>
    <text x="25" y="0" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.cyan}">${label}:</text>
    <text x="230" y="0" font-family="${SANS}" font-size="14" font-weight="700" fill="${C.cyan}">${esc(val)}</text>
  </g></g>`).join("")}
  <g transform="translate(400 100)">
    <circle r="${R}" fill="none" stroke="${C.pink}" stroke-opacity=".2" stroke-width="6"/>
    <circle class="halo" r="${R}" fill="none" stroke="${C.pink}" stroke-width="2"/>
    <circle class="ring" r="${R}" fill="none" stroke="${C.pink}" stroke-width="6" stroke-linecap="round"/>
    <text class="lvl" y="1" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="${level.length > 1 ? 24 : 28}" font-weight="800" fill="${C.cyan}">${esc(level)}</text>
  </g>
</svg>`;
}

function langsCard(langs, ready) {
  const W = 400, H = 195;
  const total = langs.reduce((a, l) => a + l.size, 0) || 1;
  let x = 0, bar = "";
  const BW = W - 50;
  langs.forEach((l, k) => {
    const w = (l.size / total) * BW;
    bar += `<rect x="${f(x)}" y="0" width="${f(w + 0.5)}" height="8" fill="${l.color}"/>`;
    x += w;
  });
  const legend = langs.map((l, k) => {
    const col = k % 2, row = Math.floor(k / 2);
    const pct = ((l.size / total) * 100).toFixed(2);
    return `<g transform="translate(${25 + col * 175} ${100 + row * 28})"><g class="row" style="animation-delay:${f(0.5 + 0.12 * k)}s">
      <circle cx="5" cy="-5" r="5" fill="${l.color}"/><text x="16" y="0" font-family="${SANS}" font-size="12.5" font-weight="500" fill="${C.cyan}">${esc(l.name)} ${ready ? pct + "%" : ""}</text></g></g>`;
  }).join("");
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages">
  <defs><clipPath id="bar"><rect width="${BW}" height="8" rx="4"/></clipPath>
  <linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <style>
    .row{opacity:0;animation:fade .45s ease-in-out forwards}
    @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
    .grow{transform:scaleX(0);transform-origin:left;transform-box:fill-box;animation:grow 1.1s .25s cubic-bezier(.4,.2,.2,1) forwards}
    @keyframes grow{to{transform:scaleX(1)}}
    .glint{animation:glint 3.5s 1.6s ease-in-out infinite;transform:translateX(-80px)}
    @keyframes glint{0%{transform:translateX(-80px)}50%,100%{transform:translateX(${BW + 20}px)}}
  </style>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg}" stroke="${C.border}"/>
  <text x="25" y="38" font-family="${SANS}" font-size="19" font-weight="600" fill="${C.pink}" class="row">Most Used Languages</text>
  <g transform="translate(25 62)" clip-path="url(#bar)"><g class="grow">${bar}</g><rect class="glint" width="60" height="8" fill="url(#gl)"/></g>
  ${legend}
</svg>`;
}

/* ------------------------------------------------------------------ main */
function placeholder(why) {
  if (existsSync(join(OUT, "stats.svg"))) return console.log(`• ${why} — kept existing stats`);
  // first run: placeholder cards that the workflow replaces with real numbers
  write("stats.svg", statsCard({ name: "Ananth Krishna J", stars: "…", commits: "…", prs: "…", issues: "…", contrib: "…", rank: { level: "✿", pct: 100 }, ready: false }));
  write("langs.svg", langsCard([{ name: "HTML", size: 4, color: "#ffffff" }, { name: "JavaScript", size: 3, color: "#cfcfcf" }, { name: "CSS", size: 2, color: "#a3a3a3" }, { name: "Python", size: 1, color: "#7a7a7a" }], false));
  console.log(`• ${why} — wrote placeholder stats`);
}
write("hero.svg", hero());
write("typing.svg", typing());
write("footer.svg", footer());
write("stack.svg", stack());
PROJECTS.forEach((p, i) => write(`cards/${p.slug}.svg`, card(p, i)));
console.log("✓ static art written");

try {
  const u = await fetchData();
  if (!u) {
    placeholder("no token");
  } else {
    const repos = u.repositories.nodes;
    const stars = repos.reduce((a, r) => a + r.stargazerCount, 0);
    const commits = u.contributionsCollection.totalCommitContributions + u.contributionsCollection.restrictedContributionsCount;
    const prs = u.pullRequests.totalCount;
    const issues = u.openIssues.totalCount + u.closedIssues.totalCount;
    const reviews = u.contributionsCollection.totalPullRequestReviewContributions;
    const followers = u.followers.totalCount;
    const contrib = u.repositoriesContributedTo.totalCount;
    const map = new Map();
    for (const r of repos) for (const e of r.languages.edges) {
      const m = map.get(e.node.name) || { name: e.node.name, color: e.node.color || "#858585", size: 0 };
      m.size += e.size; map.set(e.node.name, m);
    }
    const langs = [...map.values()].sort((a, b) => b.size - a.size).slice(0, 6);
    const GREYS = ["#ffffff", "#cfcfcf", "#a3a3a3", "#7a7a7a", "#585858", "#3c3c3c"];
    langs.forEach((l, k) => (l.color = GREYS[k]));
    write("stats.svg", statsCard({ name: u.name || u.login, stars, commits, prs, issues, contrib, rank: rank({ commits, prs, issues, reviews, stars, followers }), ready: true }));
    write("langs.svg", langsCard(langs, true));
    console.log(`✓ stats: ★${stars} commits ${commits} PRs ${prs} issues ${issues} contrib ${contrib}; langs ${langs.map((l) => l.name).join(", ")}`);
  }
} catch (e) {
  console.warn("! could not refresh stats:", e.message);
  placeholder("fetch failed");
}
