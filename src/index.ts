// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, panels in panels/.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { renderPage } from "./layout";
import { renderResumePage } from "./resume/page";
import { renderTimelinePage } from "./timeline/page";
import { styles } from "./styles";
import { FAVICON } from "./favicon";
import { FONTS_LINK, DIAMOND } from "./ui";
import type { Env } from "./panels";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
});

app.get("/", async (c) => c.html(await renderPage(c.env, new URL(c.req.url).origin)));
app.get("/resume", (c) => c.html(renderResumePage()));
app.get("/timeline", (c) => c.html(renderTimelinePage()));
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
