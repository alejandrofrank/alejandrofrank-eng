// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, panels in panels/.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { renderPage } from "./layout";
import { renderResumePage } from "./resume/page";
import { renderTimelinePage } from "./timeline/page";
import { renderLogPage } from "./log";
import { styles } from "./styles";
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
app.get("/log", (c) => c.html(renderLogPage()));
app.get("/health", (c) => c.json({ ok: true }));

app.notFound((c) =>
  c.html(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>404 · not found</title>
<style>${styles}</style>
</head>
<body>
  <div class="wrap" style="padding-top:18vh; text-align:center;">
    <div class="tag">404</div>
    <h1 style="font-size:clamp(24px,5vw,40px);">This route doesn't exist.</h1>
    <p class="sub" style="margin:0 auto;">The wall is never the code — but this URL might be.</p>
    <p style="margin-top:28px;"><a href="/" style="color:var(--accent); text-decoration:none;">‹ back to the dashboard</a></p>
  </div>
</body>
</html>`,
    404
  )
);

export default app;
