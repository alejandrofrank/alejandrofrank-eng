// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, panels in panels/.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { renderPage } from "./layout";
import { renderResumePage } from "./resume/page";
import { renderTimelinePage } from "./timeline/page";
import type { Env } from "./panels";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => c.html(await renderPage(c.env)));
app.get("/resume", (c) => c.html(renderResumePage()));
app.get("/timeline", (c) => c.html(renderTimelinePage()));
app.get("/health", (c) => c.json({ ok: true }));

export default app;
