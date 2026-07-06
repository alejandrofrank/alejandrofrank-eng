// ----------------------------------------------------------------------------
// /log — the site's own changelog. The build-in-public journal: every entry is
// a shipped change to this site. Data lives in content.ts (CHANGELOG).
// ----------------------------------------------------------------------------

import { styles } from "./styles";
import { FAVICON } from "./favicon";
import { RAIN_CANVAS, RAIN_SCRIPT } from "./anim";
import { SITE, CHANGELOG } from "./content";
import { esc } from "./panels/helpers";

const LOG_STYLES = `
  .log-nav { margin: 26px 0; }
  .log-nav a { color: var(--muted); text-decoration: none; font-size: 13px; }
  .log-nav a:hover { color: var(--accent); }
  .log-h1 { font-size: clamp(24px, 4vw, 32px); margin: 0 0 5px; letter-spacing: -0.02em; }
  .log-lede { color: var(--muted); font-size: 14px; margin: 0 0 34px; }
  .log { list-style: none; margin: 0; padding: 0 0 80px; position: relative; }
  .log::before { content: ""; position: absolute; left: 3px; top: 6px; bottom: 6px; width: 1px; background: var(--line); }
  .log-item { position: relative; padding: 0 0 30px 26px; }
  .log-item::before { content: ""; position: absolute; left: 0; top: 7px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px rgba(110,231,183,.5); }
  .log-date { color: var(--muted); font-size: 12px; letter-spacing: .04em; }
  .log-title { color: var(--fg); font-size: 16px; font-weight: 600; margin: 3px 0 5px; }
  .log-blurb { color: var(--muted); font-size: 13.5px; line-height: 1.6; max-width: 64ch; margin: 0; }
`;

export function renderLogPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0a0a0b" />
${FAVICON}
<title>${SITE.name} · build log</title>
<meta name="description" content="Changelog of this site — building in public, one shipped change at a time." />
<style>${styles}${LOG_STYLES}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap" style="max-width: 760px;">
    <nav class="log-nav"><a href="/">‹ dashboard</a></nav>
    <h1 class="log-h1">Build log</h1>
    <p class="log-lede">The site, building itself in public. Every entry is a shipped change.</p>
    <ul class="log">
      ${CHANGELOG.map(
        (e) => `<li class="log-item">
        <div class="log-date">${esc(e.date)}</div>
        <div class="log-title">${esc(e.title)}</div>
        <p class="log-blurb">${esc(e.blurb)}</p>
      </li>`
      ).join("")}
    </ul>
  </div>
  ${RAIN_SCRIPT}
</body>
</html>`;
}
