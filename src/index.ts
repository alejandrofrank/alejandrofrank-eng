// ----------------------------------------------------------------------------
// App entry — routes only. Page markup lives in layout.ts, data in content.ts.
// ----------------------------------------------------------------------------

import { Hono } from "hono";
import { renderPage } from "./layout";

const app = new Hono();

app.get("/", (c) => c.html(renderPage()));
app.get("/health", (c) => c.json({ ok: true }));

export default app;
