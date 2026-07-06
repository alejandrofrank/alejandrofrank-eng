// ----------------------------------------------------------------------------
// Page template. Composes the panel modules into the dashboard grid.
// Data lives in content.ts + each panel module; CSS in styles.ts.
// ----------------------------------------------------------------------------

import { SITE, LINKS } from "./content";
import { styles } from "./styles";
import { buildOutcomes } from "./header";
import { BANNER } from "./banner";
import { MOBIUS_CANVAS, MOBIUS_SCRIPT, RAIN_CANVAS, RAIN_SCRIPT } from "./anim";
import { FAVICON } from "./favicon";
import { esc } from "./panels/helpers";
import { PANELS, type Env } from "./panels";

export async function renderPage(env: Env, origin: string): Promise<string> {
  // Outcomes + all panels fetch concurrently; one failure can't take down the page.
  const [outcomes, cards] = await Promise.all([
    buildOutcomes(env),
    Promise.all(
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
    ),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0a0a0b" />
${FAVICON}
<title>${SITE.name} · builder dashboard</title>
<meta name="description" content="${SITE.subtitle}" />
<link rel="canonical" href="${origin}/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${SITE.name} · builder dashboard" />
<meta property="og:description" content="${SITE.subtitle}" />
<meta property="og:url" content="${origin}/" />
<meta property="og:image" content="${origin}/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${origin}/og.png" />
<style>${styles}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap">
    <nav class="topnav">
      <a class="topnav-brand" href="/">${SITE.name}</a>
      <div class="topnav-links">
        ${LINKS.map((l) => {
          if (l.href.startsWith("mailto:")) {
            const email = l.href.slice("mailto:".length);
            return `<details class="email-pop">
              <summary>${l.label}</summary>
              <div class="email-box">
                <a href="${l.href}">${email}</a>
                <button type="button" class="email-copy" data-email="${email}">copy</button>
              </div>
            </details>`;
          }
          const ext = l.href.startsWith("http");
          const attrs = ext ? ' target="_blank" rel="noopener noreferrer"' : "";
          return `<a href="${l.href}"${attrs}>${l.label}</a>`;
        }).join("")}
      </div>
    </nav>
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
      ${SITE.name} · v0.1 · <a href="/log">build log</a> · deployed on Cloudflare Workers
    </footer>
  </div>
  ${RAIN_SCRIPT}
  ${MOBIUS_SCRIPT}
  <script>
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.email-copy') : null;
    if (!b) return;
    var email = b.getAttribute('data-email');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(function () {
        var prev = b.textContent; b.textContent = 'copied!';
        setTimeout(function () { b.textContent = prev; }, 1200);
      });
    }
  });
  </script>
</body>
</html>`;
}
