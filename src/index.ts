// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, panels in panels/.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { renderPage } from "./layout";
import { renderProjectIndex, renderProjectPage } from "./projects/page";
import { renderAmbientCalendar } from "./panels/github";
import { renderPlayPage } from "./play/page";
import { renderArcadeHome } from "./play/home";
import { renderResumePage } from "./resume/page";
import { renderTimelinePage } from "./timeline/page";
import { APPEARANCE_COOKIE, isPortfolioView, portfolioHome, type PortfolioView } from "./appearance";
import { styles } from "./styles";
import { FAVICON } from "./favicon";
import { FONTS_LINK, DIAMOND } from "./ui";
import type { Env } from "./panels";

const app = new Hono<{ Bindings: Env; Variables: { view: PortfolioView } }>();

app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});

app.use('*', async (c, next) => {
  const path = c.req.path;
  const saved = getCookie(c, APPEARANCE_COOKIE);
  const fallback = path === '/play' ? 'arcade' : path === '/tech' || path.startsWith('/projects/') ? 'tech' : 'original';
  const view = isPortfolioView(saved) ? saved : fallback;
  c.set('view', view);
  const isPage = ['/', '/tech', '/play', '/timeline', '/resume'].includes(path) || path.startsWith('/projects/');
  if (isPage && (c.req.method === 'GET' || c.req.method === 'HEAD')) {
    // HTML depends on a browser preference; never serve another visitor's skin.
    c.header('Cache-Control', 'private, no-store');
    c.header('Vary', 'Cookie');
    const choice = c.req.query('view');
    if (isPortfolioView(choice) || !isPortfolioView(saved)) {
      setCookie(c, APPEARANCE_COOKIE, isPortfolioView(choice) ? choice : view, {
        path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'Lax',
        secure: new URL(c.req.url).protocol === 'https:',
      });
    }
    if (choice !== undefined) {
      // Consume the choice once. Back, bookmarks and ordinary navigation then
      // use the latest preference rather than an old appearance in the URL.
      const url = new URL(c.req.url);
      url.searchParams.delete('view');
      return c.redirect(url.pathname + url.search, 302);
    }
  }
  await next();
});

app.get("/", async (c) => {
  const origin = new URL(c.req.url).origin;
  if (c.get('view') === 'arcade') return c.html(await renderArcadeHome(c.env, origin));
  if (c.get('view') === 'original') return c.html(await renderPage(c.env, origin));
  return c.redirect(portfolioHome('tech'), 302);
});
app.get("/tech", async (c) => c.html(renderProjectIndex(new URL(c.req.url).origin, await renderAmbientCalendar(c.env), c.get('view'))));
app.get("/projects/:slug", (c) => {
  const page = renderProjectPage(c.req.param('slug'), new URL(c.req.url).origin, c.get('view'));
  return page ? c.html(page) : c.notFound();
});
app.get("/resume", (c) => c.html(renderResumePage(c.get('view'))));
app.get("/play", (c) => c.html(renderPlayPage(new URL(c.req.url).origin, c.get('view'))));
app.get("/timeline", (c) => c.html(renderTimelinePage(c.get('view'))));
app.get("/health", (c) => c.json({ ok: true }));

app.notFound((c) =>
  c.html(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#2b2b29" />
${FAVICON}
${FONTS_LINK}
<title>404 · not found</title>
<style>${styles}</style>
</head>
<body>
  <div class="wrap narrow" style="padding-top:16vh;">
    <div class="sec-label">${DIAMOND}<span>404</span><span class="leader"></span></div>
    <h1 class="page-h1">This route doesn't exist.</h1>
    <p class="page-lede">The wall is never the code — but this URL might be.</p>
    <a class="btn secondary chamfer" href="/">← back to the dashboard</a>
  </div>
</body>
</html>`,
    404
  )
);

export default app;
