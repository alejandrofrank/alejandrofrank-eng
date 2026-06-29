import { Hono } from "hono";

const app = new Hono();

// --- Content (edit me) -------------------------------------------------------

const THESIS = "The wall is never the code.";
const SUBTITLE =
  "Forward-deployed engineer. I take ambiguous problems and ship the ambitious version — live systems other people can depend on.";

// Outcomes header — frames the live activity below as "senior builder in motion".
const OUTCOMES = [
  { value: "7 yrs", label: "shipping production systems" },
  { value: "8+", label: "enterprise clients" },
  { value: "AI + data", label: "agents, RAG, MCP, pipelines" },
  { value: "OSS", label: "MCP server, in the ecosystem" },
];

// Dashboard panels — each becomes a live integration. status: "soon" | "live".
const PANELS = [
  { key: "github", title: "GitHub activity", note: "commits/day · streak · latest ship", status: "soon" },
  { key: "leetcode", title: "LeetCode", note: "solved · difficulty · streak", status: "soon" },
  { key: "shipping", title: "Shipping log", note: "projects & deploys timeline", status: "soon" },
  { key: "status", title: "Service status", note: "are my deployed systems up?", status: "soon" },
  { key: "x", title: "X / writing", note: "latest posts · cadence", status: "soon" },
  { key: "hackathons", title: "Hackathons", note: "events & builds", status: "soon" },
];

// --- Page --------------------------------------------------------------------

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Alejandro Frank — builder dashboard</title>
<meta name="description" content="${SUBTITLE}" />
<style>
  :root {
    --bg: #0a0a0b; --panel: #141417; --line: #232327;
    --fg: #ededef; --muted: #8a8a93; --accent: #6ee7b7;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  header.hero { padding: 96px 0 56px; }
  .tag { color: var(--accent); font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.1; margin: 14px 0 18px; letter-spacing: -0.02em; }
  .sub { color: var(--muted); max-width: 60ch; font-size: 17px; }
  .outcomes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 44px 0 0; }
  .outcome { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
  .outcome b { display: block; font-size: 22px; color: var(--fg); }
  .outcome span { color: var(--muted); font-size: 12px; }
  section { padding: 24px 0 80px; }
  .sec-head { display: flex; align-items: baseline; justify-content: space-between; margin: 0 0 18px; }
  .sec-head h2 { font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 0; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; min-height: 130px; display: flex; flex-direction: column; }
  .panel h3 { margin: 0 0 4px; font-size: 16px; }
  .panel .note { color: var(--muted); font-size: 13px; flex: 1; }
  .badge { align-self: flex-start; margin-top: 14px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; }
  footer { color: var(--muted); font-size: 13px; padding: 0 0 60px; }
  footer a { color: var(--accent); text-decoration: none; }
  @media (max-width: 640px) { .outcomes, .grid { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="tag">Alejandro Frank · Madrid</div>
      <h1>${THESIS}</h1>
      <p class="sub">${SUBTITLE}</p>
      <div class="outcomes">
        ${OUTCOMES.map(
          (o) => `<div class="outcome"><b>${o.value}</b><span>${o.label}</span></div>`
        ).join("")}
      </div>
    </header>

    <section>
      <div class="sec-head"><h2>Live dashboard</h2><span class="tag">building in public</span></div>
      <div class="grid">
        ${PANELS.map(
          (p) => `<div class="panel" id="${p.key}">
            <h3>${p.title}</h3>
            <div class="note">${p.note}</div>
            <span class="badge">${p.status === "live" ? "● live" : "coming soon"}</span>
          </div>`
        ).join("")}
      </div>
    </section>

    <footer class="wrap">
      <a href="https://github.com/alejandrofrank">GitHub</a> ·
      <a href="https://www.linkedin.com/in/alejandrofrank">LinkedIn</a> ·
      <a href="mailto:alejandrofranks@gmail.com">Email</a>
      &nbsp;—&nbsp; v0.1 · deployed on Cloudflare Workers
    </footer>
  </div>
</body>
</html>`;

app.get("/", (c) => c.html(page));
app.get("/health", (c) => c.json({ ok: true }));

export default app;
