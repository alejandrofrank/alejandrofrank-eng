// ----------------------------------------------------------------------------
// Page template. Composes the panel modules into the dashboard grid.
// Data lives in content.ts + each panel module; CSS in styles.ts.
// ----------------------------------------------------------------------------

import { SITE, LINKS } from "./content";
import { styles } from "./styles";
import { buildOutcomes } from "./header";
import { BANNER } from "./banner";
import { MOBIUS_CANVAS, MOBIUS_SCRIPT } from "./anim";
import { esc } from "./panels/helpers";
import { PANELS, type Env } from "./panels";

export async function renderPage(env: Env): Promise<string> {
  const outcomes = await buildOutcomes(env);

  // Render panels concurrently; one failure can't take down the page.
  const cards = await Promise.all(
    PANELS.map(async (p) => {
      try {
        return await p.render(env);
      } catch {
        return `<div class="panel" id="${p.key}">
          <div class="panel-head"><h3>${p.title}</h3></div>
          <div class="note">temporarily unavailable</div>
        </div>`;
      }
    })
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${SITE.name} · builder dashboard</title>
<meta name="description" content="${SITE.subtitle}" />
<style>${styles}</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      ${MOBIUS_CANVAS}
      <div class="hero-content">
        <div class="tag">${SITE.name} · ${SITE.location}</div>
        <h1 class="sr-only">${SITE.thesis}</h1>
        <pre class="banner" aria-hidden="true">${esc(BANNER)}</pre>
        <p class="sub">${SITE.subtitle}</p>
        <div class="outcomes">
          ${outcomes
            .map((o) => `<div class="outcome"><b>${o.value}</b><span>${o.label}</span></div>`)
            .join("")}
        </div>
      </div>
    </header>

    <section>
      <div class="sec-head"><h2>Live dashboard</h2><span class="tag">building in public</span></div>
      <div class="grid">
        ${cards.join("")}
      </div>
    </section>

    <footer class="wrap">
      ${LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · ")}
      &nbsp;·&nbsp; v0.1 · deployed on Cloudflare Workers
    </footer>
  </div>
  ${MOBIUS_SCRIPT}
</body>
</html>`;
}
