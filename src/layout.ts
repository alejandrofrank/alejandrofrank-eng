// ----------------------------------------------------------------------------
// Page template. Composes the panel modules into the dashboard grid.
// Data lives in content.ts + each panel module; CSS in styles.ts; the card,
// label and media markup in ui.ts.
// ----------------------------------------------------------------------------

import { esc } from "./panels/helpers";
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

const CONTACT_ICONS: Record<string, string> = {
  X: '<path d="M4 3h4.5L20 21h-4.5L4 3Z"/><path d="m20 3-7 8M4 21l7-8"/>',
  LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.01M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
  Email: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  GitHub: '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.1-.3 6.4-1.5 6.4-7A5.5 5.5 0 0 0 19.4 6c.2-.9.2-2.1-.2-3.2 0 0-1.2-.4-3.8 1.4a13 13 0 0 0-6.8 0C6 2.4 4.8 2.8 4.8 2.8A5.5 5.5 0 0 0 4.6 6 5.5 5.5 0 0 0 3 9.5c0 5.5 3.3 6.7 6.4 7-.5.5-.6 1.2-.5 2.1V22"/>',
};
function navLink(l: (typeof LINKS)[number]): string {
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (CONTACT_ICONS[l.label] || '') + '</svg>';
  const label = icon + '<span>' + esc(l.label) + '</span>';
  if (l.href.startsWith("mailto:")) {
    const email = l.href.slice("mailto:".length);
    return '<details class="email-pop"><summary class="contact-button">' + label + '</summary><div class="email-box on-cream chamfer"><a href="' + l.href + '">' + esc(email) + '</a><button type="button" class="email-copy chamfer" data-email="' + esc(email) + '">Copy</button></div></details>';
  }
  return '<a class="contact-button" href="' + l.href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
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
<meta name="theme-color" content="#192822" />
${FAVICON}
${FONTS_LINK}
<title>${SITE.name} · Engineer based in Madrid</title>
<meta name="description" content="Engineer based in Madrid" />
<link rel="canonical" href="${origin}/" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${SITE.name}" />
<meta property="og:description" content="Engineer based in Madrid" />
<meta property="og:url" content="${origin}/" />
<meta property="og:image" content="${origin}/og-forest.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Alejandro Frank — Engineer based in Madrid, over a teal and warm orange gradient" />
<meta name="twitter:title" content="Alejandro Frank" />
<meta name="twitter:description" content="Engineer based in Madrid" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${origin}/og-forest.png" />
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
          <div class="project-list">${PANELS.map(p => '<details class="project-dropdown" name="project"><summary>' + esc(p.title) + '</summary><div class="project-details">' + cards[PANELS.indexOf(p)] + '</div></details>').join('')}</div>
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
