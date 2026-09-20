// ----------------------------------------------------------------------------
// Page template. Composes the panel modules into the dashboard grid.
// Data lives in content.ts + each panel module; CSS in styles.ts; the card,
// label and media markup in ui.ts.
// ----------------------------------------------------------------------------

import { SITE, LINKS } from "./content";
import { styles } from "./styles";
import { buildOutcomes } from "./header";
import { FAVICON } from "./favicon";
import { FONTS_LINK, DIAMOND, sectionLabel, card } from "./ui";
import { waveMarkup, waveScript } from "./waves";
import { personalStyles } from "./personal-styles";
import { PANELS, type Env, type Slot } from "./panels";

/**
 * Where each panel lands in the two-column grid decides whether it gets the
 * divider node on its right seam: only a single-column card in the left
 * column, with a single-column neighbour to its right.
 */
function slots(): Slot[] {
  let col = 0;
  return PANELS.map((p, i) => {
    const next = PANELS[i + 1];
    let node = false;
    if (p.span === 2) {
      col = 0;
    } else {
      node = col === 0 && !!next && next.span !== 2;
      col = col === 0 ? 1 : 0;
    }
    return { n: i + 1, node };
  });
}

function navLink(l: (typeof LINKS)[number]): string {
  const ext = l.href.startsWith("http");
  const attrs = ext ? ' target="_blank" rel="noopener noreferrer"' : "";
  if (l.cta) {
    // Same chamfered button for both; the arrow turns diagonal on the
    // secondary because it leaves the site.
    const cls = l.cta === "primary" ? "btn primary chamfer" : "btn secondary chamfer";
    const arrow = l.cta === "primary" ? "→" : "↗";
    return `<a class="${cls}" href="${l.href}"${attrs}>${l.label} <span class="cta-arrow" aria-hidden="true">${arrow}</span></a>`;
  }
  if (l.href.startsWith("mailto:")) {
    const email = l.href.slice("mailto:".length);
    return `<details class="email-pop">
          <summary>${l.label}</summary>
          <div class="email-box on-cream chamfer">
            <a href="${l.href}">${email}</a>
            <button type="button" class="email-copy chamfer" data-email="${email}">copy</button>
          </div>
        </details>`;
  }
  return `<a href="${l.href}"${attrs}>${l.label}</a>`;
}

export async function renderPage(env: Env, origin: string): Promise<string> {
  const placed = slots();

  // Outcomes + all panels fetch concurrently; one failure can't take down the page.
  const [outcomes, cards] = await Promise.all([
    buildOutcomes(env),
    Promise.all(
      PANELS.map(async (p, i) => {
        try {
          return await p.render(env, placed[i]);
        } catch {
          return card({
            key: p.key,
            title: p.title,
            n: placed[i].n,
            node: placed[i].node,
            span2: p.span === 2,
            body: `<div class="note">temporarily unavailable</div>`,
            foot: `<span class="badge">offline</span>`,
          });
        }
      })
    ),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#f5f6fa" />
${FAVICON}
${FONTS_LINK}
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
<style>${styles}${personalStyles}</style>
</head>
<body class="personal">
  <div class="wrap">
    <nav class="topnav">
      <a class="topnav-brand" href="/">${SITE.name}</a>
      <div class="topnav-links">
        ${LINKS.map(navLink).join("")}
      </div>
    </nav>

    <header class="hero">
      <div class="hero-copy">
        <div class="hero-eyebrow label">${DIAMOND}<span>${SITE.name} — ${SITE.location}</span></div>
        <h1>Complex problems.<br /><em>Working systems.</em></h1>
        <p class="sub">${SITE.subtitle}</p>
        <div class="hero-actions"><a href="#bakiano">What I’m building ↗</a><a href="/timeline">Explore my experience →</a></div>
      </div>
      ${waveMarkup}
    </header>

    <div class="outcomes">
      ${outcomes
        .map(
          (o, i) =>
            `<div class="outcome on-cream chamfer rise" style="--i:${i}"><span class="outcome-idx">${String(i + 1).padStart(2, "0")}</span><b>${o.value}</b><span class="lab">${o.label}</span></div>`
        )
        .join("")}
    </div>

    <section class="dash">
      ${sectionLabel("Live dashboard", "building in public")}
      <div class="grid">
        ${cards.join("")}
      </div>
    </section>

    <footer class="site">
      <span>${SITE.name}</span><span class="sep">·</span><span>v0.2</span><span class="sep">·</span><a href="/log">build log</a><span class="sep">·</span><span>deployed on Cloudflare Workers</span>
    </footer>
  </div>
  ${waveScript}
  <script>
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.email-copy') : null;
    if (!b) return;
    var email = b.getAttribute('data-email');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(function () {
        var prev = b.textContent; b.textContent = 'copied';
        setTimeout(function () { b.textContent = prev; }, 1200);
      });
    }
  });
  </script>
</body>
</html>`;
}
