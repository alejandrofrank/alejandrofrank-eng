// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, panels in panels/.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { renderPage } from "./layout";
import type { Env } from "./panels";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => c.html(await renderPage(c.env)));
app.get("/health", (c) => c.json({ ok: true }));

export default app;
