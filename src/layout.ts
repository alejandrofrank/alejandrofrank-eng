// ----------------------------------------------------------------------------
// Page template. Composes the panel modules into the dashboard grid.
// Data lives in content.ts + each panel module; CSS in styles.ts; the card,
// label and media markup in ui.ts.
// ----------------------------------------------------------------------------

import { SITE, LINKS } from "./content";
import { styles } from "./styles";
import { buildOutcomes } from "./header";
import { FAVICON } from "./favicon";
import { FONTS_LINK, card } from "./ui";
import { gradientMarkup } from "./gradient";
import { personalStyles } from "./personal-styles";
import { PANELS, type Env, type Slot } from "./panels";
import { renderAmbientCalendar } from "./panels/github";

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
    const cls = l.cta === "primary" ? "btn primary chamfer" : "btn secondary chamfer";
    return `<a class="${cls}" href="${l.href}"${attrs}>${l.label}</a>`;
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
  const [outcomes, cards, calendar] = await Promise.all([
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
    renderAmbientCalendar(env),
  ]);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#fff4ed" />
${FAVICON}
${FONTS_LINK}
<title>${SITE.name} · Engineer based in Madrid</title>
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
  ${gradientMarkup}
  <div class="wrap">
    <main>
    <header class="human-hero">
      <p class="human-location">${SITE.name}</p>
      <h1>Engineer based in Madrid</h1>
    </header>
    <div class="explore" aria-label="Explore more">
      <details class="reveal" name="explore" id="about">
        <summary>About me</summary>
        <section class="reveal-body">
          <h2>A little more about me.</h2>
          <p class="about-copy">${SITE.subtitle}</p>
          <div class="outcomes">${outcomes.map(o => '<div class="outcome on-cream"><b>' + o.value + '</b><span class="lab">' + o.label + '</span></div>').join('')}</div>
          <a class="text-link" href="/timeline">Explore my experience →</a>
        </section>
      </details>
      <details class="reveal" name="explore" id="projects">
        <summary>Projects</summary>
        <section class="reveal-body projects-body">
          <h2>Things I’m building.</h2>
          <div class="grid">${[...cards.filter((_,i) => ['bakiano','jev'].includes(PANELS[i].key)), ...cards.filter((_,i) => !['bakiano','jev'].includes(PANELS[i].key))].join('')}</div>
        </section>
      </details>
      <a class="explore-link" href="/timeline">Experience</a>
      <details class="reveal" name="explore" id="contact">
        <summary>Say hello</summary>
        <section class="reveal-body"><h2>Let’s talk.</h2><div class="contact-links">${LINKS.filter(l=>!l.href.startsWith('/')).map(navLink).join('')}</div></section>
      </details>
      ${calendar}
    </div>
    </main>

    <footer class="site">
      <span>Made by a human (Not really, made by AI)</span>
    </footer>
  </div>

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
