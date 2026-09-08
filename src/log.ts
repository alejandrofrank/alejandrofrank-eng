// ----------------------------------------------------------------------------
// /log — the site's own changelog. The build-in-public journal: every entry is
// a shipped change to this site. Data lives in content.ts (CHANGELOG).
// ----------------------------------------------------------------------------

import { styles } from "./styles";
import { FAVICON } from "./favicon";
import { FONTS_LINK, sectionLabel, idx } from "./ui";
import { SITE, CHANGELOG } from "./content";
import { esc } from "./panels/helpers";

const LOG_STYLES = `
  .log { list-style: none; margin: 0; padding: 0 0 72px; display: grid; gap: 10px; }
  .log-item { padding: 16px 16px 18px; }
  .log-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px; }
  .log-date { font: 500 10px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .log-title { margin: 0 0 6px; font-size: 19px; line-height: 1.15; letter-spacing: -0.02em; }
  .log-blurb { color: var(--muted); font-size: 13.5px; line-height: 1.6; max-width: 66ch; margin: 0; }
`;

export function renderLogPage(): string {
  const total = CHANGELOG.length;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#2b2b29" />
${FAVICON}
${FONTS_LINK}
<title>${SITE.name} · build log</title>
<meta name="description" content="Changelog of this site — building in public, one shipped change at a time." />
<style>${styles}${LOG_STYLES}</style>
</head>
<body>
  <div class="wrap narrow">
    <nav class="subnav"><a href="/">← dashboard</a></nav>
    ${sectionLabel("Build log", `${total} entries`)}
    <h1 class="page-h1">Build log</h1>
    <p class="page-lede">The site, building itself in public. Every entry is a shipped change.</p>
    <ol class="log">
      ${CHANGELOG.map(
        (e, i) => `<li class="log-item on-cream chamfer rise" style="--i:${i}">
        <div class="log-top"><span class="log-date">${esc(e.date)}</span><span class="card-idx">${idx(total - i)}</span></div>
        <h2 class="log-title">${esc(e.title)}</h2>
        <p class="log-blurb">${esc(e.blurb)}</p>
      </li>`
      ).join("")}
    </ol>
  </div>
</body>
</html>`;
}
