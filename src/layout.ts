// ----------------------------------------------------------------------------
// Page template. Takes content + styles and returns the full HTML document.
// Keep markup here; keep data in content.ts and CSS in styles.ts.
// ----------------------------------------------------------------------------

import { SITE, OUTCOMES, PANELS, LINKS } from "./content";
import { styles } from "./styles";

export function renderPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${SITE.name} — builder dashboard</title>
<meta name="description" content="${SITE.subtitle}" />
<style>${styles}</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="tag">${SITE.name} · ${SITE.location}</div>
      <h1>${SITE.thesis}</h1>
      <p class="sub">${SITE.subtitle}</p>
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
      ${LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · ")}
      &nbsp;—&nbsp; v0.1 · deployed on Cloudflare Workers
    </footer>
  </div>
</body>
</html>`;
}
